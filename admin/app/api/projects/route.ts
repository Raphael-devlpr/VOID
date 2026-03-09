import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { sendEmail, newProjectAssignedEmail } from '@/lib/email';

// GET all projects
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch projects error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// POST create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      client_id,
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

    // Validate required fields
    if (!client_name || !client_email || !project_name) {
      return NextResponse.json(
        { error: 'Client name, email, and project name are required' },
        { status: 400 }
      );
    }

    // Insert project
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        client_id: client_id || null,
        client_name,
        client_email,
        client_phone: client_phone || null,
        project_name,
        project_type: project_type || 'website',
        status: status || 'pending',
        notes: notes || null,
        start_date: start_date || null,
        due_date: due_date || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert project error:', insertError);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // Create initial status history
    await supabase.from('project_status_history').insert({
      project_id: project.id,
      status: project.status,
      note: 'Project created',
    });

    // Send email notification to client about new project
    if (client_email) {
      const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://voidtechsolutions.vercel.app'}/client/projects/${project.id}`;
      const emailTemplate = newProjectAssignedEmail(
        client_name,
        project_name,
        notes || `We're excited to work on your ${project_type} project!`,
        portalUrl
      );
      
      // Send email (non-blocking)
      sendEmail({
        to: client_email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      }).catch(err => console.error('Failed to send new project email:', err));
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
