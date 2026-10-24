// ==============================================================================
// BrightPath CRM — FollowUpsPage
// Actionable Enquiry Follow-up & Task Management Workspace
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { followUpsService, FollowUpCounts } from '../services/followUpsService';
import { leadsService } from '../services/leadsService';
import type { FollowUpWithLead, CreateFollowUpInput, Profile, LeadWithAssignee } from '../types/database';
import { FollowUpCard } from '../features/followups/FollowUpCard';
import { FollowUpModal } from '../features/followups/FollowUpModal';
import {
  Plus,
  RefreshCw,
  Search,
  AlertCircle,
  CalendarClock,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/common/useToast';

type TabKey = 'overdue' | 'today' | 'upcoming' | 'completed' | 'all';

export const FollowUpsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [followUps, setFollowUps] = useState<FollowUpWithLead[]>([]);
  const [counts, setCounts] = useState<FollowUpCounts>({
    overdue: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    all: 0,
  });
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [search, setSearch] = useState('');
  const [assignedTo, setAssignedTo] = useState('ALL');

  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [availableLeads, setAvailableLeads] = useState<LeadWithAssignee[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch follow-ups and counts based on active tab and filters
  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const [items, countData] = await Promise.all([
        followUpsService.getFollowUps({
          tab: activeTab,
          search,
          assignedTo: assignedTo === 'ALL' ? undefined : assignedTo,
        }),
        followUpsService.getFollowUpCounts(),
      ]);

      setFollowUps(items);
      setCounts(countData);
    } catch (err: unknown) {
      console.error('Failed to load follow-ups:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to retrieve follow-up tasks.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, assignedTo]);

  // Initial load: Fetch staff profiles and available student leads for modal dropdown
  useEffect(() => {
    async function initAuxData() {
      if (!isSupabaseConfigured) return;
      try {
        const [staff, leads] = await Promise.all([
          leadsService.getStaffProfiles(),
          leadsService.getLeads(),
        ]);
        setStaffList(staff);
        setAvailableLeads(leads);
      } catch (err) {
        console.warn('Unable to load auxiliary staff or leads data:', err);
      }
    }

    initAuxData();
  }, []);

  useEffect(() => {
    async function fetchFollowUps() {
      await loadData();
    }
    fetchFollowUps();
  }, [loadData]);

  // Handle Mark Complete
  const handleComplete = async (id: string, note?: string) => {
    try {
      await followUpsService.markComplete(id, user?.id, undefined, note);
      toast.success('Follow-up Completed', 'Task marked completed and logged in activity feed.');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete task.';
      setErrorMsg(msg);
      toast.error('Completion Failed', msg);
    }
  };

  // Handle Cancel
  const handleCancel = async (id: string) => {
    try {
      await followUpsService.cancelFollowUp(id);
      toast.info('Follow-up Cancelled', 'Task has been cancelled.');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel task.';
      setErrorMsg(msg);
      toast.error('Cancel Failed', msg);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    try {
      await followUpsService.deleteFollowUp(id);
      toast.info('Follow-up Deleted', 'Task removed from schedule.');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task.';
      setErrorMsg(msg);
      toast.error('Delete Failed', msg);
    }
  };

  // Handle Schedule Save
  const handleSaveFollowUp = async (data: CreateFollowUpInput) => {
    try {
      await followUpsService.createFollowUp(data, user?.id);
      toast.success('Follow-up Scheduled', 'Task successfully scheduled.');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule follow-up.';
      setErrorMsg(msg);
      toast.error('Scheduling Failed', msg);
    }
  };

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
      description="Schedule interactions, manage urgent overdue tasks, and track enquiry conversations."
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            title="Refresh Tasks"
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <Plus size={15} />
            <span>Schedule Follow-up</span>
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

      {/* Tab Navigation Toolbar with Dynamic Badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--slate-100)',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            flexWrap: 'wrap',
          }}
        >
          {/* Overdue Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8125rem',
              fontWeight: activeTab === 'overdue' ? 700 : 500,
              backgroundColor: activeTab === 'overdue' ? '#ffffff' : 'transparent',
              color: activeTab === 'overdue' ? '#e11d48' : 'var(--slate-700)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'overdue' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <AlertCircle size={14} />
            <span>Overdue</span>
            <span
              className="badge badge-rose"
              style={{ fontSize: '0.6875rem', padding: '1px 6px' }}
            >
              {counts.overdue}
            </span>
          </button>

          {/* Today Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8125rem',
              fontWeight: activeTab === 'today' ? 700 : 500,
              backgroundColor: activeTab === 'today' ? '#ffffff' : 'transparent',
              color: activeTab === 'today' ? '#d97706' : 'var(--slate-700)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'today' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Clock size={14} />
            <span>Today</span>
            <span
              className="badge badge-amber"
              style={{ fontSize: '0.6875rem', padding: '1px 6px' }}
            >
              {counts.today}
            </span>
          </button>

          {/* Upcoming Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8125rem',
              fontWeight: activeTab === 'upcoming' ? 700 : 500,
              backgroundColor: activeTab === 'upcoming' ? '#ffffff' : 'transparent',
              color: activeTab === 'upcoming' ? 'var(--primary-700)' : 'var(--slate-700)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'upcoming' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={14} />
            <span>Upcoming</span>
            <span
              className="badge badge-sky"
              style={{ fontSize: '0.6875rem', padding: '1px 6px' }}
            >
              {counts.upcoming}
            </span>
          </button>

          {/* Completed Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8125rem',
              fontWeight: activeTab === 'completed' ? 700 : 500,
              backgroundColor: activeTab === 'completed' ? '#ffffff' : 'transparent',
              color: activeTab === 'completed' ? '#059669' : 'var(--slate-700)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'completed' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <CheckCircle2 size={14} />
            <span>Completed</span>
            <span
              className="badge badge-emerald"
              style={{ fontSize: '0.6875rem', padding: '1px 6px' }}
            >
              {counts.completed}
            </span>
          </button>

          {/* All Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8125rem',
              fontWeight: activeTab === 'all' ? 700 : 500,
              backgroundColor: activeTab === 'all' ? '#ffffff' : 'transparent',
              color: activeTab === 'all' ? 'var(--slate-900)' : 'var(--slate-700)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'all' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={14} />
            <span>All Tasks</span>
            <span
              className="badge badge-slate"
              style={{ fontSize: '0.6875rem', padding: '1px 6px' }}
            >
              {counts.all}
            </span>
          </button>
        </div>

        {/* Filter Controls: Search & Assignee */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search
              size={15}
              color="var(--slate-400)"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Filter tasks or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-sm"
              style={{ paddingLeft: '32px', paddingRight: search ? '28px' : '10px' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--slate-400)',
                  padding: '2px',
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Assignee Filter */}
          <select
            className="select select-sm"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="ALL">All Counsellors</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List / Grid */}
      {loading ? (
        <div
          className="card"
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-600)' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>
            Retrieving Follow-up Tasks...
          </p>
        </div>
      ) : followUps.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '56px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarClock size={24} />
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
            {activeTab === 'overdue'
              ? 'Zero Overdue Tasks'
              : activeTab === 'today'
                ? 'No Tasks Due Today'
                : activeTab === 'upcoming'
                  ? 'No Upcoming Follow-ups'
                  : activeTab === 'completed'
                    ? 'No Completed Tasks Yet'
                    : 'No Follow-up Tasks Recorded'}
          </h3>

          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', maxWidth: '380px' }}>
            {activeTab === 'overdue'
              ? 'Great work! All prospective student follow-ups are up to date with zero overdue calls.'
              : activeTab === 'today'
                ? 'Check your upcoming tab or schedule a new interaction from the button above.'
                : 'Schedule a follow-up interaction directly from any student lead profile.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {followUps.map((item) => (
            <FollowUpCard
              key={item.id}
              followUp={item}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <FollowUpModal
        isOpen={isModalOpen}
        availableLeads={availableLeads}
        staffList={staffList}
        onSave={handleSaveFollowUp}
        onClose={() => setIsModalOpen(false)}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageShell>
  );
};
