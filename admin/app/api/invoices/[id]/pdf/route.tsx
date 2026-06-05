import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { renderToStream } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';

// GET /api/invoices/[id]/pdf - Generate and download PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get invoice details with project name
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        projects:project_id (
          project_name
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Extract project name if available
    const projectName = invoice.projects?.project_name;
    const fileName = projectName 
      ? `${projectName.replace(/[^a-z0-9]/gi, '_')}-invoice.pdf`
      : `invoice-${invoice.invoice_number}.pdf`;

    // Generate PDF
    const stream = await renderToStream(<InvoicePDF invoice={invoice} />);

    // Return PDF as download
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/invoices/[id]/pdf:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
