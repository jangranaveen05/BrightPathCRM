// ==============================================================================
// BrightPath CRM — Authentication Service
// Encapsulates Supabase Auth and User Profile retrieval
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Profile, UserRole } from '../types/database';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  session: Session | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
}

export const authService = {
  /**
   * Signs in a user with email and password
   */
  async signIn({ email, password }: SignInCredentials) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are not configured in .env');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw error;
    }

    let profile: Profile | null = null;
    if (data.user) {
      profile = await this.getProfile(data.user.id);
    }

    return { user: data.user, session: data.session, profile };
  },

  /**
   * Signs up a new staff member with email, password and full name.
   * Supabase trigger 'on_auth_user_created' automatically creates the public.profiles row.
   */
  async signUp({ email, password, fullName }: SignUpCredentials) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are not configured in .env');
    }

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
          name: trimmedName,
        },
      },
    });

    if (error) {
      throw error;
    }

    return { user: data.user, session: data.session };
  },

  /**
   * Signs out the current active session
   */
  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },

  /**
   * Retrieves the current user session
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Fetches the user's CRM profile from public.profiles
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Unable to fetch profile for user:', userId, error.message);
        return null;
      }

      return data as Profile | null;
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  },

  /**
   * Subscribes to auth lifecycle state transitions
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
