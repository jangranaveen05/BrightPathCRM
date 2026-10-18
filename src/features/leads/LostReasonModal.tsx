// ==============================================================================
// BrightPath CRM — LostReasonModal Component
// Mandatory dialog enforcing rationale before transitioning lead status to Lost
// ==============================================================================

import React, { useState } from 'react';
import { AlertTriangle, X, Check, Loader2 } from 'lucide-react';

interface LostReasonModalProps {
  isOpen: boolean;
  leadName: string;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

const COMMON_REASONS = [
  'Joined competitor institute due to batch timing conflict',
  'Fee structure exceeded family budget',
  'Relocated / travel distance to campus too far',
  'Decided on self-study / postponed preparation',
  'Enquiry invalid / duplicate / wrong phone number',
];

export const LostReasonModal: React.FC<LostReasonModalProps> = ({
  isOpen,
  leadName,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg('Please provide a specific lost reason (at least 5 characters).');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update status.');
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
        zIndex: 60,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lost-modal-title"
    >
      <div
        className="card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--slate-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff1f2',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#ffe4e6',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3
                id="lost-modal-title"
                style={{ fontSize: '1rem', fontWeight: 700, color: '#9f1239' }}
              >
                Mark Enquiry as Lost
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#be123c', marginTop: '2px' }}>
                Lead: <strong>{leadName}</strong>
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

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginBottom: '14px', lineHeight: '1.45' }}>
            BrightPath Academy policy requires an audit rationale before marking any enquiry as <strong>Lost</strong>.
            This insight helps our academic counselling team improve future conversion rates.
          </p>

          {/* Quick Reason Chips */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-600)', display: 'block', marginBottom: '8px' }}>
              Common Pre-set Reasons:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {COMMON_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setReason(preset);
                    setErrorMsg(null);
                  }}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: reason === preset ? 'var(--primary-500)' : 'var(--slate-200)',
                    backgroundColor: reason === preset ? 'var(--primary-50)' : 'var(--slate-50)',
                    color: reason === preset ? 'var(--primary-700)' : 'var(--slate-700)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Reason Field */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="lost-reason-input"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                marginBottom: '6px',
              }}
            >
              Explanation Details <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <textarea
              id="lost-reason-input"
              required
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="Explain why this student enquiry could not be converted..."
              className="textarea"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.75rem',
                marginBottom: '16px',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
              disabled={isSubmitting || !reason.trim()}
              className="btn btn-danger"
              style={{ gap: '6px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Confirm Lost Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
