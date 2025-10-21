import { supabase } from './supabase';

export class DemoAuth {
  static async isDemoUser(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('demo_users')
        .select('is_demo')
        .eq('email', email)
        .single();
      
      return !error && data?.is_demo === true;
    } catch {
      return false;
    }
  }

  static async loginDemoUser() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'demo123456'
    });

    if (error) {
      throw new Error('Demo login failed: ' + error.message);
    }

    return data;
  }

  static async isDemoSession(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      return await this.isDemoUser(user.email || '');
    } catch {
      return false;
    }
  }

  static showDemoNotification(message: string) {
    if (typeof window === 'undefined') return;
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
    notification.textContent = `🚫 DEMO: ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}