import { NextRequest, NextResponse } from 'next/server';
import { logoutClient } from '@/lib/clientAuth';

export async function POST(request: NextRequest) {
  try {
    await logoutClient();
    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    console.error('Client logout error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
