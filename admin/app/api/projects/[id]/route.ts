import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/**
 * API Route: /api/projects/[id]
 * Next.js 16 Dynamic Route Handler with Async Params
 * Updated: 2026-03-03
 * Build: v2
 */

// GET single project - Next.js 16 requires async params
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract project ID from async params
    const { id } = await context.params;

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch status history
    const { data: history, error: historyError } = await supabase
      .from('project_status_history')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      project,
      history: history || [],
    }, { status: 200 });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// PUT update project - Next.js 16 requires async params
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract project ID from async params
    const { id } = await context.params;
    const body = await request.json();
    const {
      client_name,
      client_email,
      client_phone,
      project_name,
      project_type,
      status,
      notes,
      start_date,
      due_date,
    } = body;

    // Get current project to check status change
    const { data: currentProject } = await supabase
      .from('projects')
      .select('status')
      .eq('id', id)
      .single();

    // Update project
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update({
        client_name,
        client_email,
        client_phone: client_phone || null,
        project_name,
        project_type,
        status,
        notes: notes || null,
        start_date: start_date || null,
        due_date: due_date || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update project error:', updateError);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    // If status changed, add to history
    if (currentProject && currentProject.status !== status) {
      await supabase.from('project_status_history').insert({
        project_id: id,
        status,
        note: `Status changed from ${currentProject.status} to ${status}`,
      });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// DELETE project - Next.js 16 requires async params
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract project ID from async params
    const { id } = await context.params;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete project error:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
