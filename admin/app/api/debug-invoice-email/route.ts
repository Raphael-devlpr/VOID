import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Debug endpoint to see what email would be sent
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invoiceId = searchParams.get('id') || '6';

    // Get invoice details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        projects:project_id (
          project_name
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const requestOrigin = request.headers.get('origin') || request.headers.get('referer')?.split('/').slice(0, 3).join('/');
    const baseUrl = requestOrigin || process.env.NEXT_PUBLIC_APP_URL || 'https://voidtechsolutions.co.za';
    const pdfUrl = `${baseUrl}/api/invoices/${invoiceId}/pdf`;
    const projectName = invoice.projects?.project_name;

    // Show what would be sent
    return NextResponse.json({
      recipient: invoice.client_email,
      subject: `Invoice ${invoice.invoice_number} - ${projectName || 'Project'}`,
      pdfUrl,
      invoiceData: {
        invoice_number: invoice.invoice_number,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        total: invoice.total,
        balance_due: invoice.balance_due,
        due_date: invoice.due_date,
        project_name: projectName,
        payment_reference: invoice.payment_reference,
        billing_address: invoice.billing_address,
      },
      smtpConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        hasPassword: !!process.env.SMTP_PASSWORD,
      },
      note: 'Email was accepted by server but not delivered. This is likely an SPF/DKIM issue.',
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
