// ==============================================================================
// BrightPath CRM — AuthContext & Provider Tree
// Global authentication provider, session manager, and RBAC role provider
// ==============================================================================

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService, SignInCredentials, SignUpCredentials } from '../../services/authService';
import type { Profile, UserRole } from '../../types/database';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { AuthContext, AuthContextValue } from './authContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const prof = await authService.getProfile(userId);
      setProfile(prof);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // Initial session hydration and auth state subscription
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let isMounted = true;

    async function initializeAuth() {
      try {
        const activeSession = await authService.getSession();
        if (isMounted) {
          setSession(activeSession);
          setUser(activeSession?.user ?? null);
          if (activeSession?.user) {
            await fetchProfile(activeSession.user.id);
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to Supabase auth events
    const { data: authListener } = authService.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    try {
      const result = await authService.signIn(credentials);
      setUser(result.user);
      setSession(result.session);
      setProfile(result.profile);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    try {
      const result = await authService.signUp(credentials);
      return { error: null, user: result.user };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  }, []);

  const role = useMemo<UserRole | null>(() => {
    return profile?.role ?? null;
  }, [profile]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    role,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }), [user, profile, role, session, loading, signIn, signUp, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
