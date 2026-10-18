// ==============================================================================
// BrightPath CRM — AuthContext Definitions & Interface
// ==============================================================================

import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import type { SignInCredentials, SignUpCredentials } from '../../services/authService';
import type { Profile, UserRole } from '../../types/database';

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<{ error: Error | null }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ error: Error | null; user?: User | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
