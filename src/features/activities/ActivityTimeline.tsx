// ==============================================================================
// BrightPath CRM — ActivityTimeline Component
// Chronological enquiry interaction history with inline quick note / call logger
// ==============================================================================

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRightCircle,
  CalendarClock,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  User,
  Plus,
  Loader2,
  Clock,
  Send,
  Building2,
} from 'lucide-react';
import type { ActivityWithActor, ActivityType } from '../../types/database';

interface ActivityTimelineProps {
  activities: ActivityWithActor[];
  leadId: string;
  leadName: string;
  onLogActivity: (activityType: ActivityType, description: string) => Promise<void>;
  loading?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  onLogActivity,
  loading = false,
}) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('PHONE_CALL');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please enter a note or call summary.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onLogActivity(activityType, description.trim());
      setDescription('');
      setShowLogForm(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record activity log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'LEAD_CREATED':
        return {
          icon: <Sparkles size={14} color="#2563eb" />,
          bgColor: '#eff6ff',
          borderColor: '#bfdbfe',
          label: 'Enquiry Created',
        };
      case 'STATUS_CHANGED':
        return {
          icon: <ArrowRightCircle size={14} color="#7c3aed" />,
          bgColor: '#f5f3ff',
          borderColor: '#ddd6fe',
          label: 'Stage Transition',
        };
      case 'FOLLOWUP_SCHEDULED':
        return {
          icon: <CalendarClock size={14} color="#0284c7" />,
          bgColor: '#f0f9ff',
          borderColor: '#bae6fd',
          label: 'Follow-up Scheduled',
        };
      case 'FOLLOWUP_COMPLETED':
        return {
          icon: <CheckCircle2 size={14} color="#059669" />,
          bgColor: '#ecfdf5',
          borderColor: '#a7f3d0',
          label: 'Follow-up Done',
        };
      case 'PHONE_CALL':
        return {
          icon: <Phone size={14} color="#0d9488" />,
          bgColor: '#f0fdfa',
          borderColor: '#99f6e4',
          label: 'Phone Call',
        };
      case 'WHATSAPP_MESSAGE':
        return {
          icon: <MessageSquare size={14} color="#16a34a" />,
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          label: 'WhatsApp Chat',
        };
      case 'EMAIL_SENT':
        return {
          icon: <Mail size={14} color="#6366f1" />,
          bgColor: '#eef2ff',
          borderColor: '#c7d2fe',
          label: 'Email Sent',
        };
      case 'WALK_IN_VISIT':
        return {
          icon: <Building2 size={14} color="#d97706" />,
          bgColor: '#fffbeb',
          borderColor: '#fde68a',
          label: 'Branch Walk-in',
        };
      case 'NOTE_ADDED':
      default:
        return {
          icon: <FileText size={14} color="#475569" />,
          bgColor: '#f8fafc',
          borderColor: '#e2e8f0',
          label: 'Discussion Note',
        };
    }
  };

  return (
    <div className="card" style={{ padding: '24px', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            Interaction Timeline & History
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
            Complete audit trail of enquiries, stage transitions, calls, and counsellor notes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogForm((prev) => !prev)}
          className={showLogForm ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
          style={{ gap: '6px' }}
        >
          {showLogForm ? (
            <span>Close Form</span>
          ) : (
            <>
              <Plus size={14} />
              <span>Log Call / Add Note</span>
            </>
          )}
        </button>
      </div>

      {/* Inline Quick Log Form */}
      {showLogForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '16px',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-800)' }}>
              Record Interaction Activity
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(
                [
                  { type: 'PHONE_CALL', label: 'Phone Call', icon: Phone },
                  { type: 'NOTE_ADDED', label: 'Note', icon: FileText },
                  { type: 'WHATSAPP_MESSAGE', label: 'WhatsApp', icon: MessageSquare },
                  { type: 'WALK_IN_VISIT', label: 'Walk-in', icon: Building2 },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setActivityType(opt.type)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: activityType === opt.type ? 'var(--primary-600)' : 'var(--slate-200)',
                    backgroundColor: activityType === opt.type ? 'var(--primary-50)' : '#ffffff',
                    color: activityType === opt.type ? 'var(--primary-700)' : 'var(--slate-600)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: activityType === opt.type ? 600 : 500,
                  }}
                >
                  <opt.icon size={12} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <textarea
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Document what was discussed with student or parent..."
            className="textarea"
            style={{ width: '100%', resize: 'vertical' }}
          />

          {errorMsg && (
            <p style={{ fontSize: '0.75rem', color: '#e11d48', margin: 0 }}>{errorMsg}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="btn btn-secondary btn-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Save Interaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-400)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '0.8125rem' }}>Loading timeline activity...</p>
        </div>
      ) : activities.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-400)' }}>
          <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>
            No Activities Recorded Yet
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
            Schedule a follow-up or log your first call discussion above.
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '28px', marginTop: '8px' }}>
          {/* Vertical Connecting Line */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              bottom: '8px',
              left: '11px',
              width: '2px',
              backgroundColor: 'var(--slate-200)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activities.map((item) => {
              const badge = getActivityBadge(item.activity_type);
              const dateObj = new Date(item.created_at);
              const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  {/* Timeline Node Bullet */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-28px',
                      top: '2px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '9999px',
                      backgroundColor: badge.bgColor,
                      border: `2px solid ${badge.borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                    }}
                  >
                    {badge.icon}
                  </div>

                  {/* Activity Details Card */}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--slate-100)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: badge.bgColor,
                            color: 'var(--slate-800)',
                            border: `1px solid ${badge.borderColor}`,
                          }}
                        >
                          {badge.label}
                        </span>

                        {item.actor?.full_name && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              color: 'var(--slate-500)',
                            }}
                          >
                            <User size={12} />
                            <span>
                              {item.actor.full_name}
                              {item.actor.role ? ` (${item.actor.role})` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--slate-700)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
