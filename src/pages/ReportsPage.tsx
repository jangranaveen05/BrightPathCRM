import React from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  if (!isSupabaseConfigured) {
    return (
      <PageShell
        title="Reports & Analytics"
        description="Conversion summaries, counsellor activity logs, and lead acquisition breakdown."
      >
        <ConfigShield featureName="Reports & Metric Analytics" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Reports & Analytics"
      description="Conversion summaries, counsellor activity logs, and lead acquisition breakdown."
      actions={
        <button type="button" className="btn btn-secondary btn-sm">
          <Download size={14} /> Export Summary
        </button>
      }
    >
      <div className="card card-body">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-900)', marginBottom: '16px' }}>
          Conversion & Acquisition Summary
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
          Detailed pipeline conversion reports will populate once live enquiry data is connected.
        </p>
      </div>
    </PageShell>
  );
};
