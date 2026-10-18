// ==============================================================================
// BrightPath CRM — FollowUpCard Component
// Dynamic card component displaying due status, lead link, and completion actions
// ==============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  User,
  ExternalLink,
  Loader2,
  Trash2,
  XCircle,
} from 'lucide-react';
import type { FollowUpWithLead } from '../../types/database';
import { useAuth } from '../auth/useAuth';

interface FollowUpCardProps {
  followUp: FollowUpWithLead;
  onComplete: (id: string, note?: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  followUp,
  onComplete,
  onCancel,
  onDelete,
}) => {
  const { role } = useAuth();
  const canDelete = role === 'admin' || role === 'manager';

  const [isCompleting, setIsCompleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTimestamp] = useState(() => Date.now());

  const dueDate = new Date(followUp.due_at);
  const dueTime = dueDate.getTime();

  const isPending = followUp.status === 'pending';
  const isCompleted = followUp.status === 'completed';
  const isCancelled = followUp.status === 'cancelled';

  const nowDate = new Date(currentTimestamp);
  const isToday =
    dueDate.getDate() === nowDate.getDate() &&
    dueDate.getMonth() === nowDate.getMonth() &&
    dueDate.getFullYear() === nowDate.getFullYear();

  const isOverdue = isPending && dueTime < currentTimestamp && !isToday;
  const isDueTodayPending = isPending && isToday;

  // Format relative or absolute date
  const formatDueDisplay = () => {
    if (isCompleted) {
      const compDate = followUp.completed_at ? new Date(followUp.completed_at) : dueDate;
      return `Completed on ${compDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    if (isCancelled) {
      return 'Cancelled';
    }
    if (isDueTodayPending) {
      return `Due Today at ${dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (isOverdue) {
      const diffHours = Math.round((currentTimestamp - dueTime) / (1000 * 60 * 60));
      if (diffHours < 24) {
        return `Overdue by ${diffHours}h`;
      }
      const diffDays = Math.round(diffHours / 24);
      return `Overdue by ${diffDays}d (${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    }
    return `Due on ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
  };

  const handleCompleteClick = async () => {
    try {
      setIsCompleting(true);
      await onComplete(followUp.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelClick = async () => {
    if (!onCancel) return;
    const confirmed = window.confirm('Cancel this pending follow-up task?');
    if (!confirmed) return;

    try {
      setIsCancelling(true);
      await onCancel(followUp.id);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;
    const confirmed = window.confirm('Permanently delete this follow-up?');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete(followUp.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderLeft: isOverdue
          ? '4px solid #f43f5e'
          : isDueTodayPending
            ? '4px solid #f59e0b'
            : isCompleted
              ? '4px solid #10b981'
              : '4px solid var(--slate-300)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Top Header: Due Status Badge & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isOverdue && (
            <span
              className="badge badge-rose"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
            >
              <AlertCircle size={12} />
              <span>{formatDueDisplay()}</span>
            </span>
          )}

          {isDueTodayPending && (
            <span
              className="badge badge-amber"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
            >
              <Clock size={12} />
              <span>{formatDueDisplay()}</span>
            </span>
          )}

          {!isOverdue && !isDueTodayPending && isPending && (
            <span
              className="badge badge-sky"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <CalendarClock size={12} />
              <span>{formatDueDisplay()}</span>
            </span>
          )}

          {isCompleted && (
            <span
              className="badge badge-emerald"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <CheckCircle2 size={12} />
              <span>{formatDueDisplay()}</span>
            </span>
          )}

          {isCancelled && (
            <span
              className="badge badge-slate"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <XCircle size={12} />
              <span>Cancelled</span>
            </span>
          )}
        </div>

        {/* Delete button for Admin/Manager */}
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--slate-400)',
              padding: '4px',
            }}
            title="Delete Follow-up"
          >
            {isDeleting ? (
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        )}
      </div>

      {/* Student Lead Jump Link & Course Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <Link
            to={`/leads/${followUp.lead_id}`}
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--slate-900)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span>{followUp.lead?.full_name || 'Enquiry Profile'}</span>
            <ExternalLink size={12} color="var(--slate-400)" />
          </Link>

          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
            {followUp.lead?.course_interest || 'Prospective Student'}
          </p>
        </div>

        {followUp.lead?.phone && (
          <a
            href={`tel:${followUp.lead.phone}`}
            style={{
              fontSize: '0.75rem',
              color: 'var(--primary-700)',
              backgroundColor: 'var(--primary-50)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}
          >
            <Phone size={12} />
            <span>{followUp.lead.phone}</span>
          </a>
        )}
      </div>

      {/* Discussion Goal / Note */}
      <div
        style={{
          padding: '10px 12px',
          backgroundColor: 'var(--slate-50)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-100)',
          fontSize: '0.8125rem',
          color: 'var(--slate-700)',
          lineHeight: 1.45,
        }}
      >
        {followUp.note}
      </div>

      {/* Footer: Assignee & Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
          borderTop: '1px solid var(--slate-100)',
          marginTop: '2px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
          <User size={13} color="var(--slate-400)" />
          <span>{followUp.assignee?.full_name || 'Unassigned'}</span>
        </div>

        {isPending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onCancel && (
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={isCancelling || isCompleting}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            )}

            <button
              type="button"
              onClick={handleCompleteClick}
              disabled={isCompleting}
              className="btn btn-primary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
            >
              {isCompleting ? (
                <>
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  <span>Mark Done</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
