// ==============================================================================
// BrightPath CRM — ReportsPage
// Comprehensive enquiry analytics, counsellor performance, and CSV exports
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  reportsService,
  CounsellorMetric,
  ReportFilterOptions,
} from '../services/reportsService';
import type { LeadWithAssignee } from '../types/database';
import { LEAD_SOURCES } from '../types/database';
import { LeadSourceBadge } from '../components/common/StatusBadge';
import {
  Download,
  RefreshCw,
  Users,
  CheckCircle2,
  TrendingUp,
  XCircle,
  Calendar,
  AlertCircle,
  BarChart2,
  Shield,
} from 'lucide-react';
import { useToast } from '../components/common/useToast';

export const ReportsPage: React.FC = () => {
  const toast = useToast();
  const [leads, setLeads] = useState<LeadWithAssignee[]>([]);
  const [counsellors, setCounsellors] = useState<CounsellorMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter state
  const [dateRange, setDateRange] = useState<ReportFilterOptions['dateRange']>('30d');
  const [source, setSource] = useState<string>('ALL');

  const fetchReports = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      const [leadsData, counsellorData] = await Promise.all([
        reportsService.getReportLeads({ dateRange, source }),
        reportsService.getCounsellorPerformance(),
      ]);

      setLeads(leadsData);
      setCounsellors(counsellorData);
    } catch (err: unknown) {
      console.error('Failed to load reports:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to retrieve reports.');
    } finally {
      setLoading(false);
    }
  }, [dateRange, source]);

  useEffect(() => {
    async function init() {
      await fetchReports();
    }
    init();
  }, [fetchReports]);

  const handleExportCsv = () => {
    try {
      reportsService.exportLeadsToCsv(leads);
      toast.success('CSV Export Generated', `Exported ${leads.length} student leads to spreadsheet.`);
    } catch {
      toast.error('Export Failed', 'Unable to generate CSV export.');
    }
  };

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

  // Calculate summary metrics for the filtered period
  const totalInPeriod = leads.length;
  const convertedInPeriod = leads.filter((l) => l.status === 'Converted').length;
  const lostInPeriod = leads.filter((l) => l.status === 'Lost').length;
  const conversionRateInPeriod =
    totalInPeriod > 0 ? ((convertedInPeriod / totalInPeriod) * 100).toFixed(1) : '0.0';

  // Calculate channel breakdown for filtered leads
  const channelBreakdown = LEAD_SOURCES.map((ch) => {
    const channelLeads = leads.filter((l) => l.source === ch);
    const count = channelLeads.length;
    const converted = channelLeads.filter((l) => l.status === 'Converted').length;
    const rate = count > 0 ? ((converted / count) * 100).toFixed(1) : '0.0';
    return { channel: ch, count, converted, rate };
  }).filter((ch) => source === 'ALL' || ch.channel === source);

  return (
    <PageShell
      title="Reports & Analytics"
      description="Inspect pipeline conversions, team counsellor performance, and export detailed CSV reports."
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            title="Refresh Report"
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={loading || leads.length === 0}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <Download size={14} />
            <span>Export CSV ({leads.length})</span>
          </button>
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

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} />
            <span>Time Window:</span>
          </span>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--slate-100)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              gap: '2px',
            }}
          >
            {(
              [
                { key: '7d', label: 'Last 7 Days' },
                { key: '30d', label: 'Last 30 Days' },
                { key: '90d', label: 'Last 90 Days' },
                { key: 'year', label: 'This Year' },
                { key: 'all', label: 'All Time' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setDateRange(opt.key)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: dateRange === opt.key ? 700 : 500,
                  backgroundColor: dateRange === opt.key ? '#ffffff' : 'transparent',
                  color: dateRange === opt.key ? 'var(--slate-900)' : 'var(--slate-600)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: dateRange === opt.key ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="report-source-filter" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>
            Channel:
          </label>
          <select
            id="report-source-filter"
            className="select select-sm"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="ALL">All Channels</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Period Inquiries</span>
            <Users size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            {loading ? '--' : totalInPeriod}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Captured in selected window</p>
        </div>

        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Admissions</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            {loading ? '--' : convertedInPeriod}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Successfully enrolled</p>
        </div>

        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Conversion Rate</span>
            <TrendingUp size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--primary-600)' }}>
            {loading ? '0.0%' : `${conversionRateInPeriod}%`}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Converted / Captured</p>
        </div>

        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>Lost Enquiries</span>
            <XCircle size={18} color="#e11d48" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#e11d48' }}>
            {loading ? '--' : lostInPeriod}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>With audited lost reason</p>
        </div>
      </div>

      {/* Team / Counsellor Performance Table */}
      <div className="card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="var(--primary-600)" />
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Counsellor Team Performance & Allocation
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
            {counsellors.length} active staff
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-100)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Counsellor Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Assigned Enquiries</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Admissions Converted</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Conversion Rate</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Overdue Tasks</th>
              </tr>
            </thead>
            <tbody>
              {counsellors.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--slate-100)', fontSize: '0.8125rem' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--slate-900)' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '14px 16px', textTransform: 'capitalize', color: 'var(--slate-600)' }}>
                    {c.role}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>
                    {c.assignedCount}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                    {c.convertedCount}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: parseFloat(c.conversionRate) > 0 ? '#ecfdf5' : 'var(--slate-100)',
                        color: parseFloat(c.conversionRate) > 0 ? '#059669' : 'var(--slate-600)',
                      }}
                    >
                      {c.conversionRate}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    {c.overdueTasks > 0 ? (
                      <span className="badge badge-rose" style={{ fontWeight: 700 }}>
                        {c.overdueTasks} Overdue
                      </span>
                    ) : (
                      <span className="badge badge-emerald">On Track</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acquisition Channel Breakdown Table */}
      <div className="card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={16} color="var(--primary-600)" />
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Acquisition Channel ROI & Performance
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
            Channel efficiency
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-100)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Source Channel</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Total Enquiries</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Admissions Converted</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Conversion %</th>
              </tr>
            </thead>
            <tbody>
              {channelBreakdown.map((ch) => (
                <tr key={ch.channel} style={{ borderBottom: '1px solid var(--slate-100)', fontSize: '0.8125rem' }}>
                  <td style={{ padding: '12px 18px' }}>
                    <LeadSourceBadge source={ch.channel} />
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>
                    {ch.count}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                    {ch.converted}
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--primary-700)' }}>
                    {ch.rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
};
