import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, testEmailConnection } from '@/lib/email';

// GET /api/test-email - Test email configuration
export async function GET(request: NextRequest) {
  try {
    // Test SMTP connection
    const connectionTest = await testEmailConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'SMTP connection failed',
        details: connectionTest.error,
      }, { status: 500 });
    }

    // Send a test email
    const testEmail = await sendEmail({
      to: 'raphael.devlp@icloud.com', // Your email for testing
      subject: '🧪 Test Email from VOID Admin Dashboard',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; margin-top: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Email System Working!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>This is a test email from your VOID Tech Solutions admin dashboard.</p>
              <p>If you're reading this, your email notification system is working perfectly! 🚀</p>
              <p><strong>Configuration:</strong></p>
              <ul>
                <li>SMTP Server: mail.voidtechsolutions.co.za</li>
                <li>Port: 465 (SSL)</li>
                <li>From: info@voidtechsolutions.co.za</li>
              </ul>
              <p>Test sent at: ${new Date().toLocaleString('en-ZA')}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      emailDetails: testEmail,
    }, { status: 200 });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email',
      details: String(error),
    }, { status: 500 });
  }
}
