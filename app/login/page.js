'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../providers';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [finishingLogin, setFinishingLogin] = useState(true);

  useEffect(() => {
    let active = true;

    async function finishMagicLinkLogin() {
      const hash = window.location.hash;

      if (!hash || !hash.includes('access_token=')) {
        if (active) {
          setFinishingLogin(false);
        }
        return;
      }

      const hashParams = new URLSearchParams(hash.slice(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (!accessToken || !refreshToken) {
        if (active) {
          setError('This sign-in link is incomplete. Please request a new link.');
          setFinishingLogin(false);
        }
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error('Magic link session error:', sessionError);

        if (active) {
          setError(
            sessionError.message ||
              'This sign-in link is invalid or expired. Please request a new link.'
          );
          setFinishingLogin(false);
        }
        return;
      }

      window.history.replaceState({}, document.title, '/login');

      if (active) {
        router.replace('/dashboard');
      }
    }

    finishMagicLinkLogin();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setStatus('');
    setError('');

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (signInError) {
      console.error('Magic link request failed:', signInError);
      setError(signInError.message || 'Could not send the sign-in link.');
      setSubmitting(false);
      return;
    }

    setStatus(
      'Check your inbox for a SolarHues sign-in link. Please open the newest email.'
    );
    setSubmitting(false);
  }

  if (authLoading || finishingLogin) {
    return (
      <main className="login-page">
        <div className="login-card">
          <p className="login-loading">Completing sign-in…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <a className="login-brand" href="/">
          SolarHues
        </a>

        <p className="login-eyebrow">Customer access</p>
        <h1>Sign in to your dashboard</h1>
        <p className="login-description">
          Enter your email and we will send you a secure sign-in link.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Sending link…' : 'Email me a sign-in link'}
          </button>
        </form>

        {status ? (
          <p className="login-success" role="status">
            {status}
          </p>
        ) : null}

        {error ? (
          <p className="login-error" role="alert">
            {error}
          </p>
        ) : null}

        <p className="login-footnote">
          By continuing, you agree to the SolarHues terms and privacy policy.
        </p>
      </section>
    </main>
  );
}
