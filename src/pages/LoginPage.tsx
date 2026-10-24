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
import { useToast } from '../components/common/useToast';
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
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to intended target or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleOneClickAdminLogin = async () => {
    setIsSignUp(false);
    setEmail('brightpath.crm.test@gmail.com');
    setPassword('Password123!');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await signIn({
        email: 'brightpath.crm.test@gmail.com',
        password: 'Password123!',
      });
      if (error) {
        setErrorMsg(error.message);
        toast.error('Sign In Failed', error.message);
      } else {
        toast.success('Welcome Back', 'Signed in as Administrator.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setErrorMsg(msg);
      toast.error('Authentication Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          const lower = error.message.toLowerCase();
          if (lower.includes('rate limit') || lower.includes('rate_limit')) {
            setErrorMsg(
              'Supabase email confirmation rate limit reached (free tier allows 3 emails/hour). Click the button below to sign in immediately using the active Admin account.'
            );
          } else {
            setErrorMsg(error.message);
          }
        } else {
          // If Supabase has email confirmation enabled
          if (user && !user.confirmed_at && user.identities?.length) {
            setSuccessMsg(
              'Account created! If email confirmation is enabled on your Supabase project, please check your inbox to confirm before signing in.'
            );
          } else {
            setSuccessMsg('Account registered successfully! You may now sign in.');
            toast.success('Registration Complete', 'Staff account created. You can now sign in.');
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
          toast.error('Sign In Failed', error.message);
        } else {
          toast.success('Welcome Back', 'Signed in successfully.');
          // Navigation handled by the isAuthenticated useEffect
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(msg);
      toast.error('Authentication Error', msg);
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
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.8125rem',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ lineHeight: 1.45 }}>{errorMsg}</p>
                {errorMsg.toLowerCase().includes('rate limit') && (
                  <button
                    type="button"
                    onClick={handleOneClickAdminLogin}
                    disabled={isSubmitting}
                    className="btn btn-sm"
                    style={{
                      marginTop: '10px',
                      backgroundColor: 'var(--primary-600)',
                      color: '#ffffff',
                      border: 'none',
                      width: '100%',
                      justifyContent: 'center',
                      fontWeight: 600,
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    🚀 1-Click Sign In as Admin Now
                  </button>
                )}
              </div>
            </div>
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

        {/* Register Tab Free-Tier Helper Notice */}
        {isSignUp && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#0369a1',
              fontSize: '0.75rem',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Info size={14} />
              <span>Supabase Free-Tier Note</span>
            </div>
            <p style={{ lineHeight: 1.4, margin: 0 }}>
              Supabase free tier rate-limits confirmation emails to 3 per hour. To test immediately without email confirmation, use the verified admin account below.
            </p>
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

          {/* 1-Click Instant Sign In as Admin */}
          <button
            type="button"
            onClick={handleOneClickAdminLogin}
            disabled={isSubmitting || !isSupabaseConfigured}
            className="btn btn-outline btn-sm"
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: '0.8125rem',
              color: 'var(--primary-700)',
              backgroundColor: 'var(--primary-50)',
              borderColor: 'var(--primary-200)',
              justifyContent: 'center',
              fontWeight: 600,
              gap: '6px',
            }}
          >
            <span>🚀 1-Click Instant Sign In as Admin</span>
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
