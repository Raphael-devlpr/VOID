import { NextRequest, NextResponse } from 'next/server';
import { requireClientAuth } from '@/lib/clientAuth';
import { supabase } from '@/lib/supabase';

// GET client dashboard data - projects and notes
export async function GET(request: NextRequest) {
  try {
    const session = await requireClientAuth();

    // Fetch client's projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', session.id)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Fetch client notes for their projects
    const projectIds = projects?.map(p => p.id) || [];
    let notes: any[] = [];
    
    if (projectIds.length > 0) {
      const { data: notesData, error: notesError } = await supabase
        .from('client_notes')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      if (!notesError) {
        notes = notesData || [];
      }
    }

    return NextResponse.json({
      projects: projects || [],
      notes: notes,
      client: {
        name: session.name,
        email: session.email,
        company: session.company,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Client dashboard error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
