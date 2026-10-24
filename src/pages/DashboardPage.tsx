// ==============================================================================
// BrightPath CRM — DashboardPage
// Real-time KPI metrics, visual funnel, acquisition analytics, and urgent follow-ups
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { leadsService } from '../services/leadsService';
import { reportsService, DashboardKPIs, StageCount, SourceCount } from '../services/reportsService';
import { followUpsService } from '../services/followUpsService';
import type { LeadWithAssignee, FollowUpWithLead } from '../types/database';
import { LeadStatusBadge, LeadSourceBadge } from '../components/common/StatusBadge';
import { PipelineFunnel } from '../features/dashboard/PipelineFunnel';
import { SourceDistribution } from '../features/dashboard/SourceDistribution';
import { UrgentFollowupsWidget } from '../features/dashboard/UrgentFollowupsWidget';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Plus,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/common/useToast';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [leads, setLeads] = useState<LeadWithAssignee[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    conversionRate: '0.0',
    overdueFollowUps: 0,
    todayFollowUps: 0,
  });
  const [stages, setStages] = useState<StageCount[]>([]);
  const [sources, setSources] = useState<SourceCount[]>([]);
  const [urgentFollowUps, setUrgentFollowUps] = useState<FollowUpWithLead[]>([]);

  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      setErrorMsg(null);
      const [leadsData, kpiData, overdueData] = await Promise.all([
        leadsService.getLeads(),
        reportsService.getDashboardKPIs(),
        followUpsService.getFollowUps({ tab: 'overdue' }),
      ]);

      setLeads(leadsData);
      setKpis(kpiData);
      setUrgentFollowUps(overdueData);

      const [stageDist, sourceDist] = await Promise.all([
        reportsService.getStageDistribution(leadsData),
        reportsService.getSourceDistribution(leadsData),
      ]);

      setStages(stageDist);
      setSources(sourceDist);
    } catch (err: unknown) {
      console.error('Failed to load dashboard metrics:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to retrieve dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function initDashboard() {
      await fetchDashboardData();
    }
    initDashboard();
  }, [fetchDashboardData]);

  const handleCompleteFollowUp = async (id: string) => {
    try {
      await followUpsService.markComplete(id, user?.id);
      toast.success('Follow-up Completed', 'Overdue task marked complete and removed from urgent list.');
      await fetchDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete urgent task.';
      toast.error('Completion Failed', msg);
    }
  };

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

  const recentLeads = leads.slice(0, 5);

  return (
    <PageShell
      title="Academy Dashboard"
      description="Real-time KPI metrics, enquiry conversion pipeline, and urgent follow-ups."
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            title="Refresh Metrics"
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
          <Link to="/leads" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <Plus size={15} />
            <span>Add Lead</span>
          </Link>
        </div>
      }
    >
      {/* Global Error Notice */}
      {errorMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.8125rem',
            marginBottom: '18px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 5 Reconciled Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: Total Enquiries */}
        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Total Enquiries</span>
            <Users size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            {loading ? '--' : kpis.totalLeads}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>All accessible leads</p>
        </div>

        {/* Card 2: New Enquiries */}
        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>New Enquiries</span>
            <span className="badge badge-sky">Pipeline</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            {loading ? '--' : kpis.newLeads}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Stage: New</p>
        </div>

        {/* Card 3: Converted Admissions */}
        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Admissions</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            {loading ? '--' : kpis.convertedLeads}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Stage: Converted</p>
        </div>

        {/* Card 4: Conversion Rate % */}
        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Conversion Rate</span>
            <TrendingUp size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--primary-600)' }}>
            {loading ? '0.0%' : `${kpis.conversionRate}%`}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Converted / Total leads</p>
        </div>

        {/* Card 5: Overdue Follow-ups */}
        <Link
          to="/followups"
          className="card card-body"
          style={{
            textDecoration: 'none',
            borderLeft: kpis.overdueFollowUps > 0 ? '4px solid #f43f5e' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Overdue Tasks</span>
            {kpis.overdueFollowUps > 0 ? (
              <AlertCircle size={18} color="#e11d48" />
            ) : (
              <Clock size={18} color="#10b981" />
            )}
          </div>
          <div
            style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: kpis.overdueFollowUps > 0 ? '#e11d48' : 'var(--slate-900)',
            }}
          >
            {loading ? '--' : kpis.overdueFollowUps}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>
            {kpis.overdueFollowUps > 0 ? 'Urgent attention required' : 'All follow-ups on time'}
          </p>
        </Link>
      </div>

      {/* Row 1: Visual Pipeline Funnel & Source Distribution (Two Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <PipelineFunnel stages={stages} totalLeads={kpis.totalLeads} loading={loading} />
        <SourceDistribution sources={sources} totalLeads={kpis.totalLeads} loading={loading} />
      </div>

      {/* Row 2: Urgent Follow-ups Widget & Recent Student Enquiries (Two Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Urgent Action Items Widget */}
        <UrgentFollowupsWidget
          followUps={urgentFollowUps}
          onComplete={handleCompleteFollowUp}
          loading={loading}
        />

        {/* Recent Enquiries Activity */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--primary-600)" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Recent Student Enquiries
              </h3>
            </div>
            <Link
              to="/leads"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--primary-600)',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            {recentLeads.length > 0 ? (
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-100)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)' }}>
                    <th style={{ padding: '10px 18px', fontWeight: 600 }}>Student Name</th>
                    <th style={{ padding: '10px 16px', fontWeight: 600 }}>Target Batch</th>
                    <th style={{ padding: '10px 16px', fontWeight: 600 }}>Source</th>
                    <th style={{ padding: '10px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 18px', fontWeight: 600, textAlign: 'right' }}>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid var(--slate-100)', fontSize: '0.8125rem' }}>
                      <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--slate-900)' }}>
                        {lead.full_name}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--slate-700)' }}>
                        {lead.course_interest}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <LeadSourceBadge source={lead.source} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <Link to={`/leads/${lead.id}`} style={{ color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ExternalLink size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--slate-500)' }}>
                <p style={{ fontSize: '0.875rem' }}>No student enquiries captured yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageShell>
  );
};
