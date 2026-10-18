// ==============================================================================
// BrightPath CRM — SourceDistribution Component
// Visual representation of student acquisition channels
// ==============================================================================

import React from 'react';
import type { SourceCount } from '../../services/reportsService';
import { Compass } from 'lucide-react';
import { LeadSourceBadge } from '../../components/common/StatusBadge';

interface SourceDistributionProps {
  sources: SourceCount[];
  totalLeads: number;
  loading?: boolean;
}

export const SourceDistribution: React.FC<SourceDistributionProps> = ({
  sources,
  totalLeads,
  loading = false,
}) => {
  return (
    <div className="card" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="var(--primary-600)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            Acquisition Channels
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
          Lead Sources
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-400)' }}>
          <p style={{ fontSize: '0.8125rem' }}>Evaluating acquisition channels...</p>
        </div>
      ) : sources.length === 0 || totalLeads === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-400)' }}>
          <p style={{ fontSize: '0.8125rem' }}>No enquiry sources recorded.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
          {sources.map((item) => (
            <div key={item.source} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LeadSourceBadge source={item.source} />
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{item.count}</span>
                </div>

                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>
                  {item.percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  backgroundColor: 'var(--slate-100)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(item.percentage, item.count > 0 ? 4 : 0)}%`,
                    backgroundColor: 'var(--primary-600)',
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
