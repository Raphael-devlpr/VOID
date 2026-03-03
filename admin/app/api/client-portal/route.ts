import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (!email || !id) {
      return NextResponse.json(
        { error: 'Email and project ID are required' },
        { status: 400 }
      );
    }

    // Fetch project matching both email and ID
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('client_email', email)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
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
    console.error('Client portal error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
