import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, User, ChevronRight } from 'lucide-react';
import { ConnectionStatusPill } from '../common/ConnectionStatusPill';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/leads')) return 'Leads Pipeline';
    if (path.startsWith('/followups')) return 'Follow-ups';
    if (path.startsWith('/reports')) return 'Reports & Analytics';
    if (path.startsWith('/login')) return 'Sign In';
    return 'BrightPath CRM';
  };

  const title = getPageTitle(location.pathname);

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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px 4px 6px',
            borderRadius: '9999px',
            background: 'var(--slate-100)',
            border: '1px solid var(--slate-200)',
          }}
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
            }}
          >
            <User size={14} />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-800)' }}>
            Admin User
          </span>
          <span className="badge badge-slate" style={{ fontSize: '0.6875rem', padding: '2px 6px' }}>
            Demo
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
};
