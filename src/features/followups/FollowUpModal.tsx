// ==============================================================================
// BrightPath CRM — FollowUpModal Component
// Accessible dialog for scheduling follow-up interactions with prospective students
// ==============================================================================

import React, { useState } from 'react';
import {
  X,
  CalendarClock,
  Save,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react';
import type { CreateFollowUpInput, Profile, LeadWithAssignee } from '../../types/database';

interface FollowUpModalProps {
  isOpen: boolean;
  preselectedLeadId?: string;
  preselectedLeadName?: string;
  availableLeads?: LeadWithAssignee[];
  staffList: Profile[];
  onSave: (data: CreateFollowUpInput) => Promise<void>;
  onClose: () => void;
}

// Helper to format Date to input datetime-local value (YYYY-MM-DDTHH:mm)
function formatForDateTimeInput(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function getInitialDueDateTime(): string {
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 1);
  defaultDueDate.setHours(10, 0, 0, 0);
  return formatForDateTimeInput(defaultDueDate);
}

const COMMON_FOLLOWUP_TEMPLATES = [
  'Share fee brochure & discuss scholarship options',
  'Follow up regarding demo class feedback',
  'Parent consultation on batch timings and faculty',
  'Verify admission token payment and seat reservation',
  'Follow up on entrance syllabus queries',
];

interface FollowUpModalDialogProps {
  preselectedLeadId?: string;
  preselectedLeadName?: string;
  availableLeads?: LeadWithAssignee[];
  staffList: Profile[];
  onSave: (data: CreateFollowUpInput) => Promise<void>;
  onClose: () => void;
}

const FollowUpModalDialog: React.FC<FollowUpModalDialogProps> = ({
  preselectedLeadId,
  preselectedLeadName,
  availableLeads = [],
  staffList,
  onSave,
  onClose,
}) => {
  const [leadId, setLeadId] = useState(preselectedLeadId || availableLeads[0]?.id || '');
  const [dueAt, setDueAt] = useState(getInitialDueDateTime);
  const [assignedTo, setAssignedTo] = useState('');
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Preset Handlers
  const applyPresetTime = (preset: 'plus2h' | 'tomorrow10am' | 'plus3d' | 'nextWeek') => {
    const target = new Date();
    if (preset === 'plus2h') {
      target.setHours(target.getHours() + 2);
    } else if (preset === 'tomorrow10am') {
      target.setDate(target.getDate() + 1);
      target.setHours(10, 0, 0, 0);
    } else if (preset === 'plus3d') {
      target.setDate(target.getDate() + 3);
      target.setHours(11, 0, 0, 0);
    } else if (preset === 'nextWeek') {
      target.setDate(target.getDate() + 7);
      target.setHours(10, 0, 0, 0);
    }
    setDueAt(formatForDateTimeInput(target));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadId) {
      setErrorMsg('Please select a student enquiry.');
      return;
    }
    if (!dueAt) {
      setErrorMsg('Please specify the follow-up due date and time.');
      return;
    }
    if (!note.trim()) {
      setErrorMsg('Please provide a follow-up discussion note.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await onSave({
        lead_id: leadId,
        due_at: new Date(dueAt).toISOString(),
        note: note.trim(),
        assigned_to: assignedTo ? assignedTo : null,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to schedule follow-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 55,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="followup-modal-title"
    >
      <div
        className="card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--slate-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarClock size={20} />
            </div>
            <div>
              <h3 id="followup-modal-title" style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Schedule Follow-up Interaction
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                BrightPath Academy Admission Pipeline
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-outline btn-sm"
            style={{ padding: '6px', border: 'none', background: 'transparent' }}
          >
            <X size={16} color="var(--slate-500)" />
          </button>
        </div>

        {/* Modal Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.8125rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Enquiry Selection */}
          <div>
            <label
              htmlFor="followup-lead-select"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                marginBottom: '6px',
              }}
            >
              Student Enquiry <span style={{ color: '#e11d48' }}>*</span>
            </label>
            {preselectedLeadId && preselectedLeadName ? (
              <div
                style={{
                  padding: '9px 12px',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-200)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--slate-800)',
                }}
              >
                {preselectedLeadName}
              </div>
            ) : (
              <select
                id="followup-lead-select"
                required
                className="select"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
              >
                <option value="">— Select Prospective Student —</option>
                {availableLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.full_name} ({l.course_interest} &bull; {l.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Due Date & Time Picker */}
          <div>
            <label
              htmlFor="followup-due-at"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                marginBottom: '6px',
              }}
            >
              Due Date & Time <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input
              id="followup-due-at"
              type="datetime-local"
              required
              className="input"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => applyPresetTime('plus2h')}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--slate-200)',
                  backgroundColor: 'var(--slate-50)',
                  color: 'var(--slate-700)',
                  cursor: 'pointer',
                }}
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => applyPresetTime('tomorrow10am')}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--slate-200)',
                  backgroundColor: 'var(--slate-50)',
                  color: 'var(--slate-700)',
                  cursor: 'pointer',
                }}
              >
                Tomorrow 10 AM
              </button>
              <button
                type="button"
                onClick={() => applyPresetTime('plus3d')}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--slate-200)',
                  backgroundColor: 'var(--slate-50)',
                  color: 'var(--slate-700)',
                  cursor: 'pointer',
                }}
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => applyPresetTime('nextWeek')}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--slate-200)',
                  backgroundColor: 'var(--slate-50)',
                  color: 'var(--slate-700)',
                  cursor: 'pointer',
                }}
              >
                Next Week
              </button>
            </div>
          </div>

          {/* Assigned Counsellor */}
          <div>
            <label
              htmlFor="followup-assignee"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                marginBottom: '6px',
              }}
            >
              Assigned Counsellor
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                color="var(--slate-400)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <select
                id="followup-assignee"
                className="select"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ paddingLeft: '36px' }}
              >
                <option value="">— Unassigned (Available to Any Counsellor) —</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.full_name} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Discussion Goal / Follow-up Note */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label
                htmlFor="followup-note"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                }}
              >
                Discussion Objective / Note <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <span style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>
                Target outcome
              </span>
            </div>
            <textarea
              id="followup-note"
              required
              rows={3}
              className="textarea"
              placeholder="e.g. Call parent to address fee installments and confirm attendance for Saturday orientation..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {/* Quick Templates */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {COMMON_FOLLOWUP_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl}
                  type="button"
                  onClick={() => setNote(tmpl)}
                  style={{
                    fontSize: '0.6875rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--slate-200)',
                    backgroundColor: '#ffffff',
                    color: 'var(--slate-600)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  &bull; {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--slate-100)',
              marginTop: '6px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ gap: '6px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Schedule Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  preselectedLeadId,
  preselectedLeadName,
  availableLeads,
  staffList,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <FollowUpModalDialog
      key={preselectedLeadId || 'global-followup'}
      preselectedLeadId={preselectedLeadId}
      preselectedLeadName={preselectedLeadName}
      availableLeads={availableLeads}
      staffList={staffList}
      onSave={onSave}
      onClose={onClose}
    />
  );
};
