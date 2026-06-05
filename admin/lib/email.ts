import nodemailer from 'nodemailer';

// Email configuration - uses your cPanel email SMTP or Resend
const smtpPort = parseInt(process.env.SMTP_PORT || '465');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.voidtechsolutions.co.za',
  port: smtpPort,
  secure: smtpPort === 465, // true for 465 (direct SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER || 'info@voidtechsolutions.co.za',
    pass: process.env.SMTP_PASSWORD || '',
  },
  // Add connection timeout and debugging
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  logger: true,
  debug: process.env.NODE_ENV === 'development',
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Send email function
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Check if email is configured
    if (!process.env.SMTP_PASSWORD) {
      console.warn('⚠️ Email not configured - skipping email send');
      return { success: false, error: 'Email not configured' };
    }

    // Log SMTP configuration (without password)
    console.log('📧 SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASSWORD,
    });

    console.log('📤 Attempting to send email to:', to);

    const info = await transporter.sendMail({
      from: `"VOID Tech Solutions" <${process.env.SMTP_USER || 'info@voidtechsolutions.co.za'}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    });

    console.log('✅ Email sent successfully!', {
      to,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, error: String(error) };
  }
}

// Email Templates

export function projectStatusChangeEmail(
  clientName: string,
  projectName: string,
  oldStatus: string,
  newStatus: string,
  portalUrl: string
) {
  const statusEmoji: Record<string, string> = {
    planning: '📋',
    'in-progress': '🚀',
    review: '👀',
    completed: '✅',
    'on-hold': '⏸️',
  };

  return {
    subject: `Project Update: ${projectName} - Status Changed to ${newStatus}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .status-in-progress { background: #dbeafe; color: #1e40af; }
          .status-completed { background: #d1fae5; color: #065f46; }
          .status-planning { background: #fef3c7; color: #92400e; }
          .status-review { background: #e0e7ff; color: #3730a3; }
          .status-on-hold { background: #f3f4f6; color: #374151; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Project Status Update</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            
            <p>We have an update on your project:</p>
            
            <h2 style="color: #2563eb;">${projectName}</h2>
            
            <p>
              <strong>Previous Status:</strong> 
              <span class="status-badge status-${oldStatus.toLowerCase().replace(' ', '-')}">
                ${statusEmoji[oldStatus.toLowerCase().replace(' ', '-')] || '📌'} ${oldStatus}
              </span>
            </p>
            
            <p>
              <strong>New Status:</strong> 
              <span class="status-badge status-${newStatus.toLowerCase().replace(' ', '-')}">
                ${statusEmoji[newStatus.toLowerCase().replace(' ', '-')] || '📌'} ${newStatus}
              </span>
            </p>
            
            <p>You can view more details and track your project progress in your client portal:</p>
            
            <a href="${portalUrl}" class="button">View Project Details</a>
            
            <p style="margin-top: 30px;">If you have any questions, feel free to reply to this email or contact us.</p>
          </div>
          <div class="footer">
            <p><strong>VOID Tech Solutions</strong></p>
            <p>info@voidtechsolutions.co.za | www.voidtechsolutions.co.za</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function newFileUploadedEmail(
  clientName: string,
  projectName: string,
  fileName: string,
  fileCategory: string,
  portalUrl: string
) {
  return {
    subject: `New File Added: ${fileName} - ${projectName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .file-badge { background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📎 New File Available</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            
            <p>A new file has been added to your project:</p>
            
            <h2 style="color: #2563eb;">${projectName}</h2>
            
            <div class="file-badge">
              📄 ${fileName}
            </div>
            
            <p><strong>Category:</strong> ${fileCategory}</p>
            
            <p>You can download and view this file in your client portal:</p>
            
            <a href="${portalUrl}" class="button">View & Download File</a>
            
            <p style="margin-top: 30px;">If you have any questions about this file, feel free to reply to this email.</p>
          </div>
          <div class="footer">
            <p><strong>VOID Tech Solutions</strong></p>
            <p>info@voidtechsolutions.co.za | www.voidtechsolutions.co.za</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function newMeetingScheduledEmail(
  clientName: string,
  projectName: string,
  meetingTitle: string,
  meetingDate: string,
  meetingType: string,
  meetingLink: string | null,
  portalUrl: string
) {
  const meetingTypeEmoji: Record<string, string> = {
    online: '💻',
    phone: '📞',
    'in-person': '🏢',
  };

  return {
    subject: `Meeting Scheduled: ${meetingTitle} - ${projectName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .meeting-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .button-secondary { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Meeting Scheduled</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            
            <p>A meeting has been scheduled for your project:</p>
            
            <h2 style="color: #2563eb;">${projectName}</h2>
            
            <div class="meeting-info">
              <h3 style="margin-top: 0;">${meetingTitle}</h3>
              <p><strong>📅 Date & Time:</strong> ${new Date(meetingDate).toLocaleString('en-ZA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
              <p><strong>${meetingTypeEmoji[meetingType] || '📍'} Type:</strong> ${meetingType.charAt(0).toUpperCase() + meetingType.slice(1)}</p>
              ${meetingLink ? `<p><strong>🔗 Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
            </div>
            
            ${meetingLink ? `<a href="${meetingLink}" class="button-secondary">Join Meeting</a><br>` : ''}
            <a href="${portalUrl}" class="button">View in Portal</a>
            
            <p style="margin-top: 30px;">Please add this to your calendar. Looking forward to speaking with you!</p>
          </div>
          <div class="footer">
            <p><strong>VOID Tech Solutions</strong></p>
            <p>info@voidtechsolutions.co.za | www.voidtechsolutions.co.za</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function newProjectAssignedEmail(
  clientName: string,
  projectName: string,
  projectDescription: string,
  portalUrl: string
) {
  return {
    subject: `New Project Assigned: ${projectName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .project-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #2563eb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Project Started!</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            
            <p>Great news! We're excited to start working on your new project:</p>
            
            <div class="project-box">
              <h2 style="margin-top: 0; color: #2563eb;">${projectName}</h2>
              <p>${projectDescription}</p>
            </div>
            
            <p>You can now track the progress of your project in real-time through your client portal:</p>
            
            <p><strong>✅ View project status</strong><br>
            <strong>📎 Access project files</strong><br>
            <strong>📅 See scheduled meetings</strong><br>
            <strong>💬 Add notes and feedback</strong></p>
            
            <a href="${portalUrl}" class="button">View Project in Portal</a>
            
            <p style="margin-top: 30px;">We'll keep you updated at every step. Let's build something amazing together!</p>
          </div>
          <div class="footer">
            <p><strong>VOID Tech Solutions</strong></p>
            <p>info@voidtechsolutions.co.za | www.voidtechsolutions.co.za</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function sendInvoiceEmail(
  clientName: string,
  clientEmail: string,
  invoiceNumber: string,
  totalAmount: number,
  balanceDue: number,
  dueDate: string | null,
  pdfUrl: string,
  items: Array<{description: string; quantity: number; price: number; subtotal: number}>,
  projectName?: string,
  paymentReference?: string,
  billingAddress?: string
) {
  const subject = projectName 
    ? `Invoice ${invoiceNumber} - ${projectName}`
    : `Invoice ${invoiceNumber} from VOID Tech Solutions`;

  return sendEmail({
    to: clientEmail,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .header { 
            background: #ffffff;
            padding: 32px 40px 24px;
            border-bottom: 3px solid #6366f1;
          }
          .header-table {
            width: 100%;
          }
          .header-left {
            vertical-align: middle;
          }
          .logo {
            width: 60px;
            height: 60px;
            margin-right: 16px;
            vertical-align: middle;
          }
          .logo-text {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 8px 0;
          }
          .invoice-title {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .content { 
            background: #ffffff;
            padding: 32px 40px;
          }
          .greeting {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 16px;
          }
          .intro-text {
            color: #4b5563;
            margin-bottom: 24px;
          }
          .invoice-details { 
            background: #f9fafb;
            padding: 24px;
            border-radius: 6px;
            margin: 24px 0;
            border: 1px solid #e5e7eb;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .detail-label {
            color: #6b7280;
            font-size: 14px;
          }
          .detail-value {
            color: #1f2937;
            font-weight: 600;
            font-size: 14px;
          }
          .amount-due {
            background: #eff6ff;
            padding: 20px 24px;
            border-radius: 6px;
            margin: 24px 0;
            border-left: 4px solid #3b82f6;
          }
          .amount-label {
            color: #1e40af;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .amount-value {
            font-size: 32px;
            font-weight: 700;
            color: #1e40af;
          }
          .project-info {
            background: #eff6ff;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 16px;
            border-left: 4px solid #3b82f6;
          }
          .project-name {
            font-size: 15px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 4px;
          }
          .button { 
            display: inline-block;
            background: #6366f1;
            color: #ffffff;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 15px;
            margin: 8px 0 24px 0;
          }
          .button:hover {
            background: #4f46e5;
          }
          .payment-info { 
            background: #fef9e7;
            padding: 24px;
            border-radius: 6px;
            margin: 24px 0;
            border-left: 4px solid #f59e0b;
          }
          .payment-title {
            font-size: 16px;
            font-weight: 600;
            color: #78350f;
            margin: 0 0 16px 0;
          }
          .payment-row {
            display: flex;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .payment-label {
            color: #92400e;
            min-width: 140px;
            font-weight: 500;
          }
          .payment-value {
            color: #1f2937;
            font-weight: 600;
          }
          .payment-reference {
            background: #ffffff;
            padding: 12px;
            border-radius: 4px;
            margin-top: 12px;
            border: 1px dashed #f59e0b;
          }
          .reference-label {
            color: #92400e;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .reference-value {
            color: #1f2937;
            font-size: 16px;
            font-weight: 700;
          }
          .proof-section {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 6px;
            margin-top: 24px;
          }
          .proof-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin: 0 0 12px 0;
          }
          .contact-item {
            color: #4b5563;
            font-size: 14px;
            margin: 6px 0;
          }
          .footer { 
            background: #f9fafb;
            text-align: center;
            padding: 24px 40px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-company {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .footer-text {
            color: #6b7280;
            font-size: 13px;
            line-height: 1.5;
            margin: 4px 0;
          }
          .footer-link {
            color: #6366f1;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <table class="header-table" cellpadding="0" cellspacing="0">
              <tr>
                <td class="header-left">
                  <img src="https://voidtechsolutions.co.za/assets/imgs/logo1.png" alt="VOID Logo" class="logo" />
                </td>
                <td class="header-left">
                  <div class="logo-text">VOID Tech Solutions</div>
                  <div class="invoice-title">Tax Invoice</div>
                </td>
              </tr>
            </table>
          </div>
          
          <div class="content">
            <p class="greeting">Dear ${clientName},</p>
            
            <p class="intro-text">Thank you for your business. Please find your invoice details below.</p>
            
            ${projectName ? `
            <div class="project-info">
              <div class="project-name">Project: ${projectName}</div>
            </div>
            ` : ''}
            
            <div class="invoice-details">
              ${billingAddress ? `
              <div class="detail-row">
                <span class="detail-label">Billing Address</span>
                <span class="detail-value">${billingAddress}</span>
              </div>` : ''}
              <div class="detail-row">
                <span class="detail-label">Invoice Date</span>
                <span class="detail-value">${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              ${dueDate ? `
              <div class="detail-row">
                <span class="detail-label">Due Date</span>
                <span class="detail-value">${new Date(dueDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>` : ''}
              <div class="detail-row">
                <span class="detail-label">Total Amount</span>
                <span class="detail-value">R ${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="amount-due">
              <div class="amount-label">Amount Due</div>
              <div class="amount-value">R ${balanceDue.toFixed(2)}</div>
            </div>
            
            <center>
              <a href="${pdfUrl}" class="button">Download Invoice PDF</a>
            </center>
            
            <div class="payment-info">
              <h3 class="payment-title">Banking Details</h3>
              <div class="payment-row">
                <span class="payment-label">Bank Name</span>
                <span class="payment-value">First National Bank (FNB)</span>
              </div>
              <div class="payment-row">
                <span class="payment-label">Account Name</span>
                <span class="payment-value">VOIDWEB (PTY) LTD</span>
              </div>
              <div class="payment-row">
                <span class="payment-label">Account Number</span>
                <span class="payment-value">63136565166</span>
              </div>
              <div class="payment-row">
                <span class="payment-label">Branch Code</span>
                <span class="payment-value">210835</span>
              </div>
              <div class="payment-row">
                <span class="payment-label">Account Type</span>
                <span class="payment-value">Gold Business Account</span>
              </div>
              
              <div class="payment-reference">
                <div class="reference-label">Payment Reference</div>
                <div class="reference-value">${paymentReference || invoiceNumber}</div>
              </div>
            </div>
            
            <div class="proof-section">
              <div class="proof-title">After Payment</div>
              <div class="contact-item">📧 Email proof of payment to: <strong>info@voidtechsolutions.co.za</strong></div>
              <div class="contact-item">📱 WhatsApp: <strong>+27 65 833 5278</strong></div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-company">VOID Tech Solutions</div>
            <div class="footer-text">Registered: VOIDWEB (Pty) Ltd | Reg No: 2025/036371/07</div>
            <div class="footer-text">Johannesburg, Gauteng, 1620 | South Africa</div>
            <div class="footer-text">+27 65 833 5278 | info@voidtechsolutions.co.za</div>
            <div class="footer-text"><a href="https://www.voidtechsolutions.co.za" class="footer-link">www.voidtechsolutions.co.za</a></div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
