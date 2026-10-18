import React, { useState } from 'react';
import { Database, Key, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { getSupabaseConfigStatus } from '../../lib/supabaseClient';

interface ConfigShieldProps {
  featureName?: string;
}

export const ConfigShield: React.FC<ConfigShieldProps> = ({ featureName = 'CRM Features' }) => {
  const [copied, setCopied] = useState(false);
  const status = getSupabaseConfigStatus();

  const envTemplate = `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOi...`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="card animate-slide-up"
      style={{
        maxWidth: '720px',
        margin: '32px auto',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--slate-200)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 100%)',
          padding: '28px 32px',
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Database size={22} color="#60a5fa" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Connect Supabase to Enable {featureName}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)', marginTop: '2px' }}>
              BrightPath CRM requires an active PostgreSQL & Supabase Auth backend.
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px', backgroundColor: '#ffffff' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-900)', marginBottom: '6px' }}>
            Current Status
          </h3>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--amber-bg)',
              border: '1px solid var(--amber-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.875rem',
              color: 'var(--amber-text)',
            }}
          >
            <Key size={18} />
            <span>{status.errorMessage || 'Supabase credentials not yet supplied in local .env'}</span>
          </div>
        </div>

        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-900)', marginBottom: '16px' }}>
          3-Step Setup Procedure
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                Create or open your Supabase project
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                Go to the Supabase dashboard and create a new project (e.g. <code>brightpath-academy</code>).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                Retrieve Project URL & Anon Public API Key
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                Navigate to <strong>Project Settings &gt; API</strong> in your Supabase project dashboard.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                Save in local <code>.env</code> file
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px', marginBottom: '8px' }}>
                Create a <code>.env</code> file in your project root with your credentials:
              </p>

              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--slate-900)',
                  color: 'var(--slate-100)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                }}
              >
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn btn-sm"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: copied ? '#34d399' : '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={12} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy Template
                    </>
                  )}
                </button>
                <div style={{ color: '#93c5fd' }}>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                <div style={{ color: '#93c5fd' }}>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '20px',
            borderTop: '1px solid var(--slate-100)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
            <Sparkles size={16} color="var(--primary-600)" />
            <span>Vite automatically detects changes when <code>.env</code> is saved</span>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <span>Open Supabase</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
