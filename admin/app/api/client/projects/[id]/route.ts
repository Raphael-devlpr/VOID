import { NextRequest, NextResponse } from 'next/server';
import { requireClientAuth } from '@/lib/clientAuth';
import { supabase } from '@/lib/supabase';

// GET project details with history and notes
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClientAuth();
    const { id } = await context.params;

    // Fetch project and verify it belongs to the client
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('client_id', session.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch status history
    const { data: history } = await supabase
      .from('project_status_history')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    // Fetch client notes
    const { data: notes } = await supabase
      .from('client_notes')
      .select('*')
      .eq('project_id', id)
      .eq('client_id', session.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      project,
      history: history || [],
      notes: notes || [],
    }, { status: 200 });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// POST - Add a note to a project
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClientAuth();
    const { id } = await context.params;
    const body = await request.json();
    const { note } = body;

    if (!note || !note.trim()) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
    }

    // Verify project belongs to client
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('client_id', session.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Insert note
    const { data: newNote, error } = await supabase
      .from('client_notes')
      .insert({
        project_id: id,
        client_id: session.id,
        note: note.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error('Add note error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
