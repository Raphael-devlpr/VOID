import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error in GET /api/invoices/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      client_name,
      client_email,
      client_phone,
      items,
      discount,
      tax,
      invoice_date,
      due_date,
      notes,
      payment_terms,
      billing_address,
      status,
      amount_paid,
    } = body;

    // Recalculate totals if items provided
    let updateData: any = {};

    if (items) {
      const subtotal = items.reduce(
        (sum: number, item: any) => sum + item.quantity * item.price,
        0
      );
      const total = subtotal - (discount || 0) + (tax || 0);
      const balance_due = total - (amount_paid || 0);

      const itemsWithSubtotals = items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      }));

      updateData = {
        items: itemsWithSubtotals,
        subtotal,
        discount: discount || 0,
        tax: tax || 0,
        total,
        balance_due,
      };
    }

    // Add other fields to update
    if (client_name) updateData.client_name = client_name;
    if (client_email) updateData.client_email = client_email;
    if (client_phone !== undefined) updateData.client_phone = client_phone;
    if (invoice_date) updateData.invoice_date = invoice_date;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (notes !== undefined) updateData.notes = notes;
    if (payment_terms !== undefined) updateData.payment_terms = payment_terms;
    if (billing_address !== undefined)
      updateData.billing_address = billing_address;
    if (status) updateData.status = status;
    if (amount_paid !== undefined) {
      updateData.amount_paid = amount_paid;
      // Recalculate balance_due
      const { data: currentInvoice } = await supabase
        .from('invoices')
        .select('total')
        .eq('id', id)
        .single();
      if (currentInvoice) {
        updateData.balance_due = currentInvoice.total - amount_paid;
        if (updateData.balance_due <= 0) {
          updateData.status = 'paid';
          updateData.paid_date = new Date().toISOString().split('T')[0];
        }
      }
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error in PUT /api/invoices/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase.from('invoices').delete().eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/invoices/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
