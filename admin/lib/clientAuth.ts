import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

export interface ClientSession {
  id: string;
  email: string;
  name: string;
  company: string | null;
}

// Create a client session
export async function createClientSession(client: ClientSession) {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify(client);
  
  cookieStore.set('client_session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Get current client session
export async function getClientSession(): Promise<ClientSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('client_session');
    
    if (!sessionCookie) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as ClientSession;
    return session;
  } catch (error) {
    console.error('Error getting client session:', error);
    return null;
  }
}

// Require client authentication
export async function requireClientAuth() {
  const session = await getClientSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

// Client login
export async function loginClient(email: string, password: string) {
  try {
    // Fetch client from database
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !client) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, client.password_hash);
    
    if (!passwordMatch) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Create session
    await createClientSession({
      id: client.id,
      email: client.email,
      name: client.name,
      company: client.company,
    });

    return { success: true, client };
  } catch (error) {
    console.error('Client login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

// Logout client
export async function logoutClient() {
  const cookieStore = await cookies();
  cookieStore.delete('client_session');
}
