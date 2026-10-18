// ==============================================================================
// BrightPath CRM — LeadTable Component
// Responsive enquiry data table with inline status transitions and actions
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
            color: 'var(--slate-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Inbox size={24} />
        </div>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-800)' }}>
          No Enquiries Found
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', maxWidth: '360px' }}>
          No student leads matched your current search and filter criteria. Try resetting filters or capture a new lead.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
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
                color: 'var(--slate-500)',
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
                          <ExternalLink size={12} color="var(--slate-400)" />
                        </Link>
                        {lead.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
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
                        color: 'var(--slate-700)',
                        fontWeight: 500,
                      }}
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
                          padding: '2px 4px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--slate-200)',
                          backgroundColor: '#ffffff',
                          color: 'var(--slate-500)',
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
                      <User size={13} color={lead.assigned_to ? 'var(--slate-500)' : 'var(--slate-300)'} />
                      <span
                        style={{
                          color: lead.assigned_to ? 'var(--slate-800)' : 'var(--slate-400)',
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(lead)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '6px 8px', color: 'var(--slate-600)' }}
                        title="Edit Lead"
                        aria-label={`Edit ${lead.full_name}`}
                      >
                        <Edit2 size={13} />
                      </button>

                      {canDelete && onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(lead)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 8px', color: '#e11d48', borderColor: '#fecdd3' }}
                          title="Delete Lead"
                          aria-label={`Delete ${lead.full_name}`}
                        >
                          <Trash2 size={13} />
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
  );
};
