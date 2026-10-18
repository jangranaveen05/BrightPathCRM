// ==============================================================================
// BrightPath CRM — StatusBadge Components
// Visual status pills and acquisition source tags for leads
// ==============================================================================

import React from 'react';
import type { LeadStatus, LeadSource } from '../../types/database';

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'New':
      return (
        <span
          className="badge badge-sky"
          style={{ fontWeight: 600, fontSize: '0.75rem', padding: '3px 9px' }}
        >
          ● New
        </span>
      );
    case 'Contacted':
      return (
        <span
          className="badge badge-amber"
          style={{ fontWeight: 600, fontSize: '0.75rem', padding: '3px 9px' }}
        >
          ● Contacted
        </span>
      );
    case 'Qualified':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 9px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '9999px',
            backgroundColor: '#f5f3ff',
            color: '#6d28d9',
            border: '1px solid #ddd6fe',
          }}
        >
          ● Qualified
        </span>
      );
    case 'Converted':
      return (
        <span
          className="badge badge-emerald"
          style={{ fontWeight: 600, fontSize: '0.75rem', padding: '3px 9px' }}
        >
          ✓ Converted
        </span>
      );
    case 'Lost':
      return (
        <span
          className="badge badge-rose"
          style={{ fontWeight: 600, fontSize: '0.75rem', padding: '3px 9px' }}
        >
          ✕ Lost
        </span>
      );
    default:
      return <span className="badge badge-slate">{status}</span>;
  }
};

interface LeadSourceBadgeProps {
  source: LeadSource;
}

export const LeadSourceBadge: React.FC<LeadSourceBadgeProps> = ({ source }) => {
  return (
    <span
      className="badge badge-slate"
      style={{
        fontSize: '0.6875rem',
        fontWeight: 500,
        backgroundColor: 'var(--slate-100)',
        color: 'var(--slate-600)',
        border: '1px solid var(--slate-200)',
      }}
    >
      {source}
    </span>
  );
};
