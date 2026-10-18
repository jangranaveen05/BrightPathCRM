import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { ConfigShield } from '../components/common/ConfigShield';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { ArrowLeft, User, Phone, Mail, BookOpen } from 'lucide-react';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!isSupabaseConfigured) {
    return (
      <PageShell title="Lead Details" description="Inspect lead history, interactions, and follow-ups.">
        <ConfigShield featureName="Lead Detail & Activity Timeline" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Lead Details"
      description={`Viewing enquiry profile reference: ${id || 'N/A'}`}
      actions={
        <Link to="/leads" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Leads
        </Link>
      }
    >
      <div className="card card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '9999px',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Student Enquiry Profile
            </h2>
            <span className="badge badge-amber" style={{ marginTop: '4px' }}>
              Status: New
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={16} color="var(--slate-400)" />
            <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>+91 98765 43210</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={16} color="var(--slate-400)" />
            <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>student@example.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={16} color="var(--slate-400)" />
            <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>Full Stack AI Coaching</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
};
