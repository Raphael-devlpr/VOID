import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { generatePin } from '@/lib/utils';

// GET all PINs
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: pins, error } = await supabase
      .from('software_pins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch PINs error:', error);
      return NextResponse.json({ error: 'Failed to fetch PINs' }, { status: 500 });
    }

    return NextResponse.json({ pins }, { status: 200 });
  } catch (error) {
    console.error('Get PINs error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// POST generate new PINs
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { count = 1 } = body;

    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Generate unique PINs
    const pinsToInsert = [];
    const existingPins = new Set<string>();

    // Fetch existing PINs to avoid duplicates
    const { data: existing } = await supabase
      .from('software_pins')
      .select('pin');
    
    if (existing) {
      existing.forEach(p => existingPins.add(p.pin));
    }

    // Generate new unique PINs
    for (let i = 0; i < count; i++) {
      let pin = generatePin();
      // Ensure uniqueness
      while (existingPins.has(pin)) {
        pin = generatePin();
      }
      existingPins.add(pin);
      pinsToInsert.push({ pin, is_used: false });
    }

    // Insert PINs
    const { data: pins, error: insertError } = await supabase
      .from('software_pins')
      .insert(pinsToInsert)
      .select();

    if (insertError) {
      console.error('Insert PINs error:', insertError);
      return NextResponse.json({ error: 'Failed to generate PINs' }, { status: 500 });
    }

    return NextResponse.json({ pins, count: pins?.length || 0 }, { status: 201 });
  } catch (error) {
    console.error('Generate PINs error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
