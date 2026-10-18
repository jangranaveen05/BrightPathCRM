import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '9999px',
          backgroundColor: 'var(--slate-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Compass size={28} color="var(--slate-400)" />
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: '0.9375rem', color: 'var(--slate-500)', maxWidth: '420px', marginBottom: '24px' }}>
        The route you are looking for does not exist in BrightPath CRM.
      </p>
      <Link to="/" className="btn btn-primary btn-sm">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>
    </div>
  );
};
