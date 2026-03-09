import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { sendEmail, newFileUploadedEmail } from '@/lib/email';

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
    const { data: fileRecord, error: dbError } = await supabase
      .from('project_files')
      .insert({
        project_id: parseInt(id),
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

    if (dbError) {
      console.error('Database error saving file metadata:', dbError);
      throw dbError;
    }

    // Get project and client info for email notification
    const { data: project } = await supabase
      .from('projects')
      .select('project_name, client_name, client_email')
      .eq('id', id)
      .single();

    // Send email notification to client
    if (project && project.client_email) {
      const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://voidtechsolutions.vercel.app'}/client/projects/${id}`;
      const emailTemplate = newFileUploadedEmail(
        project.client_name,
        project.project_name,
        file.name,
        fileType || 'document',
        portalUrl
      );
      
      // Send email (non-blocking)
      sendEmail({
        to: project.client_email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      }).catch(err => console.error('Failed to send file upload email:', err));
    }

    return NextResponse.json({ file: fileRecord }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
