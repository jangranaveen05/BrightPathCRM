// ==============================================================================
// BrightPath CRM — LoginPage
// Production-grade sign-in and staff registration with Supabase Auth
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to intended target or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setIsSubmitting(false);
          return;
        }

        const { error, user } = await signUp({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          // If Supabase has email confirmation enabled
          if (user && !user.confirmed_at && user.identities?.length) {
            setSuccessMsg(
              'Account created! If email confirmation is enabled on your Supabase project, please check your inbox to confirm before signing in.'
            );
          } else {
            setSuccessMsg('Account registered successfully! You may now sign in.');
            setIsSignUp(false);
          }
        }
      } else {
        const { error } = await signIn({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          // Navigation handled by the isAuthenticated useEffect
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--slate-50)',
        padding: '32px 16px',
        position: 'relative',
      }}
    >
      <div
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#ffffff',
          border: '1px solid var(--slate-200)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
              marginBottom: '16px',
            }}
          >
            <GraduationCap size={28} color="#ffffff" />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--slate-900)',
              letterSpacing: '-0.025em',
            }}
          >
            BrightPath Academy
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            {isSignUp ? 'Create your CRM staff account' : 'Sign in to access your CRM pipeline'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--slate-100)',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '0.8125rem',
              fontWeight: !isSignUp ? 600 : 500,
              color: !isSignUp ? 'var(--slate-900)' : 'var(--slate-600)',
              backgroundColor: !isSignUp ? '#ffffff' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: !isSignUp ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '0.8125rem',
              fontWeight: isSignUp ? 600 : 500,
              color: isSignUp ? 'var(--slate-900)' : 'var(--slate-600)',
              backgroundColor: isSignUp ? '#ffffff' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isSignUp ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Register Staff
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.8125rem',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '0.8125rem',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div>
              <label
                htmlFor="fullname-input"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                  marginBottom: '6px',
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  size={16}
                  color="var(--slate-400)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="fullname-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="email-input"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                marginBottom: '6px',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="var(--slate-400)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@brightpath.edu"
                className="input"
                style={{ paddingLeft: '36px' }}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password-input"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="var(--slate-400)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="password-input"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                style={{ paddingLeft: '36px' }}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isSupabaseConfigured}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '11px',
              marginTop: '6px',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>{isSignUp ? 'Registering...' : 'Signing in...'}</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Create Staff Account' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Informational Guidance Box */}
        <div
          style={{
            marginTop: '22px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--primary-600)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-800)' }}>
              Role-Based Access Control (RBAC)
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', lineHeight: '1.4' }}>
            New staff accounts default to the <strong>Counsellor</strong> role. To elevate to <strong>Admin</strong>, run{' '}
            <code style={{ fontSize: '0.6875rem', background: 'var(--slate-200)', padding: '1px 4px', borderRadius: '4px' }}>
              SELECT public.promote_user_to_admin(&apos;your-email&apos;);
            </code>{' '}
            in your Supabase SQL Editor.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#92400e',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>Supabase credentials required in .env</span>
          </div>
        )}
      </div>
    </div>
  );
};
