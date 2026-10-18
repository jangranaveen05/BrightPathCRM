// ==============================================================================
// BrightPath CRM — Reports & Analytics Service
// Pure database-backed metric aggregation with zero mock fallbacks
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { LeadStatus, LeadSource, LeadWithAssignee } from '../types/database';
import { LEAD_STATUSES, LEAD_SOURCES } from '../types/database';

export interface DashboardKPIs {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: string;
  overdueFollowUps: number;
  todayFollowUps: number;
}

export interface StageCount {
  status: LeadStatus;
  count: number;
  percentage: number;
}

export interface SourceCount {
  source: LeadSource;
  count: number;
  percentage: number;
}

export interface CounsellorMetric {
  id: string;
  name: string;
  role: string;
  assignedCount: number;
  convertedCount: number;
  conversionRate: string;
  overdueTasks: number;
}

export interface ReportFilterOptions {
  dateRange?: '7d' | '30d' | '90d' | 'year' | 'all';
  source?: string;
  course?: string;
}

export const reportsService = {
  /**
   * Retrieves reconciled high-level KPIs for the Dashboard
   */
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    if (!isSupabaseConfigured) {
      return {
        totalLeads: 0,
        newLeads: 0,
        convertedLeads: 0,
        conversionRate: '0.0',
        overdueFollowUps: 0,
        todayFollowUps: 0,
      };
    }

    const [leadsRes, followUpsRes] = await Promise.all([
      supabase.from('leads').select('id, status'),
      supabase.from('follow_ups').select('id, due_at, status'),
    ]);

    const leads = leadsRes.data || [];
    const followUps = followUpsRes.data || [];

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'New').length;
    const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
    const nowTime = now.getTime();

    let overdueFollowUps = 0;
    let todayFollowUps = 0;

    for (const fu of followUps) {
      if (fu.status === 'pending') {
        const dueTime = new Date(fu.due_at).getTime();
        if (dueTime < nowTime) {
          overdueFollowUps++;
        } else if (dueTime >= startOfToday && dueTime <= endOfToday) {
          todayFollowUps++;
        }
      }
    }

    return {
      totalLeads,
      newLeads,
      convertedLeads,
      conversionRate,
      overdueFollowUps,
      todayFollowUps,
    };
  },

  /**
   * Calculates distribution across pipeline stages
   */
  async getStageDistribution(leadsList?: LeadWithAssignee[]): Promise<StageCount[]> {
    let leads = leadsList;
    if (!leads && isSupabaseConfigured) {
      const { data } = await supabase.from('leads').select('status');
      leads = (data || []) as unknown as LeadWithAssignee[];
    }

    const total = leads?.length || 0;
    const countsMap = new Map<LeadStatus, number>();
    LEAD_STATUSES.forEach((st) => countsMap.set(st, 0));

    if (leads) {
      for (const l of leads) {
        if (countsMap.has(l.status)) {
          countsMap.set(l.status, (countsMap.get(l.status) || 0) + 1);
        }
      }
    }

    return LEAD_STATUSES.map((status) => {
      const count = countsMap.get(status) || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { status, count, percentage };
    });
  },

  /**
   * Calculates distribution across student acquisition channels
   */
  async getSourceDistribution(leadsList?: LeadWithAssignee[]): Promise<SourceCount[]> {
    let leads = leadsList;
    if (!leads && isSupabaseConfigured) {
      const { data } = await supabase.from('leads').select('source');
      leads = (data || []) as unknown as LeadWithAssignee[];
    }

    const total = leads?.length || 0;
    const countsMap = new Map<LeadSource, number>();
    LEAD_SOURCES.forEach((sc) => countsMap.set(sc, 0));

    if (leads) {
      for (const l of leads) {
        if (countsMap.has(l.source)) {
          countsMap.set(l.source, (countsMap.get(l.source) || 0) + 1);
        }
      }
    }

    return LEAD_SOURCES.map((source) => {
      const count = countsMap.get(source) || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { source, count, percentage };
    });
  },

  /**
   * Calculates team / counsellor performance statistics
   */
  async getCounsellorPerformance(): Promise<CounsellorMetric[]> {
    if (!isSupabaseConfigured) return [];

    const [staffRes, leadsRes, followUpsRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role').order('full_name', { ascending: true }),
      supabase.from('leads').select('id, assigned_to, status'),
      supabase.from('follow_ups').select('id, assigned_to, due_at, status'),
    ]);

    const staff = staffRes.data || [];
    const leads = leadsRes.data || [];
    const followUps = followUpsRes.data || [];

    const now = new Date().getTime();

    return staff.map((counsellor) => {
      const assignedLeads = leads.filter((l) => l.assigned_to === counsellor.id);
      const assignedCount = assignedLeads.length;
      const convertedCount = assignedLeads.filter((l) => l.status === 'Converted').length;
      const conversionRate = assignedCount > 0 ? ((convertedCount / assignedCount) * 100).toFixed(1) : '0.0';

      const overdueTasks = followUps.filter(
        (fu) =>
          fu.assigned_to === counsellor.id &&
          fu.status === 'pending' &&
          new Date(fu.due_at).getTime() < now
      ).length;

      return {
        id: counsellor.id,
        name: counsellor.full_name,
        role: counsellor.role,
        assignedCount,
        convertedCount,
        conversionRate,
        overdueTasks,
      };
    });
  },

  /**
   * Retrieves filtered report leads dataset for ReportsPage
   */
  async getReportLeads(options?: ReportFilterOptions): Promise<LeadWithAssignee[]> {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('leads')
      .select(`
        *,
        assignee:profiles!leads_assigned_to_fkey(id, full_name, role),
        creator:profiles!leads_created_by_fkey(id, full_name)
      `)
      .order('created_at', { ascending: false });

    // Date range filter
    if (options?.dateRange && options.dateRange !== 'all') {
      const now = new Date();
      let pastDate = new Date();
      if (options.dateRange === '7d') {
        pastDate.setDate(now.getDate() - 7);
      } else if (options.dateRange === '30d') {
        pastDate.setDate(now.getDate() - 30);
      } else if (options.dateRange === '90d') {
        pastDate.setDate(now.getDate() - 90);
      } else if (options.dateRange === 'year') {
        pastDate = new Date(now.getFullYear(), 0, 1);
      }
      query = query.gte('created_at', pastDate.toISOString());
    }

    if (options?.source && options.source !== 'ALL') {
      query = query.eq('source', options.source as LeadSource);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching report leads:', error.message);
      return [];
    }

    return (data || []) as unknown as LeadWithAssignee[];
  },

  /**
   * Generates CSV download for exported reports
   */
  exportLeadsToCsv(leads: LeadWithAssignee[]): void {
    const headers = [
      'Student Name',
      'Phone',
      'Email',
      'Target Course',
      'Acquisition Source',
      'Status',
      'Lost Reason',
      'Assigned Counsellor',
      'Captured On',
      'Notes',
    ];

    const escapeCsv = (val: string | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = leads.map((l) => [
      escapeCsv(l.full_name),
      escapeCsv(l.phone),
      escapeCsv(l.email),
      escapeCsv(l.course_interest),
      escapeCsv(l.source),
      escapeCsv(l.status),
      escapeCsv(l.lost_reason),
      escapeCsv(l.assignee?.full_name || 'Unassigned'),
      escapeCsv(new Date(l.created_at).toLocaleDateString()),
      escapeCsv(l.notes),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `brightpath-crm-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
