import React from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  if (!isSupabaseConfigured) {
    return (
      <PageShell
        title="Academy Dashboard"
        description="Real-time KPI metrics, enquiry conversion pipeline, and urgent follow-ups."
      >
        <ConfigShield featureName="Dashboard Analytics" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Academy Dashboard"
      description="Real-time KPI metrics, enquiry conversion pipeline, and urgent follow-ups."
      actions={
        <>
          <button type="button" className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/leads" className="btn btn-primary btn-sm">
            <Plus size={14} /> Add Lead
          </Link>
        </>
      }
    >
      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Total Enquiries</span>
            <Users size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--slate-900)' }}>--</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>All accessible leads</p>
        </div>

        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>New Leads</span>
            <span className="badge badge-amber">Pipeline</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--slate-900)' }}>--</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Status: New</p>
        </div>

        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Converted Admissions</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--slate-900)' }}>--</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Status: Converted</p>
        </div>

        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Conversion Rate</span>
            <TrendingUp size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--slate-900)' }}>0.0%</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Converted / Total leads</p>
        </div>
      </div>

      {/* Urgent Overdue Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="var(--rose-text)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-900)' }}>
              Urgent & Overdue Follow-ups
            </h3>
          </div>
        </div>
        <div className="card-body" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--slate-500)' }}>
          <p style={{ fontSize: '0.875rem' }}>No overdue follow-ups recorded.</p>
        </div>
      </div>
    </PageShell>
  );
};
