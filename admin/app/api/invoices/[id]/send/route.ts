import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendInvoiceEmail } from '@/lib/email';

// POST /api/invoices/[id]/send - Send invoice via email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate SMTP configuration
    if (!process.env.SMTP_PASSWORD) {
      console.error('❌ SMTP_PASSWORD not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Get invoice details with project info
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

    // Generate PDF URL - use absolute URL for email links
    // Priority: 1. Request origin, 2. ENV variable, 3. Production domain
    const requestOrigin = request.headers.get('origin') || request.headers.get('referer')?.split('/').slice(0, 3).join('/');
    const baseUrl = requestOrigin || process.env.NEXT_PUBLIC_APP_URL || 'https://voidtechsolutions.co.za';
    const pdfUrl = `${baseUrl}/api/invoices/${id}/pdf`;
    
    console.log('📧 Sending invoice email with PDF URL:', pdfUrl);

    // Extract project name if available
    const projectName = invoice.projects?.project_name;

    // Send email
    const emailResult = await sendInvoiceEmail(
      invoice.client_name,
      invoice.client_email,
      invoice.invoice_number,
      invoice.total,
      invoice.balance_due,
      invoice.due_date,
      pdfUrl,
      invoice.items,
      projectName,
      invoice.payment_reference,
      invoice.billing_address
    );

    if (!emailResult.success) {
      console.error('❌ Email send failed:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    // Update invoice status
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating invoice status:', updateError);
    }

    return NextResponse.json({
      message: 'Invoice sent successfully',
      emailSent: true,
    });
  } catch (error) {
    console.error('❌ Error in POST /api/invoices/[id]/send:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to send invoice', details: errorMessage },
      { status: 500 }
    );
  }
}
