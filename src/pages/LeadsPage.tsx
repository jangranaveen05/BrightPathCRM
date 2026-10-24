// ==============================================================================
// BrightPath CRM — LeadsPage
// Primary Enquiry-to-Admission Pipeline Management Workspace
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { leadsService, LeadFilterParams } from '../services/leadsService';
import type { LeadWithAssignee, CreateLeadInput, UpdateLeadInput, LeadStatus, Profile } from '../types/database';
import { LeadTable } from '../features/leads/LeadTable';
import { LeadFilters } from '../features/leads/LeadFilters';
import { LeadModal } from '../features/leads/LeadModal';
import { LostReasonModal } from '../features/leads/LostReasonModal';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/common/useToast';

export const LeadsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [leads, setLeads] = useState<LeadWithAssignee[]>([]);
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<LeadFilterParams>({
    search: '',
    status: 'ALL',
    source: 'ALL',
    assignedTo: 'ALL',
  });

  // Modal State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadWithAssignee | null>(null);

  // Lost Reason Modal State
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [leadPendingLost, setLeadPendingLost] = useState<LeadWithAssignee | null>(null);

  // Fetch leads based on current filter state
  const loadLeads = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await leadsService.getLeads(filters);
      setLeads(data);
    } catch (err: unknown) {
      console.error('Failed to load leads:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load leads from database.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load: Fetch staff list and leads
  useEffect(() => {
    async function initData() {
      if (!isSupabaseConfigured) return;
      try {
        const staff = await leadsService.getStaffProfiles();
        setStaffList(staff);
      } catch (e) {
        console.warn('Unable to load staff profiles for filters:', e);
      }
      await loadLeads();
    }

    initData();
  }, [loadLeads]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingLead(null);
    setIsLeadModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (lead: LeadWithAssignee) => {
    setEditingLead(lead);
    setIsLeadModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSaveLead = async (data: CreateLeadInput | UpdateLeadInput) => {
    try {
      if (editingLead) {
        await leadsService.updateLead(editingLead.id, data as UpdateLeadInput, user?.id, editingLead.status);
        toast.success('Enquiry Updated', `Saved changes for "${data.full_name || editingLead.full_name}".`);
      } else {
        await leadsService.createLead(data as CreateLeadInput, user?.id);
        toast.success('Enquiry Created', `Added "${data.full_name}" to the admissions pipeline.`);
      }
      await loadLeads();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save lead record.';
      toast.error('Save Failed', msg);
      throw err;
    }
  };

  // Handle Status Transition from Table
  const handleStatusChange = async (lead: LeadWithAssignee, newStatus: LeadStatus) => {
    if (newStatus === lead.status) return;

    // If changing to 'Lost', trigger mandatory LostReasonModal
    if (newStatus === 'Lost') {
      setLeadPendingLost(lead);
      setIsLostModalOpen(true);
      return;
    }

    try {
      await leadsService.updateLead(lead.id, { status: newStatus }, user?.id, lead.status);
      toast.success('Status Updated', `Moved "${lead.full_name}" to ${newStatus}.`);
      await loadLeads();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      setErrorMsg(msg);
      toast.error('Status Update Failed', msg);
    }
  };

  // Confirm Lost Status with Reason
  const handleConfirmLost = async (reason: string) => {
    if (!leadPendingLost) return;
    try {
      await leadsService.updateLead(
        leadPendingLost.id,
        { status: 'Lost', lost_reason: reason },
        user?.id,
        leadPendingLost.status
      );
      toast.warning('Enquiry Marked as Lost', `Reason logged for "${leadPendingLost.full_name}".`);
      await loadLeads();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update lost status.';
      toast.error('Update Failed', msg);
      throw err;
    }
  };

  // Handle Delete Lead
  const handleDeleteLead = async (lead: LeadWithAssignee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the enquiry for "${lead.full_name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await leadsService.deleteLead(lead.id);
      toast.info('Enquiry Deleted', `Removed "${lead.full_name}" from database.`);
      await loadLeads();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete lead.';
      setErrorMsg(msg);
      toast.error('Delete Failed', msg);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <PageShell
        title="Leads Pipeline"
        description="Capture student enquiries, manage pipeline stages, and assign counsellors."
      >
        <ConfigShield featureName="Lead Management" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Leads Pipeline"
      description="Capture student enquiries, track admission stages, and assign counsellors."
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={loadLeads}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            title="Refresh Leads"
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <Plus size={15} />
            <span>Add New Lead</span>
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

      {/* Multi-Criteria Filters Toolbar */}
      <LeadFilters
        filters={filters}
        onChange={setFilters}
        staffList={staffList}
        totalResults={leads.length}
      />

      {/* Main Leads Table */}
      <LeadTable
        leads={leads}
        loading={loading}
        onEdit={handleOpenEditModal}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteLead}
      />

      {/* Create / Edit Modal Dialog */}
      <LeadModal
        isOpen={isLeadModalOpen}
        lead={editingLead}
        staffList={staffList}
        onSave={handleSaveLead}
        onClose={() => {
          setIsLeadModalOpen(false);
          setEditingLead(null);
        }}
      />

      {/* Mandatory Lost Reason Modal */}
      <LostReasonModal
        isOpen={isLostModalOpen}
        leadName={leadPendingLost?.full_name || 'Enquiry'}
        onConfirm={handleConfirmLost}
        onClose={() => {
          setIsLostModalOpen(false);
          setLeadPendingLost(null);
        }}
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
