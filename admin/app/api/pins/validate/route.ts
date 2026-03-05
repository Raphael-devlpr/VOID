import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// CORS headers for local development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST /api/pins/validate - Validate a PIN (public endpoint for software page)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin || pin.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'PIN is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the PIN
    const { data, error } = await supabase
      .from('software_pins')
      .select('*')
      .eq('pin', pin.trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'Incorrect PIN. Please try again.' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if already used
    if (data.is_used) {
      return NextResponse.json(
        { success: false, message: 'This PIN has already been used. Please request a new PIN.' },
        { status: 403, headers: corsHeaders }
      );
    }

    // Mark as used
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const { error: updateError } = await supabase
      .from('software_pins')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_by_ip: clientIp
      })
      .eq('id', data.id);

    if (updateError) throw updateError;

    return NextResponse.json(
      { success: true, message: 'PIN valid' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error validating PIN:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
