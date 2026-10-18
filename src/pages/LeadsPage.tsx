import React from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { Plus, Search, Filter } from 'lucide-react';

export const LeadsPage: React.FC = () => {
  if (!isSupabaseConfigured) {
    return (
      <PageShell
        title="Leads Pipeline"
        description="Capture student enquiries, manage pipeline stages, and assign counsellors."
      >
        <ConfigShield featureName="Lead Management" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Leads Pipeline"
      description="Capture student enquiries, manage pipeline stages, and assign counsellors."
      actions={
        <button type="button" className="btn btn-primary btn-sm">
          <Plus size={14} /> Add New Lead
        </button>
      }
    >
      {/* Search and Filters Bar */}
      <div
        className="card"
        style={{
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search
            size={16}
            color="var(--slate-400)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input"
            placeholder="Search by student name, phone, or email..."
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <button type="button" className="btn btn-secondary btn-sm">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Leads Table Shell */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--slate-700)' }}>
            No enquiries recorded yet
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', marginTop: '4px' }}>
            Click &quot;Add New Lead&quot; above to capture your first student enquiry.
          </p>
        </div>
      </div>
    </PageShell>
  );
};
