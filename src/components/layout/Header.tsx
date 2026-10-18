// ==============================================================================
// BrightPath CRM — Header Component
// Includes Navigation Toggle, Breadcrumbs, Database Status, and User Profile Menu
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  User as UserIcon,
  ChevronRight,
  LogOut,
  Shield,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { ConnectionStatusPill } from '../common/ConnectionStatusPill';
import { useAuth } from '../../features/auth/AuthContext';
import type { UserRole } from '../../types/database';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut, refreshProfile } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/leads/')) return 'Lead Details';
    if (path.startsWith('/leads')) return 'Leads Pipeline';
    if (path.startsWith('/followups')) return 'Follow-ups';
    if (path.startsWith('/reports')) return 'Reports & Analytics';
    if (path.startsWith('/login')) return 'Sign In';
    return 'BrightPath CRM';
  };

  const title = getPageTitle(location.pathname);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Staff User';

  const getRoleBadge = (userRole: UserRole | null) => {
    switch (userRole) {
      case 'admin':
        return (
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: '#f5f3ff',
              color: '#6d28d9',
              border: '1px solid #ddd6fe',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Admin
          </span>
        );
      case 'manager':
        return (
          <span
            className="badge badge-sky"
            style={{ fontSize: '0.6875rem', padding: '2px 8px', fontWeight: 600, textTransform: 'uppercase' }}
          >
            Manager
          </span>
        );
      case 'counsellor':
      default:
        return (
          <span
            className="badge badge-emerald"
            style={{ fontSize: '0.6875rem', padding: '2px 8px', fontWeight: 600, textTransform: 'uppercase' }}
          >
            Counsellor
          </span>
        );
    }
  };

  return (
    <header className="app-header">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="btn btn-outline btn-sm mobile-menu-btn"
          style={{
            display: 'none',
            padding: '6px',
            color: 'var(--slate-700)',
          }}
          aria-label="Open Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--slate-400)', fontWeight: 500 }}>BrightPath</span>
          <ChevronRight size={14} style={{ color: 'var(--slate-300)' }} />
          <span style={{ color: 'var(--slate-900)', fontWeight: 600 }}>{title}</span>
        </div>
      </div>

      {/* Right: Database Connection Status + Profile Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ConnectionStatusPill />

        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 6px',
                borderRadius: '9999px',
                background: 'var(--slate-100)',
                border: '1px solid var(--slate-200)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              aria-label="User Profile Menu"
              aria-expanded={menuOpen}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--slate-800)',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </span>
              {getRoleBadge(role)}
              <ChevronDown size={14} color="var(--slate-400)" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className="animate-slide-down"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '240px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--slate-200)',
                  padding: '8px',
                  zIndex: 50,
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--slate-100)' }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                    {displayName}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--slate-500)',
                      marginTop: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.email}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <Shield size={12} color="var(--slate-400)" />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--slate-600)' }}>Role:</span>
                    {getRoleBadge(role)}
                  </div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '0.8125rem',
                      color: 'var(--slate-700)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <RefreshCw
                      size={14}
                      color="var(--slate-500)"
                      style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
                    />
                    <span>Refresh Role / Permissions</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '0.8125rem',
                      color: 'var(--rose-text, #e11d48)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
          >
            <UserIcon size={14} />
            <span>Sign In</span>
          </Link>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
