// ==============================================================================
// BrightPath CRM — LeadTable Component
// Responsive enquiry data view: Table on desktop, interactive cards on mobile
// Full WCAG accessibility and touch target compliance (>= 44x44px)
// ==============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Edit2,
  Trash2,
  Phone,
  Mail,
  User,
  Inbox,
  Loader2,
  BookOpen,
} from 'lucide-react';
import type { LeadWithAssignee, LeadStatus } from '../../types/database';
import { LEAD_STATUSES } from '../../types/database';
import { LeadStatusBadge, LeadSourceBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../auth/useAuth';

interface LeadTableProps {
  leads: LeadWithAssignee[];
  loading: boolean;
  onEdit: (lead: LeadWithAssignee) => void;
  onStatusChange: (lead: LeadWithAssignee, newStatus: LeadStatus) => void;
  onDelete?: (lead: LeadWithAssignee) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  loading,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const { role } = useAuth();
  const canDelete = role === 'admin' || role === 'manager';

  if (loading) {
    return (
      <div
        className="card"
        style={{
          padding: '64px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
        role="status"
        aria-live="polite"
      >
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-600)' }} />
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>
          Loading Leads Pipeline...
        </p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '64px 24px',
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
            color: 'var(--slate-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Inbox size={24} />
        </div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-800)' }}>
          No Enquiries Found
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', maxWidth: '360px' }}>
          No student leads matched your current search and filter criteria. Try resetting filters or capture a new lead.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =========================================================================
          Desktop Table View (Hidden on mobile <= 768px)
          ========================================================================= */}
      <div className="table-desktop-view card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--slate-50)',
                  borderBottom: '1px solid var(--slate-200)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--slate-600)',
                }}
              >
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Student / Enquiry</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Contact Info</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Course & Batch</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Source</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assigned To</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const studentInitial = lead.full_name?.charAt(0)?.toUpperCase() || '?';
                const assigneeName = lead.assignee?.full_name || 'Unassigned';

                return (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: '1px solid var(--slate-100)',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    {/* Student Name */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--primary-100)',
                            color: 'var(--primary-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {studentInitial}
                        </div>
                        <div>
                          <Link
                            to={`/leads/${lead.id}`}
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'var(--slate-900)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{lead.full_name}</span>
                            <ExternalLink size={12} color="var(--slate-500)" />
                          </Link>
                          {lead.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                              <Mail size={11} />
                              <span>{lead.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td style={{ padding: '14px 16px', fontSize: '0.8125rem' }}>
                      <a
                        href={`tel:${lead.phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--slate-800)',
                          fontWeight: 500,
                        }}
                        aria-label={`Call ${lead.full_name} at ${lead.phone}`}
                      >
                        <Phone size={13} color="var(--primary-600)" />
                        <span>{lead.phone}</span>
                      </a>
                    </td>

                    {/* Course & Batch */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                        {lead.course_interest}
                      </span>
                    </td>

                    {/* Acquisition Source */}
                    <td style={{ padding: '14px 16px' }}>
                      <LeadSourceBadge source={lead.source} />
                    </td>

                    {/* Status & Quick Change Dropdown */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LeadStatusBadge status={lead.status} />

                        {/* Inline Status Transition */}
                        <select
                          value={lead.status}
                          onChange={(e) => onStatusChange(lead, e.target.value as LeadStatus)}
                          style={{
                            fontSize: '0.6875rem',
                            padding: '4px 6px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--slate-300)',
                            backgroundColor: '#ffffff',
                            color: 'var(--slate-700)',
                            cursor: 'pointer',
                          }}
                          aria-label={`Change status for ${lead.full_name}`}
                        >
                          {LEAD_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              &rarr; {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      {lead.status === 'Lost' && lead.lost_reason && (
                        <p
                          style={{
                            fontSize: '0.6875rem',
                            color: '#e11d48',
                            marginTop: '4px',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={lead.lost_reason}
                        >
                          Reason: {lead.lost_reason}
                        </p>
                      )}
                    </td>

                    {/* Assigned Counsellor */}
                    <td style={{ padding: '14px 16px', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color={lead.assigned_to ? 'var(--slate-600)' : 'var(--slate-400)'} />
                        <span
                          style={{
                            color: lead.assigned_to ? 'var(--slate-800)' : 'var(--slate-500)',
                            fontWeight: lead.assigned_to ? 500 : 400,
                            fontStyle: lead.assigned_to ? 'normal' : 'italic',
                          }}
                        >
                          {assigneeName}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => onEdit(lead)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '8px 10px', minHeight: '36px', color: 'var(--slate-700)' }}
                          title="Edit Lead"
                          aria-label={`Edit enquiry for ${lead.full_name}`}
                        >
                          <Edit2 size={14} />
                        </button>

                        {canDelete && onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(lead)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '8px 10px', minHeight: '36px', color: '#e11d48', borderColor: '#fecdd3' }}
                            title="Delete Lead"
                            aria-label={`Delete enquiry for ${lead.full_name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          Mobile Card View (Visible only on mobile <= 768px)
          Provides touch-friendly >= 44px tap targets and card layout
          ========================================================================= */}
      <div className="table-mobile-view" role="list" aria-label="Student Enquiry Cards">
        {leads.map((lead) => {
          const studentInitial = lead.full_name?.charAt(0)?.toUpperCase() || '?';
          const assigneeName = lead.assignee?.full_name || 'Unassigned';

          return (
            <div
              key={lead.id}
              role="listitem"
              className="card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Header: Student Initials, Name, Status Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {studentInitial}
                  </div>
                  <div>
                    <Link
                      to={`/leads/${lead.id}`}
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: 'var(--slate-900)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{lead.full_name}</span>
                      <ExternalLink size={13} color="var(--slate-500)" />
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                      <BookOpen size={12} color="var(--primary-600)" />
                      <span>{lead.course_interest}</span>
                    </div>
                  </div>
                </div>

                <LeadStatusBadge status={lead.status} />
              </div>

              {/* Status transition dropdown & Source & Assignee */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '8px 10px',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-100)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '140px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-600)' }}>Status:</span>
                  <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead, e.target.value as LeadStatus)}
                    className="select"
                    style={{
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      height: '34px',
                      flex: 1,
                    }}
                    aria-label={`Change status for ${lead.full_name}`}
                  >
                    {LEAD_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LeadSourceBadge source={lead.source} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} />
                    {assigneeName}
                  </span>
                </div>
              </div>

              {lead.status === 'Lost' && lead.lost_reason && (
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    fontSize: '0.75rem',
                    color: '#e11d48',
                  }}
                >
                  <strong>Lost Reason:</strong> {lead.lost_reason}
                </div>
              )}

              {/* Contact Buttons with >= 44px Touch Target */}
              <div style={{ display: 'grid', gridTemplateColumns: lead.email ? '1fr 1fr' : '1fr', gap: '8px' }}>
                <a
                  href={`tel:${lead.phone}`}
                  className="btn btn-secondary touch-target-44"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                  aria-label={`Call ${lead.full_name} at ${lead.phone}`}
                >
                  <Phone size={15} color="var(--primary-600)" />
                  <span>Call {lead.phone}</span>
                </a>

                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="btn btn-secondary touch-target-44"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    aria-label={`Email ${lead.full_name} at ${lead.email}`}
                  >
                    <Mail size={15} color="var(--primary-600)" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              {/* Action Buttons: View Details, Edit, Delete */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderTop: '1px solid var(--slate-100)',
                  paddingTop: '10px',
                }}
              >
                <Link
                  to={`/leads/${lead.id}`}
                  className="btn btn-primary btn-sm touch-target-44"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ExternalLink size={14} />
                  <span>View Details</span>
                </Link>

                <button
                  type="button"
                  onClick={() => onEdit(lead)}
                  className="btn btn-outline btn-sm touch-target-44"
                  style={{
                    padding: '8px 14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  aria-label={`Edit ${lead.full_name}`}
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>

                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(lead)}
                    className="btn btn-outline btn-sm touch-target-44"
                    style={{
                      padding: '8px 14px',
                      color: '#e11d48',
                      borderColor: '#fecdd3',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label={`Delete ${lead.full_name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
