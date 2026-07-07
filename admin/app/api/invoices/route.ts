import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Invoice } from '@/lib/types';

const MIN_INVOICE_SEQUENCE = 75;

function adjustInvoiceNumber(invoiceNumber: string | number): string {
  const raw = String(invoiceNumber ?? '').trim();
  if (!raw) {
    return raw;
  }

  const match = raw.match(/(\d+)$/);
  if (!match) {
    return raw;
  }

  const numericPart = match[1];
  const parsed = Number.parseInt(numericPart, 10);
  if (Number.isNaN(parsed)) {
    return raw;
  }

  // Keep the same prefix/zero-padding, but start visible numbering from 75.
  const adjusted = parsed < MIN_INVOICE_SEQUENCE
    ? parsed + (MIN_INVOICE_SEQUENCE - 1)
    : parsed;

  const padded = adjusted.toString().padStart(numericPart.length, '0');
  return `${raw.slice(0, -numericPart.length)}${padded}`;
}

// GET /api/invoices - Get all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error in GET /api/invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      client_id,
      client_name,
      client_email,
      client_phone,
      payment_reference,
      items,
      discount = 0,
      tax = 0,
      amount_due,
      invoice_date,
      due_date,
      notes,
      payment_terms,
      billing_address,
    } = body;

    // Validate required fields
    if (!client_name || !client_email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );
    const total = subtotal - discount + tax;

    const parsedAmountDue =
      amount_due === undefined || amount_due === null || amount_due === ''
        ? total
        : Number(amount_due);

    if (!Number.isFinite(parsedAmountDue) || parsedAmountDue < 0) {
      return NextResponse.json(
        { error: 'Amount due must be a valid number greater than or equal to 0' },
        { status: 400 }
      );
    }

    if (parsedAmountDue > total) {
      return NextResponse.json(
        { error: 'Amount due cannot be greater than the invoice total' },
        { status: 400 }
      );
    }

    const balance_due = parsedAmountDue;

    // Generate invoice number
    const { data: invoiceNumberData, error: numberError } = await supabase.rpc(
      'generate_invoice_number'
    );

    if (numberError) {
      console.error('Error generating invoice number:', numberError);
      return NextResponse.json(
        { error: 'Failed to generate invoice number' },
        { status: 500 }
      );
    }

    const invoice_number = adjustInvoiceNumber(invoiceNumberData);

    // Prepare items with subtotals
    const itemsWithSubtotals = items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.quantity * item.price,
    }));

    // Insert invoice
    const { data: invoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        invoice_number,
        project_id: project_id || null,
        client_id: client_id || null,
        client_name,
        client_email,
        client_phone: client_phone || null,
        payment_reference: payment_reference || null,
        items: itemsWithSubtotals,
        subtotal,
        discount,
        tax,
        total,
        amount_paid: 0,
        balance_due,
        status: 'draft',
        invoice_date: invoice_date || new Date().toISOString().split('T')[0],
        due_date: due_date || null,
        notes: notes || null,
        payment_terms:
          payment_terms ||
          "Payment shall become due immediately upon the commencement of any act or proceedings in which the buyer's solvency is involved.",
        billing_address: billing_address || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating invoice:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to create invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/invoices:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
