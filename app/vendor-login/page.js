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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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

  async function handleLogin(event) {
    event.preventDefault();

    if (busy) return;

    setError('');

    const cleanEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setBusy(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) throw loginError;

      setPassword('');
      router.replace('/vendor/crm');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    if (busy) return;

    setBusy(true);
    setError('');

    try {
      const { error: logoutError } = await supabase.auth.signOut();

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
    <main className="vendor-login-page">
      <div className="container">
        <nav className="navigation" aria-label="Main navigation">
          <Logo />

          <Link href="/vendor-apply" className="outline-link">
            Become an installer
          </Link>
        </nav>

        <div className="login-layout">
          <section className="introduction">
            <p className="eyebrow">SolarHues installer portal</p>

            <h1>Your solar business, in one place.</h1>

            <p className="description">
              Sign in to your installer account to manage your workspace,
              follow up with customers, prepare proposals, and track
              payment requests.
            </p>

            <ul className="features">
              <li>Manage leads and customer details</li>
              <li>Track scheduled follow-ups</li>
              <li>Create itemized solar proposals</li>
              <li>Organize customer payment requests</li>
            </ul>

            <p className="access-note">
              Workspace access depends on your assigned membership and
              permissions. Signing in does not automatically approve an
              installer application.
            </p>
          </section>

          <section className="login-card" aria-labelledby="login-heading">
            <p className="eyebrow">Welcome back</p>
            <h2 id="login-heading">Installer login</h2>

            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}

            {checking ? (
              <p className="muted" role="status">
                Checking your session…
              </p>
            ) : signedInEmail ? (
              <div>
                <p className="muted">
                  You are signed in as:
                </p>

                <p className="account-email">{signedInEmail}</p>

                <Link href="/vendor/crm" className="primary-link">
                  Open installer CRM
                </Link>

                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy}
                  onClick={handleLogout}
                >
                  {busy ? 'Signing out…' : 'Use a different account'}
                </button>
              </div>
            ) : (
              <>
                <p className="muted">
                  Use the email and password for your existing account.
                </p>

                <form onSubmit={handleLogin}>
                  <fieldset disabled={busy}>
                    <div className="field">
                      <label htmlFor="installer-email">
                        Email address
                      </label>

                      <input
                        id="installer-email"
                        name="email"
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

                    <div className="field">
                      <label htmlFor="installer-password">
                        Password
                      </label>

                      <input
                        id="installer-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        required
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                      />
                    </div>

                    <label className="password-toggle">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(event) =>
                          setShowPassword(event.target.checked)
                        }
                      />
                      Show password
                    </label>

                    <button type="submit" className="submit-button">
                      {busy ? 'Signing in…' : 'Sign in'}
                    </button>
                  </fieldset>
                </form>

                <p className="help-note">
                  If your account was created using email links only,
                  you may not have a password yet. Use your existing
                  email-link login method instead.
                </p>

                <Link href="/login" className="text-link">
                  Open existing email-link login
                </Link>
              </>
            )}

            <div className="application-prompt">
              <p>New to SolarHues?</p>

              <Link href="/vendor-apply/form" className="text-link">
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
        .vendor-login-page {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          color: #f8fafc;
          background:
            radial-gradient(
              circle at top left,
              rgba(250, 204, 21, 0.18),
              transparent 35%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(5, 150, 105, 0.2),
              transparent 42%
            ),
            #1e293b;
          font-family: Arial, sans-serif;
        }

        .container {
          width: min(1120px, calc(100% - 32px));
          margin: 0 auto;
        }

        .navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding: 22px 0;
        }

        .navigation :global(.outline-link) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border: 1px solid rgba(250, 204, 21, 0.7);
          border-radius: 999px;
          color: #facc15;
          font-weight: 700;
          text-decoration: none;
        }

        .login-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          align-items: start;
          gap: 48px;
          padding: 58px 0 70px;
        }

        .introduction {
          padding-top: 20px;
          min-width: 0;
        }

        .eyebrow {
          margin: 0 0 12px;
          color: #facc15;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(36px, 5vw, 62px);
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        h2 {
          margin: 0 0 16px;
          font-size: 28px;
        }

        .description {
          margin: 24px 0;
          color: #cbd5e1;
          line-height: 1.75;
          font-size: 17px;
        }

        .features {
          display: grid;
          gap: 14px;
          padding-left: 22px;
          color: #e2e8f0;
          line-height: 1.5;
        }

        .access-note,
        .help-note {
          margin-top: 24px;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .login-card {
          min-width: 0;
          padding: 30px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 24px;
          background: rgba(15, 23, 42, 0.88);
          box-shadow: 0 20px 55px rgba(2, 6, 23, 0.25);
        }

        .muted {
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.65;
        }

        fieldset {
          min-width: 0;
          margin: 0;
          padding: 0;
          border: 0;
        }

        .field {
          display: grid;
          gap: 8px;
          margin-top: 20px;
        }

        .field label {
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 700;
        }

        .field input {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          padding: 13px 14px;
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

        .password-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 16px 0;
          color: #cbd5e1;
          font-size: 13px;
          cursor: pointer;
        }

        .password-toggle input {
          width: 16px;
          height: 16px;
          accent-color: #facc15;
        }

        .submit-button,
        .login-card :global(.primary-link) {
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 48px;
          padding: 13px 18px;
          border: 0;
          border-radius: 10px;
          background: #facc15;
          color: #1e293b;
          font: inherit;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .secondary-button {
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          border: 1px solid #64748b;
          border-radius: 10px;
          background: transparent;
          color: #cbd5e1;
          font: inherit;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .error {
          margin: 16px 0;
          padding: 12px 14px;
          border: 1px solid #b91c1c;
          border-radius: 10px;
          background: rgba(127, 29, 29, 0.25);
          color: #fecaca;
          font-size: 14px;
          line-height: 1.6;
        }

        .account-email {
          margin-bottom: 24px;
          overflow-wrap: anywhere;
          color: #e2e8f0;
          font-weight: 700;
        }

        .login-card :global(.text-link) {
          color: #facc15;
          font-size: 14px;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .application-prompt {
          margin-top: 26px;
          padding-top: 22px;
          border-top: 1px solid #334155;
        }

        .application-prompt p {
          color: #94a3b8;
          font-size: 14px;
        }

        footer {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 24px;
          padding: 20px 0 32px;
        }

        footer :global(a) {
          color: #94a3b8;
          font-size: 13px;
          text-decoration: none;
        }

        @media (max-width: 800px) {
          .login-layout {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 24px 0 40px;
          }

          .login-card {
            padding: 24px;
          }
        }
      `}</style>
    </main>
  );
}
