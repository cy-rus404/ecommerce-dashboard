import { supabase } from './supabase';

export class UniversalAuth {
  static async checkAuth(router: any, redirectPath: string = '/login') {
    console.log('UniversalAuth: Checking authentication...');
    
    // Check trial mode first
    const trialToken = localStorage.getItem('trial_token');
    if (trialToken) {
      console.log('UniversalAuth: Trial mode detected');
      return {
        isTrialMode: true,
        user: {
          id: 'trial-user',
          email: 'trial@demo.com',
          user_metadata: { name: 'Trial User' }
        }
      };
    }

    // Check regular auth
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        console.log('UniversalAuth: Regular user found');
        return {
          isTrialMode: false,
          user
        };
      } else {
        console.log('UniversalAuth: No user found, redirecting');
        router.push(redirectPath);
        return null;
      }
    } catch (error) {
      console.error('UniversalAuth: Error checking auth:', error);
      router.push(redirectPath);
      return null;
    }
  }

  static async handleLogout(router: any) {
    const trialToken = localStorage.getItem('trial_token');
    if (trialToken) {
      localStorage.removeItem('trial_session');
      localStorage.removeItem('trial_token');
      router.push('/trial');
    } else {
      await supabase.auth.signOut();
      router.push('/login');
    }
  }

  static isTrialMode(): boolean {
    return !!localStorage.getItem('trial_token');
  }
}