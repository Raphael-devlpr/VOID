import { cookies } from 'next/headers';
import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface AuthSession {
  adminId: string;
  email: string;
  name: string;
}

// Create session cookie
export async function createSession(admin: AuthSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', JSON.stringify(admin), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Get current session
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Destroy session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

// Login admin
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
  try {
    console.log('🔍 Login attempt for:', email);
    
    // Get admin from database - check both email and name fields
    // Try to find by email first, then by name
    let { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('name', email)
      .maybeSingle();
    
    // If not found by name, try email
    if (!admin) {
      const result = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      admin = result.data;
      error = result.error;
    }

    console.log('📊 Database response:', { admin: admin ? 'found' : 'not found', error });

    if (error || !admin) {
      console.log('❌ Admin not found in database');
      return { success: false, error: 'Invalid username/email or password' };
    }

    console.log('🔐 Comparing password...');
    console.log('Password from input:', password);
    console.log('Hash from database:', admin.password_hash);
    
    // Verify password
    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    console.log('✅ Password match result:', isValid);
    
    if (!isValid) {
      console.log('❌ Password does not match');
      return { success: false, error: 'Invalid username/email or password' };
    }

    // Create session
    const session: AuthSession = {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    };

    await createSession(session);

    return { success: true, session };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

// Require authentication (use in server components)
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
