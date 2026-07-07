'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Mail, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Invoice } from '@/lib/types';
import { format } from 'date-fns';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }
      const data = await response.json();
      setInvoice(data.invoice || data);
    } catch (error) {
      toast.error('Failed to load invoice');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setActionLoading('pdf');
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `invoice-${invoice?.invoice_number}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async () => {
    try {
      setActionLoading('email');
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      await fetchInvoice(); // Refresh to get updated sent_at timestamp
      toast.success('Invoice sent successfully!');
    } catch (error) {
      toast.error('Failed to send invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (status: Invoice['status']) => {
    try {
      setActionLoading('status');
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchInvoice();
      toast.success(`Invoice marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading('delete');
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      toast.success('Invoice deleted successfully');
      router.push('/invoices');
    } catch (error) {
      toast.error('Failed to delete invoice');
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    if (!status) return <Badge variant="default">UNKNOWN</Badge>;
    
    return <Badge variant="status" status={status}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading invoice...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/invoices" className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Invoice {invoice.invoice_number}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                {getStatusBadge(invoice.status)}
                {invoice.sent_at && (
                  <span className="text-sm text-gray-500">
                    Sent {format(new Date(invoice.sent_at), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Invoice
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={actionLoading === 'pdf'}
                className="hover:bg-purple-50 hover:border-purple-300 transition-all"
              >
                <Download className="mr-2 h-4 w-4" />
                {actionLoading === 'pdf' ? 'Downloading...' : 'Download PDF'}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSendEmail}
                disabled={actionLoading === 'email'}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                <Mail className="mr-2 h-4 w-4" />
                {actionLoading === 'email' ? 'Sending...' : 'Send Email'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
          <div className="bg-white shadow-lg hover:shadow-xl transition-shadow rounded-xl p-4 mb-6 border border-purple-100">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-gray-700 mr-2">Quick Actions:</span>
              {invoice.status === 'draft' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleUpdateStatus('sent')}
                  disabled={actionLoading === 'status'}
                  className="hover:bg-blue-50 hover:border-blue-400 transition-all"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Sent
                </Button>
              )}
              {(invoice.status === 'draft' || invoice.status === 'sent') && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleUpdateStatus('paid')}
                  disabled={actionLoading === 'status'}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-400 transition-all"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={actionLoading === 'status'}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-400 transition-all"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Invoice
              </Button>
            </div>
          </div>
        )}

        {/* Invoice Preview */}
        <div className="bg-white shadow-xl hover:shadow-2xl transition-shadow rounded-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gradient-to-r from-purple-200 to-blue-200" style={{ borderImage: 'linear-gradient(to right, rgb(221, 214, 254), rgb(191, 219, 254)) 1' }}>
            <div className="flex items-start gap-4">
              <img 
                src="/logo.png" 
                alt="VOID Logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">VOID</h2>
                <p className="text-sm font-medium text-gray-600">Your Partner in Digital Excellence</p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-600">107 Boardwalk Blvd,</p>
                   <p className="text-xs text-gray-600">Faerie Glen, Pretoria, 0043,</p>
                  <p className="text-xs text-gray-600">+27 65 833 5278</p>
                  <p className="text-xs text-purple-600 font-medium">info@voidtechsolutions.co.za</p>
                </div>
              </div>
            </div>
            
            <div className="text-right bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-2xl font-bold text-purple-600 mb-2">
                INVOICE
              </h3>
              <p className="text-sm font-semibold text-gray-900">#{invoice.invoice_number}</p>
              <p className="text-xs text-gray-600 mt-2">
                Date: {format(new Date(invoice.invoice_date), 'MMM d, yyyy')}
              </p>
              {invoice.due_date && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8 bg-gradient-to-r from-gray-50 to-purple-50 p-5 rounded-lg border border-gray-200">
            <h4 className="text-xs font-bold text-purple-600 mb-3 uppercase tracking-wide">Invoice To:</h4>
            <p className="font-bold text-gray-900 text-lg">{invoice.client_name}</p>
            <p className="text-sm text-purple-600 font-medium">{invoice.client_email}</p>
            {invoice.client_phone && <p className="text-sm text-gray-600 mt-1">{invoice.client_phone}</p>}
            {invoice.billing_address && <p className="text-sm text-gray-600 mt-1">{invoice.billing_address}</p>}
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Description</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Qty</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-purple-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">R {item.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">R {item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80 space-y-2">
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm py-2">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-gray-900 font-medium">-R {invoice.discount.toFixed(2)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm py-2">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900 font-medium">R {invoice.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">R {invoice.total.toFixed(2)}</span>
              </div>
              {invoice.amount_paid > 0 && (
                <div className="flex justify-between text-sm py-2 bg-green-50 px-3 rounded">
                  <span className="text-green-700 font-medium">Amount Paid:</span>
                  <span className="text-green-700 font-bold">R {invoice.amount_paid.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
                <span className="font-bold text-purple-900">Balance Due:</span>
                <span className="font-bold text-xl text-purple-700">R {invoice.balance_due.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6 bg-amber-50 border border-amber-200 p-5 rounded-lg">
              <h4 className="text-sm font-bold text-amber-800 mb-2 uppercase tracking-wide">Notes:</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Details */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg mb-6 border-2 border-purple-200">
            <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 uppercase tracking-wide">Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Bank Name:</span>
                <p className="text-gray-900">First National Bank (FNB)</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Account Type:</span>
                <p className="text-gray-900">Gold Business Account</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Account Name:</span>
                <p className="text-gray-900">VOIDWEB (PTY) LTD</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Account Number:</span>
                <p className="text-purple-700 font-bold">63136565166</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Branch Code:</span>
                <p className="text-purple-700 font-bold">210835</p>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          {invoice.payment_terms && (
            <div className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p>{invoice.payment_terms}</p>
            </div>
          )}

          {/* Company Registration & Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              Registered Name: VOIDWEB (Pty) Ltd | Registration No: 2025/036371/07
            </p>
            <p className="text-xs text-gray-500">
              Thank you for your business! Project remains embargoed until full payment.
            </p>
            <div className="flex justify-center items-center gap-2 text-xs">
              <a 
                href="https://voidtechsolutions.co.za/privacy-policy.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-gray-400">|</span>
              <a 
                href="https://voidtechsolutions.co.za/terms-and-conditions.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline transition-colors"
              >
                Terms & Conditions
              </a>
              <span className="text-gray-400">|</span>
              <a 
                href="https://voidtechsolutions.vercel.app/client/login" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline transition-colors"
              >
                Client Portal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
