'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import toast from 'react-hot-toast';
import { InvoiceItem, Project, Client } from '@/lib/types';

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    payment_reference: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    payment_terms: 'Payment shall become due immediately upon the commencement of any act or proceedings in which the buyer\'s solvency is involved.',
    billing_address: '',
    discount: 0,
    tax: 0,
    amount_due: '',
  });

  // Default invoice items that are pre-populated but can be deleted
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Domain Registration (.co.za / .com)', quantity: 1, price: 0, subtotal: 0 },
    { description: 'Website Development (Design & Build)', quantity: 1, price: 0, subtotal: 0 },
    { description: 'Website Hosting (Annual)', quantity: 1, price: 0, subtotal: 0 },
    { description: 'SSL Certificate (HTTPS Security)', quantity: 1, price: 0, subtotal: 0 },
    { description: 'Google Analytics Setup & Integration', quantity: 1, price: 0, subtotal: 0 },
    { description: 'SEO & Meta Tags Implementation', quantity: 1, price: 0, subtotal: 0 },
    { description: 'Brand Guidelines (Logo, Colors, Fonts)', quantity: 1, price: 0, subtotal: 0 },
    { description: 'Typography + Color Scheme', quantity: 1, price: 0, subtotal: 0 },
    { description: 'Professional Email Setup (G Suite / cPanel)', quantity: 1, price: 0, subtotal: 0 },
    { description: 'Website Maintenance (Monthly Support)', quantity: 1, price: 0, subtotal: 0 },
    { description: 'Content Management System (CMS) Setup', quantity: 1, price: 0, subtotal: 0 },
    { description: 'Mobile Responsive Design', quantity: 1, price: 0, subtotal: 0 },
  ]);

  // Fetch projects and clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, clientsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/clients'),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.projects || []);
        }

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setClients(clientsData.clients || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load projects and clients');
      }
    };

    fetchData();
  }, []);

  // Auto-fill client details when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find((p) => p.id.toString() === selectedProjectId);
      if (project) {
        // Find the client to get their address
        const client = clients.find((c) => c.id === project.client_id);
        setFormData((prev) => ({
          ...prev,
          client_name: project.client_name,
          client_email: project.client_email,
          client_phone: project.client_phone || '',
          billing_address: client?.address || '',
        }));
        setSelectedClientId(project.client_id?.toString() || '');
      }
    }
  }, [selectedProjectId, projects, clients]);

  // Auto-fill client details when client is selected
  useEffect(() => {
    if (selectedClientId && !selectedProjectId) {
      const client = clients.find((c) => c.id.toString() === selectedClientId);
      if (client) {
        setFormData((prev) => ({
          ...prev,
          client_name: client.name,
          client_email: client.email,
          client_phone: client.phone || '',
          billing_address: client.address || '',
        }));
      }
    }
  }, [selectedClientId, clients, selectedProjectId]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate subtotal
    if (field === 'quantity' || field === 'price') {
      newItems[index].subtotal = newItems[index].quantity * newItems[index].price;
    }
    
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * formData.tax) / 100;
    const total = subtotal - discountAmount + taxAmount;
    
    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.client_email) {
      toast.error('Client name and email are required');
      return;
    }

    // Filter out items with no description or price, then validate remaining items
    const validItems = items.filter(item => item.description.trim() !== '' || item.price > 0);
    
    if (validItems.length === 0) {
      toast.error('Please add at least one invoice item with a description');
      return;
    }
    
    if (validItems.some(item => !item.description.trim())) {
      toast.error('All invoice items must have a description');
      return;
    }

    const parsedAmountDue =
      formData.amount_due === '' ? total : parseFloat(formData.amount_due);

    if (!Number.isFinite(parsedAmountDue) || parsedAmountDue < 0) {
      toast.error('Amount due must be a valid number greater than or equal to 0');
      return;
    }

    if (parsedAmountDue > total) {
      toast.error('Amount due cannot be greater than total');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        project_id: selectedProjectId ? parseInt(selectedProjectId) : null,
        client_id: selectedClientId ? parseInt(selectedClientId) : null,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        payment_reference: formData.payment_reference,
        items: validItems,
        discount: formData.discount,
        tax: formData.tax,
        amount_due: parsedAmountDue,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date || null,
        notes: formData.notes,
        payment_terms: formData.payment_terms,
        billing_address: formData.billing_address,
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invoice');
      }

      const invoice = await response.json();
      toast.success('Invoice created successfully!');
      router.push(`/invoices/${invoice.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/invoices" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="project">Link to Project (Optional)</Label>
                <select
                  id="project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name} - {project.client_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="client">Link to Client (Optional)</Label>
                <select
                  id="client"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={!!selectedProjectId}
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                  onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                  placeholder="e.g., Project name or invoice number"
                />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
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

            {/* Invoice Items */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <Label>Invoice Items</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Common items are pre-filled. Update prices, remove unused items, or add custom items.
                  </p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border border-gray-200 rounded-md">
                    <div className="col-span-12 md:col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Service or product description"
                        required
                      />
                    </div>
                    
                    <div className="col-span-4 md:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
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

            {/* Totals */}
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
                    placeholder={total.toFixed(2)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to charge full total. Example: 2500 for a 50% deposit on a R 5000 project.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">R {subtotal.toFixed(2)}</span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount ({formData.discount}%):</span>
                    <span className="text-sm font-medium text-red-600">- R {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {formData.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax ({formData.tax}%):</span>
                    <span className="text-sm font-medium">R {taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">R {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">Amount Due:</span>
                  <span className="text-sm font-semibold">
                    R {(formData.amount_due === '' ? total : Math.max(0, Number(formData.amount_due) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
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
                  placeholder="Any additional notes or comments"
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

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/invoices')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
