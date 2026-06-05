import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from '@react-pdf/renderer';
import { Invoice } from '@/lib/types';
import { readFileSync } from 'fs';
import path from 'path';

// Get logo as base64 for reliable PDF rendering
const getLogoSrc = () => {
  try {
    if (typeof window === 'undefined') {
      // Server-side: read file and convert to base64
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      const logoBuffer = readFileSync(logoPath);
      return `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
  } catch (error) {
    console.error('Error loading logo:', error);
  }
  // Fallback to public URL
  return '/logo.png';
};

// Modern styles matching the web page design
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#e9d5ff',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 55,
    height: 55,
    objectFit: 'contain',
  },
  companyInfo: {},
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  companyTagline: {
    fontSize: 9,
    color: '#7c3aed',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  companyAddress: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 1,
  },
  companyPhone: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 1,
  },
  companyEmail: {
    fontSize: 8,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  // Invoice details box (top right)
  invoiceBox: {
    backgroundColor: '#faf5ff',
    padding: 12,
    borderRadius: 6,
    border: 1,
    borderColor: '#e9d5ff',
    minWidth: 150,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 6,
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  invoiceDate: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
    textAlign: 'right',
  },
  invoiceDueDate: {
    fontSize: 8,
    color: '#991b1b',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  // Client "Invoice To" section
  clientSection: {
    backgroundColor: '#faf5ff',
    padding: 14,
    borderRadius: 6,
    marginBottom: 20,
    border: 1,
    borderColor: '#e9d5ff',
  },
  clientLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  clientPhone: {
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 2,
  },
  clientAddress: {
    fontSize: 9,
    color: '#4b5563',
  },
  // Table styles
  table: {
    marginBottom: 20,
    border: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    padding: 10,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#f3f4f6',
    padding: 10,
    minHeight: 30,
  },
  tableRowText: {
    fontSize: 9,
    color: '#1f2937',
  },
  colDescription: { width: '50%', paddingRight: 8 },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '17.5%', textAlign: 'right' },
  colSubtotal: { width: '17.5%', textAlign: 'right', fontWeight: 'bold' },
  // Totals section
  totalsContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#6366f1',
    borderRadius: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  balanceDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    marginTop: 4,
    border: 2,
    borderColor: '#d97706',
  },
  balanceDueLabel: {
    fontSize: 12,
    color: '#78350f',
    fontWeight: 'bold',
  },
  balanceDueValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  // Payment details section
  paymentDetailsSection: {
    backgroundColor: '#faf5ff',
    padding: 14,
    borderRadius: 6,
    marginBottom: 20,
    border: 1.5,
    borderColor: '#e9d5ff',
  },
  paymentDetailsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentDetailItem: {
    width: '48%',
    marginBottom: 6,
  },
  paymentDetailLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  paymentDetailValue: {
    fontSize: 9,
    color: '#1f2937',
  },
  paymentDetailValueHighlight: {
    fontSize: 9,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTop: 1,
    borderTopColor: '#d1d5db',
  },
  footerRegistration: {
    fontSize: 8,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 7,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 2,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 4,
  },
  footerLink: {
    fontSize: 7,
    color: '#6366f1',
    textDecoration: 'underline',
  },
  footerDivider: {
    fontSize: 7,
    color: '#9ca3af',
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo and Invoice Details */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image 
              src={getLogoSrc()}
              style={styles.logo}
            />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>VOID</Text>
              <Text style={styles.companyTagline}>Your Partner in Digital Excellence</Text>
              <Text style={styles.companyAddress}>Johannesburg, Gauteng, 1620</Text>
              <Text style={styles.companyPhone}>+27 65 833 5278</Text>
              <Text style={styles.companyEmail}>info@voidtechsolutions.co.za</Text>
            </View>
          </View>
          
          <View style={styles.invoiceBox}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceDate}>
              Date: {formatDate(invoice.invoice_date)}
            </Text>
            {invoice.due_date && (
              <Text style={styles.invoiceDueDate}>
                Due: {formatDate(invoice.due_date)}
              </Text>
            )}
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLabel}>INVOICE TO:</Text>
          <Text style={styles.clientName}>{invoice.client_name}</Text>
          <Text style={styles.clientEmail}>{invoice.client_email}</Text>
          {invoice.client_phone && (
            <Text style={styles.clientPhone}>{invoice.client_phone}</Text>
          )}
          {invoice.billing_address && (
            <Text style={styles.clientAddress}>{invoice.billing_address}</Text>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colSubtotal]}>Subtotal</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableRowText, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableRowText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableRowText, styles.colPrice]}>{formatCurrency(item.price)}</Text>
              <Text style={[styles.tableRowText, styles.colSubtotal]}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          {invoice.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(invoice.discount)}</Text>
            </View>
          )}

          {invoice.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.tax)}</Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
          </View>

          {invoice.balance_due > 0 && (
            <View style={styles.balanceDueRow}>
              <Text style={styles.balanceDueLabel}>Balance Due:</Text>
              <Text style={styles.balanceDueValue}>{formatCurrency(invoice.balance_due)}</Text>
            </View>
          )}
        </View>

        {/* Payment Details */}
        <View style={styles.paymentDetailsSection}>
          <Text style={styles.paymentDetailsTitle}>PAYMENT DETAILS</Text>
          <View style={styles.paymentDetailsGrid}>
            <View style={styles.paymentDetailItem}>
              <Text style={styles.paymentDetailLabel}>Bank Name:</Text>
              <Text style={styles.paymentDetailValue}>First National Bank (FNB)</Text>
            </View>
            <View style={styles.paymentDetailItem}>
              <Text style={styles.paymentDetailLabel}>Account Type:</Text>
              <Text style={styles.paymentDetailValue}>Gold Business Account</Text>
            </View>
            <View style={styles.paymentDetailItem}>
              <Text style={styles.paymentDetailLabel}>Account Name:</Text>
              <Text style={styles.paymentDetailValue}>VOIDWEB (PTY) LTD</Text>
            </View>
            <View style={styles.paymentDetailItem}>
              <Text style={styles.paymentDetailLabel}>Account Number:</Text>
              <Text style={styles.paymentDetailValueHighlight}>63136565166</Text>
            </View>
            <View style={styles.paymentDetailItem}>
              <Text style={styles.paymentDetailLabel}>Branch Code:</Text>
              <Text style={styles.paymentDetailValueHighlight}>210835</Text>
            </View>
            {invoice.payment_reference && (
              <View style={styles.paymentDetailItem}>
                <Text style={styles.paymentDetailLabel}>Reference:</Text>
                <Text style={styles.paymentDetailValueHighlight}>{invoice.payment_reference}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerRegistration}>
            Registered Name: VOIDWEB (Pty) Ltd | Registration No: 2025/036371/07
          </Text>
          <Text style={styles.footerText}>
            Thank you for your business! For support: info@voidtechsolutions.co.za | +27 65 833 5278
          </Text>
          <Text style={styles.footerText}>
            Payment terms are stated on the invoice. Payment shall become due immediately upon the commencement of any act or proceedings in which the buyer's solvency is involved. Until full payment is completed, the aforementioned product(s) and/or Service(s) will not be hypothecated or pledged. The client could have already paid for the products or services listed on the invoice. Prices are strictly nett, and are not subject to any discounts unless otherwise agreed to in writing by the Agency.
          </Text>
          <View style={styles.footerLinks}>
            <Link src="https://voidtechsolutions.co.za/privacy-policy.html" style={styles.footerLink}>
              Privacy Policy
            </Link>
            <Text style={styles.footerDivider}>|</Text>
            <Link src="https://voidtechsolutions.co.za/terms-and-conditions.html" style={styles.footerLink}>
              Terms & Conditions
            </Link>
            <Text style={styles.footerDivider}>|</Text>
            <Link src="https://voidtechsolutions.vercel.app/client/login" style={styles.footerLink}>
              Client Portal
            </Link>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
