'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../providers';
import Logo from '../../../components/Logo';

export default function InstallerCrmPage() {
  const { user, loading } = useAuth();

  const [memberships, setMemberships] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [fetching, setFetching] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setMemberships([]);
    setSelectedId('');
    setError('');
    setLoadedUserId(null);

    if (!user?.id) {
      setFetching(false);
      return () => {
        active = false;
      };
    }

    const userId = user.id;

    async function loadWorkspaces() {
      setFetching(true);

      try {
        const { data, error: queryError } = await supabase
          .from('crm_workspace_members')
          .select(`
            workspace_id,
            member_role,
            is_active,
            workspace:crm_workspaces (
              id,
              company_name,
              status,
              access_plan,
              access_expires_at
            )
          `)
          .eq('user_id', userId)
          .eq('is_active', true);

        if (queryError) throw queryError;
        if (!active) return;

        const now = Date.now();

        const available = (data || [])
          .map((item) => ({
            ...item,
            workspace: Array.isArray(item.workspace)
              ? item.workspace[0]
              : item.workspace,
          }))
          .filter((item) => {
            const workspace = item.workspace;

            return (
              workspace &&
              workspace.status === 'active' &&
              (
                !workspace.access_expires_at ||
                new Date(workspace.access_expires_at).getTime() > now
              )
            );
          })
          .sort((a, b) =>
            a.workspace.company_name.localeCompare(
              b.workspace.company_name
            )
          );

        setMemberships(available);
        setSelectedId(available[0]?.workspace_id || '');
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not load your workspace.');
        }
      } finally {
        if (active) {
          setFetching(false);
          setLoadedUserId(userId);
        }
      }
    }

    loadWorkspaces();

    return () => {
      active = false;
    };
  }, [user?.id, retry]);

  const selected = memberships.find(
    (item) => item.workspace_id === selectedId
  );

  const workspace = selected?.workspace;

  const waiting =
    loading ||
    Boolean(
      user && (fetching || loadedUserId !== user.id)
    );

  return (
    <div className="crm-page">
      <header className="crm-header">
        <Logo height={34} />

        <nav aria-label="CRM navigation">
          <Link href="/">Home</Link>
          <Link href="/vendor/proposals/new">Proposal builder</Link>
        </nav>
      </header>

      <main className="crm-main">
        <p className="crm-eyebrow">Installer workspace</p>
        <h1>CRM dashboard</h1>
        <p className="crm-subtitle">
          Your company workspace for leads, proposals and projects.
        </p>

        {waiting && (
          <div className="crm-notice" role="status">
            Loading your workspace…
          </div>
        )}

        {!loading && !user && (
          <div className="crm-notice">
            Sign in using the account assigned to your installer workspace.
            <p>
              <Link href="/vendor-login">Go to sign in →</Link>
            </p>
          </div>
        )}

        {!waiting && user && error && (
          <div className="crm-error" role="alert">
            <p>Could not load your workspace: {error}</p>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {!waiting && user && !error && memberships.length === 0 && (
          <div className="crm-notice">
            <h2>No active workspace available</h2>
            <p>
              This account has no active membership in an available
              installer workspace, or workspace access has expired.
            </p>
            <p>
              Signed in as: {user.email || 'Email unavailable'}
            </p>
            <p>
              Contact{' '}
              <a href="mailto:hello@solarhues.com">
                hello@solarhues.com
              </a>{' '}
              for access.
            </p>
          </div>
        )}

        {!waiting && user && !error && workspace && (
          <>
            {memberships.length > 1 && (
              <div className="crm-selector">
                <label htmlFor="crm-workspace">
                  Select company workspace
                </label>
                <select
                  id="crm-workspace"
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                >
                  {memberships.map((item) => (
                    <option
                      key={item.workspace_id}
                      value={item.workspace_id}
                    >
                      {item.workspace.company_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <section className="crm-company">
              <h2>{workspace.company_name}</h2>

              <div className="crm-badges">
                <span>Workspace: {workspace.status}</span>
                <span>Your role: {selected.member_role}</span>
                <span>Access plan: {workspace.access_plan}</span>
              </div>

              <dl>
                <div>
                  <dt>Signed-in account</dt>
                  <dd>{user.email || '—'}</dd>
                </div>

                <div>
                  <dt>Workspace ID</dt>
                  <dd className="crm-id">{workspace.id}</dd>
                </div>
              </dl>

              <p className="crm-small">
                Workspace access does not by itself certify installer
                approval or confirm payment of a subscription.
              </p>
            </section>

            <section
              className="crm-grid"
              aria-label="CRM modules"
            >
              {[
                [
                  'Leads and customers',
                  'Add enquiries, record site details and track sales stages.',
                ],
                [
                  'Tasks and follow-ups',
                  'Schedule calls, site visits and document requests.',
                ],
                [
                  'Projects and milestones',
                  'Track installation progress and handover.',
                ],
                [
                  'Payment requests',
                  'Track agreed requests and verified receipts.',
                ],
              ].map(([title, description]) => (
                <article className="crm-card" key={title}>
                  <span className="crm-coming">Not built yet</span>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </article>
              ))}
            </section>

            <section className="crm-existing">
              <h2>Existing proposal builder</h2>
              <p>
                Your current proposal builder remains available.
                Proposals are not yet linked to this workspace.
              </p>

              <Link href="/vendor/proposals/new">
                Open existing proposal builder →
              </Link>
            </section>
          </>
        )}
      </main>

      <style jsx>{`
        .crm-page {
          min-height: 100vh;
          background: #1e293b;
          color: #f8fafc;
          font-family: Inter, -apple-system, sans-serif;
        }

        .crm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        nav {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }

        .crm-header :global(a),
        .crm-main :global(a) {
          color: #facc15;
          text-decoration: none;
        }

        .crm-main {
          max-width: 1040px;
          margin: 0 auto;
          padding: 36px 20px 72px;
        }

        .crm-eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-size: 12px;
          font-weight: 700;
        }

        h1 {
          margin: 0;
          font-size: 32px;
        }

        h2 {
          margin: 0 0 12px;
          font-size: 20px;
        }

        .crm-subtitle,
        .crm-card p,
        .crm-existing p {
          color: #cbd5e1;
          line-height: 1.6;
        }

        .crm-notice,
        .crm-error,
        .crm-company,
        .crm-existing {
          margin-top: 24px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px;
          background: rgba(255,255,255,.03);
          line-height: 1.6;
        }

        .crm-error {
          color: #fca5a5;
          border-color: rgba(239,68,68,.4);
        }

        button {
          padding: 10px 16px;
          border: 0;
          border-radius: 8px;
          background: #facc15;
          color: #1e293b;
          font-weight: 700;
          cursor: pointer;
        }

        .crm-selector {
          display: grid;
          gap: 8px;
          margin-top: 24px;
        }

        select {
          padding: 12px;
          border: 1px solid #64748b;
          border-radius: 8px;
          background: #0f172a;
          color: #fff;
        }

        .crm-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .crm-badges span,
        .crm-coming {
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(5,150,105,.15);
          color: #6ee7b7;
          font-size: 12px;
        }

        dl {
          display: grid;
          gap: 14px;
          margin-top: 22px;
        }

        dt {
          color: #94a3b8;
          font-size: 12px;
        }

        dd {
          margin: 3px 0 0;
        }

        .crm-id {
          overflow-wrap: anywhere;
        }

        .crm-small {
          color: #94a3b8;
          font-size: 12px;
        }

        .crm-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .crm-card {
          padding: 24px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 14px;
        }

        .crm-card h2 {
          margin-top: 16px;
        }

        @media (max-width: 640px) {
          .crm-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
