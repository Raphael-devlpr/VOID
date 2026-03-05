import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireClientAuth } from '@/lib/clientAuth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClientAuth();
    const { id } = await context.params;
    const projectId = id;

    // Verify the client owns this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, client_id')
      .eq('id', projectId)
      .eq('client_id', session.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch meetings for this project
    const { data: meetings, error: meetingsError } = await supabase
      .from('project_meetings')
      .select('*')
      .eq('project_id', projectId)
      .order('meeting_date', { ascending: true });

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return NextResponse.json(
        { error: 'Failed to fetch meetings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ meetings: meetings || [] });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in GET /api/client-portal/projects/[id]/meetings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
