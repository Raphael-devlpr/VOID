'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import toast from 'react-hot-toast';
import { Invoice, InvoiceItem } from '@/lib/types';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    billing_address: '',
    payment_reference: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    discount: 0,
    tax: 0,
    amount_due: '',
    notes: '',
    payment_terms: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, price: 0, subtotal: 0 },
  ]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }

        const data = await response.json();
        const loaded: Invoice = data.invoice || data;

        setInvoice(loaded);
        setFormData({
          client_name: loaded.client_name || '',
          client_email: loaded.client_email || '',
          client_phone: loaded.client_phone || '',
          billing_address: loaded.billing_address || '',
          payment_reference: loaded.payment_reference || '',
          invoice_date: loaded.invoice_date || new Date().toISOString().split('T')[0],
          due_date: loaded.due_date || '',
          discount: loaded.discount || 0,
          tax: loaded.tax || 0,
          amount_due: (loaded.balance_due ?? loaded.total ?? 0).toString(),
          notes: loaded.notes || '',
          payment_terms: loaded.payment_terms || '',
        });

        const loadedItems = Array.isArray(loaded.items) && loaded.items.length > 0
          ? loaded.items.map((item) => ({
              description: item.description || '',
              quantity: item.quantity || 0,
              price: item.price || 0,
              subtotal: item.subtotal || item.quantity * item.price || 0,
            }))
          : [{ description: '', quantity: 1, price: 0, subtotal: 0 }];

        setItems(loadedItems);
      } catch (error) {
        toast.error('Failed to load invoice');
        router.push('/invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, router]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: '', quantity: 1, price: 0, subtotal: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'quantity' || field === 'price') {
        next[index].subtotal = next[index].quantity * next[index].price;
      }
      return next;
    });
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * formData.tax) / 100;
    const total = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  }, [items, formData.discount, formData.tax]);

  const displayAmountDue =
    formData.amount_due === ''
      ? totals.total
      : Math.max(0, Number(formData.amount_due) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_name || !formData.client_email) {
      toast.error('Client name and email are required');
      return;
    }

    const validItems = items.filter(
      (item) => item.description.trim() !== '' || item.price > 0
    );

    if (validItems.length === 0) {
      toast.error('Please add at least one invoice item with a description');
      return;
    }

    if (validItems.some((item) => !item.description.trim())) {
      toast.error('All invoice items must have a description');
      return;
    }

    const parsedAmountDue =
      formData.amount_due === '' ? totals.total : Number(formData.amount_due);

    if (!Number.isFinite(parsedAmountDue) || parsedAmountDue < 0) {
      toast.error('Amount due must be a valid number greater than or equal to 0');
      return;
    }

    if (parsedAmountDue > totals.total) {
      toast.error('Amount due cannot be greater than total');
      return;
    }

    const computedAmountPaid = Math.max(0, totals.total - parsedAmountDue);

    setSaving(true);
    try {
      const payload = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        billing_address: formData.billing_address,
        payment_reference: formData.payment_reference,
        items: validItems,
        discount: formData.discount,
        tax: formData.tax,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date || null,
        notes: formData.notes,
        payment_terms: formData.payment_terms,
        amount_paid: computedAmountPaid,
      };

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update invoice');
      }

      toast.success('Invoice updated successfully!');
      router.push(`/invoices/${invoiceId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-600">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/invoices/${invoiceId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoice
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Invoice {invoice.invoice_number}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="client_email">Client Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="client_phone">Client Phone</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="billing_address">Billing Address</Label>
                <Input
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="payment_reference">Payment Reference</Label>
                <Input
                  id="payment_reference"
                  value={formData.payment_reference}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_reference: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="invoice_date">Invoice Date *</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Invoice Items</Label>
                <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-end p-4 border border-gray-200 rounded-md"
                  >
                    <div className="col-span-12 md:col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Service or product description"
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, 'quantity', parseInt(e.target.value, 10) || 1)
                        }
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <Label>Price (R)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price === 0 ? '' : item.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || value === '0') {
                            updateItem(index, 'price', 0);
                          } else {
                            updateItem(index, 'price', parseFloat(value) || 0);
                          }
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-3 md:col-span-2">
                      <Label>Subtotal</Label>
                      <div className="text-sm font-medium py-2">R {item.subtotal.toFixed(2)}</div>
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount === 0 ? '' : formData.discount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '0') {
                        setFormData({ ...formData, discount: 0 });
                      } else {
                        setFormData({ ...formData, discount: parseFloat(value) || 0 });
                      }
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="tax">Tax/VAT (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.tax === 0 ? '' : formData.tax}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '0') {
                        setFormData({ ...formData, tax: 0 });
                      } else {
                        setFormData({ ...formData, tax: parseFloat(value) || 0 });
                      }
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="amount_due">Amount Due (R)</Label>
                  <Input
                    id="amount_due"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount_due}
                    onChange={(e) => setFormData({ ...formData, amount_due: e.target.value })}
                    placeholder={totals.total.toFixed(2)}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">R {totals.subtotal.toFixed(2)}</span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Discount ({formData.discount}%):
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      - R {totals.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {formData.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax ({formData.tax}%):</span>
                    <span className="text-sm font-medium">R {totals.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">R {totals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">Amount Due:</span>
                  <span className="text-sm font-semibold">R {displayAmountDue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Textarea
                  id="payment_terms"
                  rows={3}
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/invoices/${invoiceId}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
