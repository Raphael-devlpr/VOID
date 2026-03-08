import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { getClientSession } from '@/lib/clientAuth';

// GET /api/files/[id]/download - Download a file with validation
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check for either admin or client authentication
    const adminSession = await getSession();
    const clientSession = await getClientSession();
    
    if (!adminSession && !clientSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Get file info from database
    const { data: fileRecord, error: fetchError } = await supabase
      .from('project_files')
      .select('*, projects!inner(client_id)')
      .eq('id', id)
      .single();

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found in database' }, { status: 404 });
    }

    // If client is logged in, verify they have access to this project's files
    if (clientSession && !adminSession) {
      const projectClientId = (fileRecord as any).projects?.client_id;
      if (projectClientId !== parseInt(clientSession.id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Validate file URL exists by making a HEAD request
    try {
      const headResponse = await fetch(fileRecord.file_url, {
        method: 'HEAD',
      });

      if (!headResponse.ok) {
        console.error(`File not found on server: ${fileRecord.file_url}`);
        return NextResponse.json(
          { 
            error: 'File not found on server',
            details: `The file "${fileRecord.file_name}" exists in the database but cannot be found on the server. It may have been deleted or never uploaded successfully.`,
            fileName: fileRecord.file_name,
            fileUrl: fileRecord.file_url
          },
          { status: 404 }
        );
      }

      // Redirect to the actual file URL for download
      return NextResponse.redirect(fileRecord.file_url);
    } catch (fileCheckError) {
      console.error('Error checking file existence:', fileCheckError);
      return NextResponse.json(
        {
          error: 'Unable to access file',
          details: 'There was an error attempting to access the file on the server.',
          fileName: fileRecord.file_name,
          fileUrl: fileRecord.file_url
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in download handler:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
