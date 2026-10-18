// ==============================================================================
// BrightPath CRM — LeadDetailPage
// Comprehensive Deep-Dive View for an Individual Student Enquiry
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { leadsService } from '../services/leadsService';
import { followUpsService } from '../services/followUpsService';
import { activitiesService } from '../services/activitiesService';
import type {
  LeadWithAssignee,
  CreateLeadInput,
  UpdateLeadInput,
  LeadStatus,
  Profile,
  FollowUpWithLead,
  ActivityWithActor,
  ActivityType,
  CreateFollowUpInput,
} from '../types/database';
import { LeadStatusBadge, LeadSourceBadge } from '../components/common/StatusBadge';
import { LeadModal } from '../features/leads/LeadModal';
import { LostReasonModal } from '../features/leads/LostReasonModal';
import { FollowUpCard } from '../features/followups/FollowUpCard';
import { FollowUpModal } from '../features/followups/FollowUpModal';
import { ActivityTimeline } from '../features/activities/ActivityTimeline';
import {
  ArrowLeft,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  User,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  CalendarClock,
  Plus,
} from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const canDelete = role === 'admin' || role === 'manager';

  const [lead, setLead] = useState<LeadWithAssignee | null>(null);
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpWithLead[]>([]);
  const [activities, setActivities] = useState<ActivityWithActor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  const loadLeadData = useCallback(async () => {
    if (!id || !isSupabaseConfigured) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await leadsService.getLeadById(id);
      if (!data) {
        setErrorMsg('Enquiry record not found or access denied by security policies.');
      }
      setLead(data);
    } catch (err: unknown) {
      console.error('Error loading lead detail:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to retrieve enquiry.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadFollowUps = useCallback(async () => {
    if (!id || !isSupabaseConfigured) return;
    try {
      const data = await followUpsService.getFollowUpsForLead(id);
      setFollowUps(data);
    } catch (err) {
      console.error('Failed to load follow-ups for lead:', err);
    }
  }, [id]);

  const loadActivities = useCallback(async () => {
    if (!id || !isSupabaseConfigured) return;
    try {
      setLoadingActivities(true);
      const data = await activitiesService.getActivitiesForLead(id);
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities for lead:', err);
    } finally {
      setLoadingActivities(false);
    }
  }, [id]);

  useEffect(() => {
    async function init() {
      if (!isSupabaseConfigured) return;
      try {
        const staff = await leadsService.getStaffProfiles();
        setStaffList(staff);
      } catch (e) {
        console.warn('Unable to load staff profiles:', e);
      }
      await Promise.all([loadLeadData(), loadFollowUps(), loadActivities()]);
    }
    init();
  }, [loadLeadData, loadFollowUps, loadActivities]);

  const handleUpdate = async (data: CreateLeadInput | UpdateLeadInput) => {
    if (!id || !lead) return;
    await leadsService.updateLead(id, data as UpdateLeadInput, user?.id, lead.status);
    await Promise.all([loadLeadData(), loadActivities()]);
  };

  const handleQuickStatusChange = async (newStatus: LeadStatus) => {
    if (!id || !lead || newStatus === lead.status) return;

    if (newStatus === 'Lost') {
      setIsLostModalOpen(true);
      return;
    }

    try {
      await leadsService.updateLead(id, { status: newStatus }, user?.id, lead.status);
      await Promise.all([loadLeadData(), loadActivities()]);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleConfirmLost = async (reason: string) => {
    if (!id || !lead) return;
    await leadsService.updateLead(id, { status: 'Lost', lost_reason: reason }, user?.id, lead.status);
    await Promise.all([loadLeadData(), loadActivities()]);
  };

  const handleScheduleFollowUp = async (data: CreateFollowUpInput) => {
    await followUpsService.createFollowUp(data, user?.id);
    await Promise.all([loadFollowUps(), loadActivities()]);
  };

  const handleCompleteFollowUp = async (followUpId: string, note?: string) => {
    await followUpsService.markComplete(followUpId, user?.id, id, note);
    await Promise.all([loadFollowUps(), loadActivities()]);
  };

  const handleCancelFollowUp = async (followUpId: string) => {
    await followUpsService.cancelFollowUp(followUpId);
    await loadFollowUps();
  };

  const handleDeleteFollowUp = async (followUpId: string) => {
    await followUpsService.deleteFollowUp(followUpId);
    await loadFollowUps();
  };

  const handleLogActivity = async (activityType: ActivityType, description: string) => {
    if (!id) return;
    await activitiesService.logActivity(
      {
        lead_id: id,
        activity_type: activityType,
        description,
      },
      user?.id
    );
    await loadActivities();
  };

  const handleDelete = async () => {
    if (!id || !lead) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${lead.full_name}"?`
    );
    if (!confirmed) return;

    try {
      await leadsService.deleteLead(id);
      navigate('/leads');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete lead.');
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <PageShell title="Lead Details" description="Inspect lead history, interactions, and follow-ups.">
        <ConfigShield featureName="Lead Detail & Pipeline Management" />
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Lead Details" description="Retrieving enquiry record...">
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-600)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>
            Loading Enquiry Profile...
          </p>
        </div>
      </PageShell>
    );
  }

  if (!lead) {
    return (
      <PageShell title="Lead Details" description="Enquiry not found">
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <AlertCircle size={36} color="var(--rose-text, #e11d48)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            Enquiry Not Found
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '4px', marginBottom: '18px' }}>
            {errorMsg || 'The requested enquiry does not exist or you do not have permission to view it.'}
          </p>
          <Link to="/leads" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <ArrowLeft size={14} /> Back to Leads Pipeline
          </Link>
        </div>
      </PageShell>
    );
  }

  const studentInitial = lead.full_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <PageShell
      title={lead.full_name}
      description={`Enquiry captured on ${new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/leads" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <ArrowLeft size={14} /> Back to Leads
          </Link>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ gap: '6px' }}
          >
            <Edit2 size={14} /> Edit
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-outline btn-sm"
              style={{ color: '#e11d48', borderColor: '#fecdd3', gap: '6px' }}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      }
    >
      {/* Top Banner & Status Progression */}
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.375rem',
                fontWeight: 700,
              }}
            >
              {studentInitial}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {lead.full_name}
                </h1>
                <LeadStatusBadge status={lead.status} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                Target Batch: <strong>{lead.course_interest}</strong>
              </p>
            </div>
          </div>

          {/* Quick Pipeline Status Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', marginRight: '4px' }}>
              Transition Stage:
            </span>
            {(['New', 'Contacted', 'Qualified', 'Converted'] as LeadStatus[]).map((stage) => {
              const isCurrent = lead.status === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => handleQuickStatusChange(stage)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 700 : 500,
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isCurrent ? 'var(--primary-600)' : 'var(--slate-200)',
                    backgroundColor: isCurrent ? 'var(--primary-50)' : '#ffffff',
                    color: isCurrent ? 'var(--primary-700)' : 'var(--slate-700)',
                    cursor: isCurrent ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  disabled={isCurrent}
                >
                  {isCurrent && '✓ '} {stage}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handleQuickStatusChange('Lost')}
              style={{
                fontSize: '0.75rem',
                fontWeight: lead.status === 'Lost' ? 700 : 500,
                padding: '5px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: lead.status === 'Lost' ? '#f43f5e' : '#fecdd3',
                backgroundColor: lead.status === 'Lost' ? '#ffe4e6' : '#fff1f2',
                color: '#e11d48',
                cursor: lead.status === 'Lost' ? 'default' : 'pointer',
              }}
              disabled={lead.status === 'Lost'}
            >
              {lead.status === 'Lost' ? '✕ Marked Lost' : 'Mark as Lost'}
            </button>
          </div>
        </div>

        {/* If Lost: Highlight Lost Reason Alert */}
        {lead.status === 'Lost' && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <AlertTriangle size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#9f1239' }}>
                Lost Enquiry Rationale
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#be123c', marginTop: '3px', lineHeight: '1.4' }}>
                {lead.lost_reason || 'No specific explanation was recorded.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Contact & Enquiry Information */}
        <div className="card card-body">
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '16px' }}>
            Contact & Academic Profile
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={14} color="var(--primary-600)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Phone Number</p>
                <a href={`tel:${lead.phone}`} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                  {lead.phone}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={14} color="var(--primary-600)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Email Address</p>
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-600)' }}>
                    {lead.email}
                  </a>
                ) : (
                  <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>Not provided</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={14} color="var(--primary-600)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Target Batch</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                  {lead.course_interest}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={14} color="var(--primary-600)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Acquisition Channel</p>
                <div style={{ marginTop: '3px' }}>
                  <LeadSourceBadge source={lead.source} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Counselling Assignment & System Metadata */}
        <div className="card card-body">
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '16px' }}>
            Assignment & Tracking
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={14} color="var(--primary-600)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Assigned Counsellor</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                  {lead.assignee?.full_name || 'Unassigned'}
                  {lead.assignee?.role && ` (${lead.assignee.role})`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={14} color="var(--primary-600)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Captured On</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                  {new Date(lead.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={14} color="var(--primary-600)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Last Updated</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                  {new Date(lead.updated_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={14} color="var(--primary-600)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Captured By Staff</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                  {lead.creator?.full_name || 'System / Website'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Discussion Log */}
      <div className="card card-body" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '12px' }}>
          Counsellor Discussion Notes
        </h2>
        {lead.notes ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: '1.6', whiteSpace: 'pre-wrap', backgroundColor: 'var(--slate-50)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            {lead.notes}
          </p>
        ) : (
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
            No discussion notes recorded yet. Click &quot;Edit&quot; above to add counselling notes.
          </p>
        )}
      </div>

      {/* Follow-up Tasks Section */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Follow-up Tasks & Reminders
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              Planned calls, demo sessions, and parent consultations for {lead.full_name}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFollowUpModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <Plus size={14} />
            <span>Schedule Follow-up</span>
          </button>
        </div>

        {followUps.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-100)' }}>
            <CalendarClock size={28} color="var(--slate-300)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)' }}>
              No follow-up tasks currently scheduled
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
              Plan your next interaction or call reminder to advance this enquiry.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {followUps.map((fu) => (
              <FollowUpCard
                key={fu.id}
                followUp={fu}
                onComplete={handleCompleteFollowUp}
                onCancel={handleCancelFollowUp}
                onDelete={handleDeleteFollowUp}
              />
            ))}
          </div>
        )}
      </div>

      {/* Activity Timeline Section */}
      <div style={{ marginBottom: '24px' }}>
        <ActivityTimeline
          activities={activities}
          leadId={lead.id}
          leadName={lead.full_name}
          onLogActivity={handleLogActivity}
          loading={loadingActivities}
        />
      </div>

      {/* Edit Modal */}
      <LeadModal
        isOpen={isEditModalOpen}
        lead={lead}
        staffList={staffList}
        onSave={handleUpdate}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Lost Reason Modal */}
      <LostReasonModal
        isOpen={isLostModalOpen}
        leadName={lead.full_name}
        onConfirm={handleConfirmLost}
        onClose={() => setIsLostModalOpen(false)}
      />

      {/* Schedule FollowUp Modal */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        preselectedLeadId={lead.id}
        preselectedLeadName={lead.full_name}
        staffList={staffList}
        onSave={handleScheduleFollowUp}
        onClose={() => setIsFollowUpModalOpen(false)}
      />
    </PageShell>
  );
};
