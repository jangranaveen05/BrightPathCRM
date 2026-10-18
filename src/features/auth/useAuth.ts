// ==============================================================================
// BrightPath CRM — useAuth Hook
// Custom hook to consume AuthContext safely
// ==============================================================================

import { useContext } from 'react';
import { AuthContext, AuthContextValue } from './authContextDef';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
