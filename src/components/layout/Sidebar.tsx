import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads Pipeline', icon: Users },
    { to: '/followups', label: 'Follow-ups', icon: CalendarClock },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar-desktop" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
          }}
        >
          <GraduationCap size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff', letterSpacing: '-0.01em' }}>
            BrightPath
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Academy CRM
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--slate-400)',
            padding: '0 12px 8px',
          }}
        >
          Core Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              <ChevronRight size={14} style={{ opacity: 0.4 }} />
            </NavLink>
          );
        })}
      </nav>

      {/* Role & Institute Card */}
      <div
        style={{
          padding: '16px',
          margin: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <ShieldCheck size={16} color="#60a5fa" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff' }}>Role Access</span>
        </div>
        <p style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', lineHeight: 1.4 }}>
          Role-Based Access Control enforced at PostgreSQL RLS boundary.
        </p>
      </div>
    </aside>
  );
};
