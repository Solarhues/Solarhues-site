'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function VendorResetPasswordPage() {
  const [tokenHash, setTokenHash] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [verified, setVerified] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [logoutWarning, setLogoutWarning] = useState('');

  const lock = useRef(false);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (
      url.searchParams.get('type') === 'recovery' &&
      url.searchParams.get('token_hash')
    ) {
      setTokenHash(url.searchParams.get('token_hash'));
    } else {
      setError(
        'This page needs a valid recovery link. Request a new email ' +
        'from Forgot password on the installer login page.'
      );
    }

    setInitialized(true);
  }, []);

  async function verifyRecoveryLink() {
    if (lock.current || !tokenHash) return;

    lock.current = true;
    setBusy(true);
    setError('');

    try {
      const { data, error: verifyError } =
        await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });

      if (verifyError) throw verifyError;

      if (!data.session || !data.user) {
        throw new Error(
          'Recovery verification did not create a session. ' +
          'Please request a new recovery email.'
        );
      }

      setAccountEmail(data.user.email || '');
      setVerified(true);
      setTokenHash('');

      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname
      );
    } catch (err) {
      setError(
        err.message ||
        'This recovery link is invalid or expired. Request a new email.'
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();

    if (lock.current || !verified || done) return;

    setError('');

    if (password.length < 12) {
      setError('Use a password with at least 12 characters.');
      return;
    }

    if (password !== confirmation) {
      setError('The two passwords do not match.');
      return;
    }

    lock.current = true;
    setBusy(true);

    try {
      const { data: currentUser, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      if (
        !currentUser.user ||
        currentUser.user.email !== accountEmail
      ) {
        throw new Error(
          'Your session changed. Request a fresh recovery email.'
        );
      }

      const { error: updateError } =
        await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setPassword('');
      setConfirmation('');
      setDone(true);
      setVerified(false);

      const { error: signOutError } =
        await supabase.auth.signOut({ scope: 'local' });

      if (signOutError) {
        setLogoutWarning(
          'Your password was changed, but this browser could not ' +
          'sign out. Use a private window to test the new password.'
        );
      }
    } catch (err) {
      setError(err.message || 'Could not update your password.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="reset-page">
      <section className="card">
        <p className="eyebrow">SolarHues installer portal</p>
        <h1>Reset your password</h1>

        {!initialized && (
          <p role="status">Preparing recovery…</p>
        )}

        {error && (
          <div className="error" role="alert">{error}</div>
        )}

        {done ? (
          <div className="success" role="status">
            <p>Your password has been updated.</p>
            {logoutWarning && <p>{logoutWarning}</p>}
            <Link href="/vendor-login">
              Return to installer login →
            </Link>
          </div>
        ) : verified ? (
          <>
            <p className="hint">
              Set a new password for:
            </p>
            <p className="account-email">{accountEmail}</p>

            <form onSubmit={changePassword}>
              <fieldset disabled={busy}>
                <label htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />

                <label htmlFor="confirm-password">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  required
                  value={confirmation}
                  onChange={(event) =>
                    setConfirmation(event.target.value)
                  }
                />

                <p className="hint">
                  Use at least 12 characters and a password you do
                  not use elsewhere. Your project may enforce
                  additional password requirements.
                </p>

                <button type="submit">
                  {busy ? 'Updating…' : 'Save new password'}
                </button>
              </fieldset>
            </form>
          </>
        ) : tokenHash ? (
          <>
            <p className="hint">
              Verify your recovery link to choose a new password.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={verifyRecoveryLink}
            >
              {busy ? 'Verifying…' : 'Continue password reset'}
            </button>
          </>
        ) : null}

        {!done && (
          <p className="back-link">
            <Link href="/vendor-login">
              Back to login / request a new link
            </Link>
          </p>
        )}
      </section>

      <style jsx>{`
        .reset-page {
          min-height: 100vh;
          box-sizing: border-box;
          padding: 60px 20px;
          background: #1e293b;
          color: #f8fafc;
          font-family: Arial, sans-serif;
        }
        .card {
          max-width: 460px;
          margin: auto;
          padding: 28px;
          background: #0f172a;
          border: 1px solid #475569;
          border-radius: 20px;
        }
        .eyebrow {
          color: #facc15;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        h1 { font-size: 28px; }
        .hint {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 13px;
        }
        .account-email { overflow-wrap: anywhere; }
        fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
        label { display: block; margin-top: 20px; font-size: 14px; }
        input {
          box-sizing: border-box;
          width: 100%;
          margin-top: 8px;
          padding: 13px;
          border: 1px solid #64748b;
          border-radius: 9px;
          background: #1e293b;
          color: #fff;
          font: inherit;
        }
        button {
          width: 100%;
          padding: 13px;
          border: 0;
          border-radius: 9px;
          background: #facc15;
          color: #1e293b;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        button:disabled { opacity: 0.6; cursor: wait; }
        .error,
        .success {
          padding: 14px;
          margin: 18px 0;
          border-radius: 9px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }
        .error { background: #451a1a; color: #fecaca; }
        .success { background: #064e3b; color: #a7f3d0; }
        .card :global(a) { color: #facc15; }
        .back-link { margin-top: 24px; font-size: 13px; }
      `}</style>
    </main>
  );
}
