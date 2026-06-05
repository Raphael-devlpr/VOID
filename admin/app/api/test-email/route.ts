import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Test SMTP connection endpoint
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing SMTP configuration...');
    
    // Check environment variables
    const config = {
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpPort: !!process.env.SMTP_PORT,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPassword: !!process.env.SMTP_PASSWORD,
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpUser: process.env.SMTP_USER,
    };
    
    console.log('Environment variables:', config);
    
    if (!process.env.SMTP_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'SMTP_PASSWORD not configured',
        config,
      });
    }

    // Create test transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.voidtechsolutions.co.za',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'info@voidtechsolutions.co.za',
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    // Verify connection
    console.log('Attempting to verify SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"VOID Tech Solutions" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self
      subject: 'Test Email from Vercel',
      text: 'This is a test email to verify SMTP configuration on Vercel.',
      html: '<p>This is a test email to verify SMTP configuration on Vercel.</p>',
    });

    console.log('✅ Test email sent!', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return NextResponse.json({
      success: true,
      message: 'SMTP connection verified and test email sent',
      config,
      emailInfo: {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
      },
    });
  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
