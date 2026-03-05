import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// DELETE /api/files/[id] - Delete a file
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Get file info first
    const { data: fileRecord, error: fetchError } = await supabase
      .from('project_files')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // Note: Physical file deletion from cPanel optional - just DB cleanup for now

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
