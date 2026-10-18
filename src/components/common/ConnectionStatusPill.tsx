import React, { useState, useRef, useEffect } from 'react';
import { Database, ExternalLink, ShieldCheck, AlertTriangle, Check, Copy } from 'lucide-react';
import { getSupabaseConfigStatus } from '../../lib/supabaseClient';

export const ConnectionStatusPill: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const status = getSupabaseConfigStatus();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status.url && status.url !== 'Not configured') {
      navigator.clipboard.writeText(status.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="connection-pill-wrapper" style={{ position: 'relative' }} ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline btn-sm"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '9999px',
          backgroundColor: status.isConfigured ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          borderColor: status.isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
          cursor: 'pointer',
        }}
        title="Supabase Database Connection Status"
      >
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: '8px',
            height: '8px',
          }}
        >
          <span
            className={status.isConfigured ? 'ping-emerald' : 'ping-amber'}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              backgroundColor: status.isConfigured ? '#10b981' : '#f59e0b',
            }}
          />
          <span
            style={{
              position: 'relative',
              width: '8px',
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: status.isConfigured ? '#10b981' : '#f59e0b',
            }}
          />
        </span>

        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: status.isConfigured ? '#047857' : '#b45309',
          }}
        >
          {status.isConfigured ? 'Supabase Connected' : 'Setup Required'}
        </span>
      </button>

      {isOpen && (
        <div
          className="card animate-slide-down"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '320px',
            zIndex: 60,
            padding: '16px',
            boxShadow: 'var(--shadow-xl)',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Database size={18} color={status.isConfigured ? '#10b981' : '#f59e0b'} />
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>
              Database Connectivity
            </h4>
          </div>

          <div
            style={{
              fontSize: '0.8125rem',
              color: 'var(--slate-600)',
              lineHeight: 1.5,
              marginBottom: '12px',
            }}
          >
            {status.isConfigured ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 500 }}>
                  <ShieldCheck size={16} /> PostgreSQL & Auth Live
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    background: 'var(--slate-50)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--slate-200)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                    {status.url}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
                    title="Copy URL"
                  >
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 500 }}>
                  <AlertTriangle size={16} /> {status.errorMessage}
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Add your Supabase project keys to <code>.env</code> to activate live persistence.
                </p>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '10px' }}>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--primary-600)',
                fontWeight: 500,
              }}
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
