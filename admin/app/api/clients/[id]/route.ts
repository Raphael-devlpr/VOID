import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// GET single client
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get client's projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, project_name, status')
      .eq('client_id', id);

    // Remove password hash
    const { password_hash, ...sanitizedClient } = client;

    return NextResponse.json({
      client: sanitizedClient,
      projects: projects || [],
    }, { status: 200 });
  } catch (error) {
    console.error('Get client error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// PUT update client
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { email, password, name, company, phone, is_active } = body;

    const updateData: any = {
      name,
      company: company || null,
      phone: phone || null,
      is_active: is_active !== undefined ? is_active : true,
    };

    // Only update email if changed
    if (email) {
      updateData.email = email.toLowerCase();
    }

    // Only update password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }

    // Remove password hash
    const { password_hash, ...sanitizedClient } = client;

    return NextResponse.json({ client: sanitizedClient }, { status: 200 });
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// DELETE client
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Check if client has projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('client_id', id);

    if (projects && projects.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with active projects. Remove client from projects first.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
