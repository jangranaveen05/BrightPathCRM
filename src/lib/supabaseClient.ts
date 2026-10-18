import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  maskedKey: string;
  errorMessage?: string;
  isPlaceholder: boolean;
}

function checkIsPlaceholder(val?: string): boolean {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.includes('your-project') ||
    lower.includes('your-anon-key') ||
    lower.includes('example.com') ||
    lower.includes('placeholder')
  );
}

function validateConfig(): { isValid: boolean; error?: string; isPlaceholder: boolean } {
  if (!rawUrl || !rawKey) {
    return {
      isValid: false,
      error: 'Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing.',
      isPlaceholder: false,
    };
  }

  if (checkIsPlaceholder(rawUrl) || checkIsPlaceholder(rawKey)) {
    return {
      isValid: false,
      error: 'Environment variables contain default placeholder values. Real Supabase credentials are required.',
      isPlaceholder: true,
    };
  }

  try {
    const parsed = new URL(rawUrl);
    if (!parsed.protocol.startsWith('http')) {
      return { isValid: false, error: 'VITE_SUPABASE_URL must be a valid HTTP/HTTPS URL.', isPlaceholder: false };
    }
  } catch {
    return { isValid: false, error: 'VITE_SUPABASE_URL is not a valid URL.', isPlaceholder: false };
  }

  return { isValid: true, isPlaceholder: false };
}

const validation = validateConfig();

export const isSupabaseConfigured = validation.isValid;

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const maskedKey = rawKey
    ? `${rawKey.slice(0, 6)}...${rawKey.slice(-4)}`
    : 'Not configured';

  return {
    isConfigured: isSupabaseConfigured,
    url: rawUrl || 'Not configured',
    maskedKey,
    errorMessage: validation.error,
    isPlaceholder: validation.isPlaceholder,
  };
}

// Fallback dummy URL/key for client initialization to prevent app crash when unconfigured
const clientUrl = isSupabaseConfigured ? rawUrl! : 'https://unconfigured.supabase.co';
const clientKey = isSupabaseConfigured ? rawKey! : 'unconfigured-anon-key';

export const supabase: SupabaseClient = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
