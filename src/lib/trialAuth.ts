import { supabase } from '../../lib/supabase';

export class TrialAuth {
  static async createTrialUser(name: string, email?: string, daysValid: number = 7) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    const { data, error } = await supabase
      .from('trial_users')
      .insert({
        trial_token: `trial_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`,
        name,
        email,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data.trial_token;
  }

  static async validateTrialToken(token: string) {
    const { data, error } = await supabase
      .from('trial_users')
      .select('*')
      .eq('trial_token', token)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single();

    return !error && data;
  }

  static async createTrialSession(trialToken: string) {
    const sessionId = `session_${Math.random().toString(36).substring(2, 15)}${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error } = await supabase
      .from('trial_sessions')
      .insert({
        trial_token: trialToken,
        session_id: sessionId,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;
    return sessionId;
  }

  static async validateSession(sessionId: string) {
    const { data: session, error: sessionError } = await supabase
      .from('trial_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) return false;

    const { data: user, error: userError } = await supabase
      .from('trial_users')
      .select('*')
      .eq('trial_token', session.trial_token)
      .eq('is_active', true)
      .single();

    return !userError && user ? { ...session, trial_users: user } : false;
  }
}