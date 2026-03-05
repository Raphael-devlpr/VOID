import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET /api/projects/[id]/meetings - Get all meetings for a project
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const { data: meetings, error } = await supabase
      .from('project_meetings')
      .select('*')
      .eq('project_id', id)
      .order('meeting_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ meetings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

// POST /api/projects/[id]/meetings - Create a new meeting
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { title, description, meeting_date, duration_minutes, meeting_link, meeting_type, status } = body;

    if (!title || !meeting_date) {
      return NextResponse.json(
        { error: 'Title and meeting date are required' },
        { status: 400 }
      );
    }

    const { data: meeting, error } = await supabase
      .from('project_meetings')
      .insert({
        project_id: id,
        title,
        description,
        meeting_date,
        duration_minutes: duration_minutes || 60,
        meeting_link,
        meeting_type: meeting_type || 'online',
        status: status || 'scheduled',
        created_by: session.adminId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
