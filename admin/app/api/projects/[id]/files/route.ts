import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET /api/projects/[id]/files - Get all files for a project
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

// POST /api/projects/[id]/files - Upload a file via cPanel
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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;
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
    uploadFormData.append('file_type', fileType || 'documents');
    uploadFormData.append('uploaded_by', 'admin');
    uploadFormData.append('upload_key', process.env.FILE_UPLOAD_KEY || '');

    // Upload to cPanel via PHP script
    const uploadResponse = await fetch('https://voidtechsolutions.co.za/upload-file.php', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to upload file' },
        { status: uploadResponse.status }
      );
    }

    const uploadResult = await uploadResponse.json();

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('project_files')
      .insert({
        project_id: id,
        file_name: file.name,
        file_url: uploadResult.file_url,
        file_type: fileType || 'document',
        file_size: file.size,
        uploaded_by: 'admin',
        uploaded_by_id: session.adminId,
        description,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ file: fileRecord }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
