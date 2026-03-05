import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireClientAuth } from '@/lib/clientAuth';

// POST /api/client-portal/projects/[id]/files - Client file upload
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClientAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Verify client has access to this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', id)
      .single();

    if (projectError || !project || project.client_id !== session.id) {
      return NextResponse.json(
        { error: 'Access denied to this project' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Prepare form data for PHP upload
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('project_id', id);
    uploadFormData.append('file_type', 'client-uploads');
    uploadFormData.append('uploaded_by', 'client');
    uploadFormData.append('upload_key', process.env.FILE_UPLOAD_KEY || '');

    // Upload to cPanel via PHP script
    const uploadResponse = await fetch('https://voidtechsolutions.co.za/upload-file.php', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('PHP upload failed:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: 'Upload failed: ' + errorText.substring(0, 100) };
      }
      return NextResponse.json(
        { error: errorData.error || 'Failed to upload file' },
        { status: uploadResponse.status }
      );
    }

    const uploadResult = await uploadResponse.json();

    // Save file metadata to database
    // Note: uploaded_by_id is set to null for clients since client IDs are integers, not UUIDs
    const { data: fileRecord, error: dbError } = await supabase
      .from('project_files')
      .insert({
        project_id: parseInt(id),
        file_name: file.name,
        file_url: uploadResult.file_url,
        file_type: 'client-upload',
        file_size: file.size,
        uploaded_by: 'client',
        uploaded_by_id: null, // Client IDs are integers, not UUIDs
        description,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error saving file metadata:', dbError);
      throw dbError;
    }

    return NextResponse.json({ file: fileRecord }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// GET /api/client-portal/projects/[id]/files - Get files for client
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClientAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Verify client has access to this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', id)
      .single();

    if (projectError || !project || project.client_id !== session.id) {
      return NextResponse.json(
        { error: 'Access denied to this project' },
        { status: 403 }
      );
    }

    const { data: files, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
