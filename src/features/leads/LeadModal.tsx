// ==============================================================================
// BrightPath CRM — LeadModal Component
// Accessible dialog for capturing new enquiries and editing existing leads
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Loader2, AlertCircle } from 'lucide-react';
import type {
  LeadWithAssignee,
  CreateLeadInput,
  UpdateLeadInput,
  LeadSource,
  LeadStatus,
  Profile,
} from '../../types/database';
import { LEAD_SOURCES, LEAD_STATUSES } from '../../types/database';

interface LeadModalProps {
  isOpen: boolean;
  lead?: LeadWithAssignee | null;
  staffList: Profile[];
  onSave: (data: CreateLeadInput | UpdateLeadInput) => Promise<void>;
  onClose: () => void;
}

const COMMON_COURSES = [
  'NEET Dropper 2026 Batch',
  'JEE Advanced Sprint',
  'Foundation Class 10th (NTSE/Olympiad)',
  'NEET 2-Year Integrated Program',
  'JEE 2-Year Program',
  'Class 12th Board Booster + CUET',
  'UPSC Prelims Comprehensive 2026',
  'NEET Crash Course 2026',
  'CUET Commerce & Humanities Sprint',
];

interface LeadModalDialogProps {
  lead?: LeadWithAssignee | null;
  staffList: Profile[];
  onSave: (data: CreateLeadInput | UpdateLeadInput) => Promise<void>;
  onClose: () => void;
}

const LeadModalDialog: React.FC<LeadModalDialogProps> = ({
  lead,
  staffList,
  onSave,
  onClose,
}) => {
  const isEditing = !!lead;

  const [fullName, setFullName] = useState(lead?.full_name || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [courseInterest, setCourseInterest] = useState(lead?.course_interest || '');
  const [source, setSource] = useState<LeadSource>(lead?.source || 'Website');
  const [status, setStatus] = useState<LeadStatus>(lead?.status || 'New');
  const [lostReason, setLostReason] = useState(lead?.lost_reason || '');
  const [assignedTo, setAssignedTo] = useState<string>(lead?.assigned_to || '');
  const [notes, setNotes] = useState(lead?.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMsg('Student full name is required.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone number is required.');
      return;
    }
    if (!courseInterest.trim()) {
      setErrorMsg('Course interest is required.');
      return;
    }
    if (status === 'Lost' && (!lostReason.trim() || lostReason.trim().length < 5)) {
      setErrorMsg('Please specify a lost reason of at least 5 characters.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload: CreateLeadInput | UpdateLeadInput = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        course_interest: courseInterest.trim(),
        source,
        status,
        assigned_to: assignedTo ? assignedTo : null,
        notes: notes.trim() || null,
        ...(status === 'Lost' ? { lost_reason: lostReason.trim() } : { lost_reason: null }),
      };

      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save lead record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 55,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '560px',
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
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <h3 id="lead-modal-title" style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                {isEditing ? 'Edit Enquiry Details' : 'Capture New Student Enquiry'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                BrightPath Coaching Admission Pipeline
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-outline btn-sm"
            style={{
              padding: '8px',
              border: 'none',
              background: 'transparent',
              minWidth: '40px',
              minHeight: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close dialog"
          >
            <X size={18} color="var(--slate-500)" />
          </button>
        </div>

        {/* Modal Scrollable Form */}
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

          {/* Full Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label htmlFor="lead-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '5px' }}>
                Student Name <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                id="lead-name"
                type="text"
                required
                className="input"
                placeholder="e.g. Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="lead-phone" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '5px' }}>
                Phone Number <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                id="lead-phone"
                type="tel"
                required
                className="input"
                placeholder="e.g. +91 98201 11223"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Email & Course Interest */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label htmlFor="lead-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '5px' }}>
                Email Address
              </label>
              <input
                id="lead-email"
                type="email"
                className="input"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="lead-course" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '5px' }}>
                Target Course / Batch <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                id="lead-course"
                type="text"
                required
                list="course-presets"
                className="input"
                placeholder="e.g. NEET Dropper 2026 Batch"
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
              />
              <datalist id="course-presets">
                {COMMON_COURSES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Source, Status & Assignee */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
            <div>
              <label htmlFor="lead-source" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '5px' }}>
                Acquisition Source <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <select
                id="lead-source"
                className="select"
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
              >
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lead-status" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '5px' }}>
                Pipeline Status
              </label>
              <select
                id="lead-status"
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
              >
                {LEAD_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lead-assignee" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '5px' }}>
                Assigned Counsellor
              </label>
              <select
                id="lead-assignee"
                className="select"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">— Unassigned —</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.full_name} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Lost Reason if status is Lost */}
          {status === 'Lost' && (
            <div style={{ backgroundColor: '#fff1f2', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #fecdd3' }}>
              <label htmlFor="modal-lost-reason" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#9f1239', marginBottom: '5px' }}>
                Lost Reason Explanation <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                id="modal-lost-reason"
                type="text"
                required
                className="input"
                placeholder="Reason why the enquiry was lost..."
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                style={{ borderColor: '#fda4af' }}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="lead-notes" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '5px' }}>
              Counsellor Notes / Parent Discussion
            </label>
            <textarea
              id="lead-notes"
              rows={3}
              className="textarea"
              placeholder="e.g. Student scored 510 in last NEET. Requested weekend test series schedule..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
              marginTop: '4px',
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? 'Save Changes' : 'Create Enquiry'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  lead,
  staffList,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <LeadModalDialog
      key={lead ? lead.id : 'new-lead'}
      lead={lead}
      staffList={staffList}
      onSave={onSave}
      onClose={onClose}
    />
  );
};
