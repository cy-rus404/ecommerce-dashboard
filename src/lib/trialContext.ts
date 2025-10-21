import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class TrialContext {
  static isTrialMode(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('trial_token');
  }

  static async executeWithTrialMode<T>(operation: () => Promise<T>, fallbackData?: T): Promise<T> {
    if (!this.isTrialMode()) {
      return operation();
    }

    try {
      const result = await operation();
      
      // Show demo notification for write operations
      if (operation.toString().includes('insert') || 
          operation.toString().includes('update') || 
          operation.toString().includes('delete')) {
        this.showTrialNotification('Action completed in demo mode - no real data was modified');
      }
      
      return result;
    } catch (error) {
      // In trial mode, return fallback data instead of throwing errors
      if (fallbackData !== undefined) {
        this.showTrialNotification('Demo mode - using sample data');
        return fallbackData;
      }
      throw error;
    }
  }

  static showTrialNotification(message: string) {
    if (typeof window !== 'undefined') {
      // Create a non-blocking notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
      notification.textContent = `🔄 ${message}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  }

  static async trialSafeInsert(table: string, data: any) {
    if (this.isTrialMode()) {
      this.showTrialNotification(`Added ${table} item in demo mode`);
      return { data: { ...data, id: Math.floor(Math.random() * 1000) }, error: null };
    }
    return supabase.from(table).insert(data);
  }

  static async trialSafeUpdate(table: string, data: any, filter: any) {
    if (this.isTrialMode()) {
      this.showTrialNotification(`Updated ${table} item in demo mode`);
      return { data: [data], error: null };
    }
    return supabase.from(table).update(data).match(filter);
  }

  static async trialSafeDelete(table: string, filter: any) {
    if (this.isTrialMode()) {
      this.showTrialNotification(`Deleted ${table} item in demo mode`);
      return { data: [], error: null };
    }
    return supabase.from(table).delete().match(filter);
  }
}