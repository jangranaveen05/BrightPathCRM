// ==============================================================================
// BrightPath CRM — LeadFilters Component
// Multi-criteria filter toolbar: Search, Status, Source, and Assignee
// ==============================================================================

import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import type { LeadFilterParams } from '../../services/leadsService';
import type { Profile, LeadStatus, LeadSource } from '../../types/database';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../types/database';

interface LeadFiltersProps {
  filters: LeadFilterParams;
  onChange: (filters: LeadFilterParams) => void;
  staffList: Profile[];
  totalResults: number;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onChange,
  staffList,
  totalResults,
}) => {
  const hasActiveFilters =
    !!filters.search ||
    (filters.status && filters.status !== 'ALL') ||
    (filters.source && filters.source !== 'ALL') ||
    (filters.assignedTo && filters.assignedTo !== 'ALL');

  const handleReset = () => {
    onChange({
      search: '',
      status: 'ALL',
      source: 'ALL',
      assignedTo: 'ALL',
    });
  };

  return (
    <div
      className="card"
      style={{
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            color="var(--slate-400)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input"
            placeholder="Search student name, phone, email, or course..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            style={{ paddingLeft: '36px', paddingRight: filters.search ? '32px' : '12px' }}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: '' })}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--slate-400)',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div style={{ minWidth: '150px' }}>
          <select
            className="select"
            value={filters.status || 'ALL'}
            onChange={(e) => onChange({ ...filters, status: e.target.value as LeadStatus | 'ALL' })}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            {LEAD_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Source Dropdown */}
        <div style={{ minWidth: '140px' }}>
          <select
            className="select"
            value={filters.source || 'ALL'}
            onChange={(e) => onChange({ ...filters, source: e.target.value as LeadSource | 'ALL' })}
            aria-label="Filter by Source"
          >
            <option value="ALL">All Sources</option>
            {LEAD_SOURCES.map((sc) => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee Dropdown */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="select"
            value={filters.assignedTo || 'ALL'}
            onChange={(e) => onChange({ ...filters, assignedTo: e.target.value })}
            aria-label="Filter by Assignee"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Action */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline btn-sm"
            style={{ gap: '6px', color: 'var(--slate-600)', padding: '8px 12px' }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Results Count & Active Tags Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--slate-500)',
          paddingTop: '6px',
          borderTop: '1px solid var(--slate-100)',
        }}
      >
        <span>
          Showing <strong>{totalResults}</strong> matching {totalResults === 1 ? 'enquiry' : 'enquiries'}
        </span>

        {hasActiveFilters && (
          <span style={{ color: 'var(--primary-600)', fontWeight: 500 }}>
            Filters Active
          </span>
        )}
      </div>
    </div>
  );
};
