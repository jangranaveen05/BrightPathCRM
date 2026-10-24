import React, { useEffect } from 'react';
import { X, GraduationCap } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7, 12, 24, 0.7)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'relative',
          width: '280px',
          maxWidth: '85vw',
          height: '100%',
          background: 'var(--navy-950)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 51,
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideDown 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={20} color="#3b82f6" />
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9375rem' }}>BrightPath CRM</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation drawer"
            className="btn btn-ghost btn-sm"
            style={{
              color: 'var(--slate-400)',
              padding: '10px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Sidebar onCloseMobile={onClose} isMobile />
        </div>
      </div>
    </div>
  );
};

