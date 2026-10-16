'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Logo from '../../components/Logo';

export default function VendorLoginPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [signedInEmail, setSignedInEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (active) {
          setSignedInEmail(data.session?.user?.email || '');
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not check your session.');
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          setSignedInEmail(session?.user?.email || '');
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  function changeMode(nextResetMode) {
    setResetMode(nextResetMode);
    setPassword('');
    setError('');
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (busy) return;

    setError('');
    setMessage('');

    const cleanEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!resetMode && !password) {
      setError('Please enter your password.');
      return;
    }

    setBusy(true);

    try {
      if (resetMode) {
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo:
              `${window.location.origin}/vendor-reset-password`,
          });

        if (resetError) throw resetError;

        setMessage(
          'If an account exists for this email, a password-reset ' +
          'message will be sent. Check your inbox and spam folder. ' +
          'Use the newest email only.'
        );
      } else {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (loginError) throw loginError;

        setPassword('');
        router.replace('/vendor/crm');
        router.refresh();
      }
    } catch (err) {
      setError(
        err.message ||
        (resetMode
          ? 'Could not send the reset email. Please try again.'
          : 'Unable to sign in. Please try again.')
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    if (busy) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) throw logoutError;

      setSignedInEmail('');
      setPassword('');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not sign out.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <div className="container">
        <nav className="navigation" aria-label="Main navigation">
          <Logo />
          <Link href="/vendor-apply">Become an installer →</Link>
        </nav>

        <div className="layout">
          <section className="introduction">
            <p className="eyebrow">SolarHues installer portal</p>
            <h1>Your solar business, in one place.</h1>

            <p className="description">
              Manage your workspace, follow up with customers,
              prepare proposals, and track payment requests.
            </p>

            <ul>
              <li>Manage leads and customer details</li>
              <li>Track scheduled follow-ups</li>
              <li>Create itemized solar proposals</li>
              <li>Organize customer payment requests</li>
            </ul>

            <p className="hint">
              Workspace access depends on your assigned membership
              and permissions. Signing in does not automatically
              approve an installer application.
            </p>
          </section>

          <section className="card" aria-labelledby="login-heading">
            <p className="eyebrow">
              {resetMode ? 'Account recovery' : 'Welcome back'}
            </p>

            <h2 id="login-heading">
              {resetMode ? 'Reset your password' : 'Installer login'}
            </h2>

            {error && (
              <div className="error" role="alert">{error}</div>
            )}

            {message && (
              <div className="success" role="status">{message}</div>
            )}

            {checking ? (
              <p className="hint" role="status">
                Checking your session…
              </p>
            ) : signedInEmail && !resetMode ? (
              <>
                <p className="hint">You are signed in as:</p>
                <p className="account-email">{signedInEmail}</p>

                <Link href="/vendor/crm" className="primary-link">
                  Open installer CRM
                </Link>

                <button
                  type="button"
                  className="secondary"
                  disabled={busy}
                  onClick={handleLogout}
                >
                  {busy ? 'Signing out…' : 'Use a different account'}
                </button>

                <button
                  type="button"
                  className="text-button"
                  disabled={busy}
                  onClick={() => {
                    setEmail(signedInEmail);
                    changeMode(true);
                  }}
                >
                  Reset password by email
                </button>
              </>
            ) : (
              <>
                <p className="hint">
                  {resetMode
                    ? 'Enter your account email to request a recovery link.'
                    : 'Use the email and password for your existing account.'}
                </p>

                <form onSubmit={handleSubmit}>
                  <fieldset disabled={busy}>
                    <div className="field">
                      <label htmlFor="installer-email">
                        Email address
                      </label>
                      <input
                        id="installer-email"
                        type="email"
                        autoComplete="username"
                        placeholder="you@company.com"
                        value={email}
                        maxLength={254}
                        required
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                      />
                    </div>

                    {!resetMode && (
                      <>
                        <div className="field">
                          <label htmlFor="installer-password">
                            Password
                          </label>
                          <input
                            id="installer-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            required
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                          />
                        </div>

                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(event) =>
                              setShowPassword(event.target.checked)
                            }
                          />
                          Show password
                        </label>
                      </>
                    )}

                    <button type="submit" className="submit">
                      {busy
                        ? resetMode
                          ? 'Sending…'
                          : 'Signing in…'
                        : resetMode
                          ? 'Send password-reset email'
                          : 'Sign in'}
                    </button>
                  </fieldset>
                </form>

                <button
                  type="button"
                  className="text-button"
                  disabled={busy}
                  onClick={() => changeMode(!resetMode)}
                >
                  {resetMode
                    ? '← Back to login'
                    : 'Forgot password?'}
                </button>

                {!resetMode && (
                  <p className="hint">
                    Previously used email links?{' '}
                    <Link href="/login">
                      Open existing email-link login
                    </Link>
                  </p>
                )}
              </>
            )}

            <div className="application-prompt">
              <p className="hint">New to SolarHues?</p>
              <Link href="/vendor-apply/form">
                Apply as an installer →
              </Link>
            </div>
          </section>
        </div>

        <footer>
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          color: #f8fafc;
          background:
            radial-gradient(
              circle at top left,
              rgba(250, 204, 21, 0.15),
              transparent 40%
            ),
            #1e293b;
          font-family: Arial, sans-serif;
        }
        .container {
          width: min(1120px, calc(100% - 32px));
          margin: auto;
        }
        .navigation,
        footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          padding: 24px 0;
        }
        .login-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }
        .layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 48px;
          padding: 50px 0 70px;
          align-items: start;
        }
        .introduction,
        .card { min-width: 0; }
        .eyebrow {
          color: #facc15;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        h1 {
          margin: 0;
          font-size: clamp(36px, 5vw, 62px);
          line-height: 1.1;
        }
        h2 { margin: 0 0 18px; font-size: 28px; }
        .description,
        ul { color: #cbd5e1; line-height: 1.8; }
        li { margin-bottom: 10px; }
        .hint {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }
        .card {
          padding: 30px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 22px;
        }
        fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
        .field { display: grid; gap: 8px; margin-top: 20px; }
        label { font-size: 14px; color: #cbd5e1; }
        .field input {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          padding: 13px;
          border: 1px solid #64748b;
          border-radius: 10px;
          background: #1e293b;
          color: #fff;
          font: inherit;
        }
        .field input:focus {
          outline: 2px solid #facc15;
          outline-offset: 2px;
        }
        .toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 16px 0;
        }
        button,
        .card :global(a.primary-link) {
          box-sizing: border-box;
          display: block;
          width: 100%;
          padding: 13px 16px;
          border: 0;
          border-radius: 10px;
          background: #facc15;
          color: #1e293b;
          font: inherit;
          font-weight: 700;
          text-align: center;
          cursor: pointer;
        }
        .submit { margin-top: 20px; }
        button.secondary {
          margin-top: 12px;
          background: transparent;
          border: 1px solid #64748b;
          color: #cbd5e1;
        }
        button.text-button {
          margin-top: 14px;
          background: transparent;
          color: #facc15;
          text-decoration: underline;
          font-size: 14px;
        }
        button:disabled { opacity: 0.6; cursor: wait; }
        .error,
        .success {
          margin: 16px 0;
          padding: 14px;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }
        .error { background: #451a1a; color: #fecaca; }
        .success { background: #064e3b; color: #a7f3d0; }
        .account-email { overflow-wrap: anywhere; }
        .application-prompt {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid #334155;
        }
        footer { justify-content: center; }
        @media (max-width: 800px) {
          .layout { grid-template-columns: 1fr; padding-top: 20px; }
          .card { padding: 24px; }
        }
      `}</style>
    </main>
  );
}
