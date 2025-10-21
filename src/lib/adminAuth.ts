import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
}

export class AdminAuth {
  // Check if user is admin
  static async isAdmin(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('email, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Get admin user details
  static async getAdminUser(email: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return data as AdminUser;
    } catch (error) {
      return null;
    }
  }

  // Create admin session
  static async createSession(email: string): Promise<string | null> {
    try {
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8); // 8 hour session

      const { error } = await supabase
        .from('admin_sessions')
        .insert([{
          admin_email: email,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        }]);

      if (error) {
        return null;
      }

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_session_token', sessionToken);
        localStorage.setItem('admin_email', email);
      }

      return sessionToken;
    } catch (error) {
      return null;
    }
  }

  // Validate session
  static async validateSession(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('admin_email, expires_at')
        .eq('session_token', token)
        .single();

      if (error || !data) {
        return false;
      }

      // Check if session expired
      if (new Date(data.expires_at) < new Date()) {
        await this.destroySession(token);
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Destroy session
  static async destroySession(token: string): Promise<void> {
    try {
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', token);

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_session_token');
        localStorage.removeItem('admin_email');
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // Get current session
  static getCurrentSession(): { token: string | null; email: string | null } {
    if (typeof window === 'undefined') {
      return { token: null, email: null };
    }

    return {
      token: localStorage.getItem('admin_session_token'),
      email: localStorage.getItem('admin_email')
    };
  }

  // Generate session token
  private static generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + 
           Date.now().toString(36) + 
           Math.random().toString(36).substring(2);
  }

  // Cleanup expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabase.rpc('cleanup_expired_sessions');
    } catch (error) {
      // Silent error handling
    }
  }
}