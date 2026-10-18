// ==============================================================================
// BrightPath CRM — PipelineFunnel Component
// Visual stage-by-stage progression breakdown of coaching enquiries
// ==============================================================================

import React from 'react';
import type { StageCount } from '../../services/reportsService';
import { Layers } from 'lucide-react';
import { LeadStatusBadge } from '../../components/common/StatusBadge';

interface PipelineFunnelProps {
  stages: StageCount[];
  totalLeads: number;
  loading?: boolean;
}

export const PipelineFunnel: React.FC<PipelineFunnelProps> = ({
  stages,
  totalLeads,
  loading = false,
}) => {
  const getStageColor = (status: string) => {
    switch (status) {
      case 'New':
        return '#0284c7'; // Sky-600
      case 'Contacted':
        return '#d97706'; // Amber-600
      case 'Qualified':
        return '#7c3aed'; // Purple-600
      case 'Converted':
        return '#059669'; // Emerald-600
      case 'Lost':
      default:
        return '#e11d48'; // Rose-600
    }
  };

  return (
    <div className="card" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--primary-600)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            Admission Pipeline Stages
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
          {totalLeads} total {totalLeads === 1 ? 'enquiry' : 'enquiries'}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-400)' }}>
          <p style={{ fontSize: '0.8125rem' }}>Evaluating pipeline stages...</p>
        </div>
      ) : stages.length === 0 || totalLeads === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-400)' }}>
          <p style={{ fontSize: '0.8125rem' }}>No enquiries available to analyze.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
          {stages.map((stage) => {
            const color = getStageColor(stage.status);

            return (
              <div key={stage.status} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LeadStatusBadge status={stage.status} />
                    <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{stage.count}</span>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>
                    {stage.percentage}%
                  </span>
                </div>

                {/* Meter Progress Bar */}
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
                      width: `${Math.max(stage.percentage, stage.count > 0 ? 4 : 0)}%`,
                      backgroundColor: color,
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
