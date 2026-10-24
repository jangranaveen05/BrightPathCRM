// ==============================================================================
// BrightPath CRM — UrgentFollowupsWidget Component
// Quick-action dashboard widget displaying overdue & today tasks with 1-click completion
// ==============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  CalendarClock,
  ArrowRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import type { FollowUpWithLead } from '../../types/database';

interface UrgentFollowupsWidgetProps {
  followUps: FollowUpWithLead[];
  onComplete: (id: string) => Promise<void>;
  loading?: boolean;
}

export const UrgentFollowupsWidget: React.FC<UrgentFollowupsWidgetProps> = ({
  followUps,
  onComplete,
  loading = false,
}) => {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [nowMs] = useState(() => Date.now());

  const handleComplete = async (id: string) => {
    try {
      setCompletingId(id);
      await onComplete(id);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="card" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} color="#e11d48" />
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            Urgent Action Items
          </h2>
        </div>

        <Link
          to="/followups"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--primary-600)',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>All Tasks</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-400)' }}>
          <p style={{ fontSize: '0.8125rem' }}>Checking urgent follow-ups...</p>
        </div>
      ) : followUps.length === 0 ? (
        <div
          style={{
            padding: '36px 16px',
            textAlign: 'center',
            color: 'var(--slate-400)',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--slate-100)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CalendarClock size={28} style={{ margin: '0 auto 8px', opacity: 0.6, color: '#10b981' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>
            Zero Urgent Tasks
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
            All prospective student follow-ups are currently on schedule.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {followUps.slice(0, 4).map((fu) => {
            const dueDate = new Date(fu.due_at);
            const isOverdue = dueDate.getTime() < nowMs;
            const isBusy = completingId === fu.id;

            return (
              <div
                key={fu.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isOverdue ? '#fff1f2' : 'var(--slate-50)',
                  border: '1px solid',
                  borderColor: isOverdue ? '#fecdd3' : 'var(--slate-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Link
                      to={`/leads/${fu.lead_id}`}
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'var(--slate-900)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>{fu.lead?.full_name || 'Student Enquiry'}</span>
                      <ExternalLink size={11} color="var(--slate-400)" />
                    </Link>

                    {isOverdue ? (
                      <span
                        className="badge badge-rose"
                        style={{ fontSize: '0.625rem', padding: '1px 5px', fontWeight: 700 }}
                      >
                        Overdue
                      </span>
                    ) : (
                      <span
                        className="badge badge-amber"
                        style={{ fontSize: '0.625rem', padding: '1px 5px' }}
                      >
                        <Clock size={10} style={{ marginRight: '2px' }} />
                        Today
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--slate-600)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={fu.note}
                  >
                    {fu.note}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleComplete(fu.id)}
                  disabled={isBusy}
                  className="btn btn-outline btn-sm"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.6875rem',
                    color: '#059669',
                    borderColor: '#a7f3d0',
                    backgroundColor: '#ffffff',
                    flexShrink: 0,
                  }}
                  title="Mark Completed"
                >
                  {isBusy ? (
                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <>
                      <CheckCircle2 size={12} />
                      <span>Done</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
