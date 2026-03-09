import nodemailer from 'nodemailer';

// Email configuration - uses your cPanel email SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.voidtechsolutions.co.za',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'info@voidtechsolutions.co.za',
    pass: process.env.SMTP_PASSWORD || '',
  },
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

    const info = await transporter.sendMail({
      from: `"VOID Tech Solutions" <${process.env.SMTP_USER || 'info@voidtechsolutions.co.za'}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    });

    console.log('✅ Email sent to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error);
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
