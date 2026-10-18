// ==============================================================================
// BrightPath CRM — RoleGuard Component
// Granular UI permission gate based on UserRole (admin | manager | counsellor)
// ==============================================================================

import React from 'react';
import { useAuth } from './AuthContext';
import type { UserRole } from '../../types/database';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
