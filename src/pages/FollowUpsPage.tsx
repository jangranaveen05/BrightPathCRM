import React from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { Plus, CalendarClock } from 'lucide-react';

export const FollowUpsPage: React.FC = () => {
  if (!isSupabaseConfigured) {
    return (
      <PageShell
        title="Follow-ups"
        description="Schedule and track prospective student interactions and overdue tasks."
      >
        <ConfigShield featureName="Follow-ups Engine" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Follow-ups"
      description="Schedule and track prospective student interactions and overdue tasks."
      actions={
        <button type="button" className="btn btn-primary btn-sm">
          <Plus size={14} /> Schedule Follow-up
        </button>
      }
    >
      {/* Follow-up Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button type="button" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
          Today
        </button>
        <button type="button" className="btn btn-outline btn-sm">
          Upcoming
        </button>
        <button type="button" className="btn btn-outline btn-sm">
          Overdue <span className="badge badge-rose" style={{ marginLeft: '4px' }}>0</span>
        </button>
        <button type="button" className="btn btn-outline btn-sm">
          Completed
        </button>
      </div>

      <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
        <CalendarClock size={36} color="var(--slate-300)" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--slate-700)' }}>
          No follow-ups scheduled for today
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', marginTop: '4px' }}>
          Schedule a follow-up directly from any lead profile or click above.
        </p>
      </div>
    </PageShell>
  );
};
