''use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../providers';
import Logo from '../../../components/Logo';

const MODULES = [
  {
    title: 'Overview',
    description:
      'See workspace counts, recent leads, recent proposals and pending payments.',
    path: 'overview',
  },
  {
    title: 'Leads and customers',
    description:
      'View customer enquiries, site information, sales stages and lead details.',
    path: '',
  },
  {
    title: 'Proposals',
    description:
      'Open all workspace proposals and review their items, pricing and status.',
    path: 'proposals',
  },
  {
    title: 'Follow-ups',
    description:
      'Review scheduled customer follow-ups and open the related lead.',
    path: 'follow-ups',
  },
  {
    title: 'Payment requests',
    description:
      'View payment requests, amounts, due dates and their related customers.',
    path: 'payments',
  },
];

const PLANNED_MODULES = [
  {
    title: 'Team and assignments',
    description:
      'Manage workspace roles and assign leads to sales executives.',
  },
  {
    title: 'Tasks and design requests',
    description:
      'Coordinate design, pricing, approvals and departmental work.',
  },
  {
    title: 'Projects and milestones',
    description:
      'Track procurement, delivery, installation, DISCOM work and handover.',
  },
];

export default function InstallerCrmPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [memberships, setMemberships] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [fetching, setFetching] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const [autoOpen, setAutoOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let active = true;

    setMemberships([]);
    setSelectedId('');
    setError('');
    setLoadedUserId(null);
    setRedirecting(false);

    if (loading || !user?.id) {
      setFetching(false);

      return () => {
        active = false;
      };
    }

    const userId = user.id;

    const showWorkspaceSelector =
      new URLSearchParams(window.location.search).get('select') === '1';

    setAutoOpen(!showWorkspaceSelector);

    async function loadWorkspaces() {
      setFetching(true);

      try {
        const { data, error: queryError } = await supabase
          .from('crm_workspace_members')
          .select(
            `
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
          `
          )
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
            (a.workspace.company_name || '').localeCompare(
              b.workspace.company_name || ''
            )
          );

        setMemberships(available);
        setSelectedId(available[0]?.workspace_id || '');
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not load your workspaces.');
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
  }, [user?.id, loading, retry]);

  const waiting =
    loading ||
    Boolean(user && (fetching || loadedUserId !== user.id));

  useEffect(() => {
    if (
      waiting ||
      !user ||
      error ||
      !autoOpen ||
      memberships.length !== 1
    ) {
      return;
    }

    const workspaceId = memberships[0].workspace.id;

    setRedirecting(true);

    router.replace(
      `/vendor/crm/${workspaceId}/overview`
    );
  }, [
    waiting,
    user,
    error,
    autoOpen,
    memberships,
    router,
  ]);

  const selected = memberships.find(
    (item) => item.workspace_id === selectedId
  );

  const workspace = selected?.workspace;

  const base = workspace
    ? `/vendor/crm/${workspace.id}`
    : '';

  return (
    <div className="crm-page">
      <header className="crm-header">
        <Logo height={34} />

        <nav aria-label="CRM entry navigation">
          <Link href="/">Home</Link>
          <Link href="/vendor-apply">Installer information</Link>
        </nav>
      </header>

      <main className="crm-main">
        <p className="crm-eyebrow">Installer workspace</p>
        <h1>Your workspaces</h1>

        <p className="crm-subtitle">
          Open your company dashboard to manage leads, proposals,
          follow-ups and payment requests.
        </p>

        {waiting && (
          <div className="crm-notice" role="status">
            Loading your workspaces…
          </div>
        )}

        {!loading && !user && (
          <div className="crm-notice">
            <h2>Sign in to continue</h2>

            <p>
              Use the account assigned to your installer workspace.
            </p>

            <Link href="/vendor-login">
              Go to installer login →
            </Link>
          </div>
        )}

        {!waiting && user && error && (
          <div className="crm-error" role="alert">
            <h2>Could not load your workspaces</h2>
            <p>{error}</p>

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
              workspace, or the workspace is suspended or expired.
            </p>

            <p className="account-email">
              Signed in as: {user.email || 'Email unavailable'}
            </p>

            <p>
              Contact your partner administrator or{' '}
              <a href="mailto:hello@solarhues.com">
                hello@solarhues.com
              </a>{' '}
              for access.
            </p>

            <Link href="/vendor-login">
              Review signed-in account →
            </Link>
          </div>
        )}

        {!waiting && user && !error && redirecting && (
          <div className="crm-notice" role="status">
            <p>Opening your workspace dashboard…</p>

            {workspace && (
              <Link href={`${base}/overview`}>
                Open {workspace.company_name} →
              </Link>
            )}
          </div>
        )}

        {!waiting && user && !error && workspace && !redirecting && (
          <>
            <div className="crm-selector">
              <label htmlFor="crm-workspace">
                {memberships.length > 1
                  ? 'Select company workspace'
                  : 'Company workspace'}
              </label>

              <select
                id="crm-workspace"
                value={selectedId}
                onChange={(event) =>
                  setSelectedId(event.target.value)
                }
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

            <section className="crm-company">
              <div className="company-heading">
                <div>
                  <h2>{workspace.company_name}</h2>

                  <div className="crm-badges">
                    <span>Workspace: {workspace.status}</span>
                    <span>Your role: {selected.member_role}</span>
                    <span>
                      Access plan: {workspace.access_plan || '—'}
                    </span>
                  </div>
                </div>

                <Link
                  href={`${base}/overview`}
                  className="primary-link"
                >
                  Open dashboard →
                </Link>
              </div>

              <dl>
                <div>
                  <dt>Signed-in account</dt>
                  <dd className="account-email">
                    {user.email || '—'}
                  </dd>
                </div>

                <div>
                  <dt>Workspace ID</dt>
                  <dd className="crm-id">{workspace.id}</dd>
                </div>
              </dl>

              <p className="crm-small">
                Workspace membership does not by itself confirm
                installer approval or payment of a subscription.
              </p>
            </section>

            <div className="quick-actions">
              <Link href={`${base}/overview`} className="primary-link">
                Overview
              </Link>

              <Link href={`${base}/new`} className="secondary-link">
                + Add lead
              </Link>
            </div>

            <section className="crm-grid" aria-label="Available CRM modules">
              {MODULES.map((module) => {
                const href = module.path
                  ? `${base}/${module.path}`
                  : base;

                return (
                  <Link
                    href={href}
                    className="crm-card"
                    key={module.title}
                  >
                    <span className="crm-badge">Available</span>
                    <h2>{module.title}</h2>
                    <p>{module.description}</p>
                    <span className="open-module">Open →</span>
                  </Link>
                );
              })}
            </section>

            <section className="planned-section">
              <h2>Next modules</h2>

              <p className="crm-subtitle">
                These workflows are planned and are not available yet.
              </p>

              <div className="crm-grid">
                {PLANNED_MODULES.map((module) => (
                  <article className="planned-card" key={module.title}>
                    <span className="planned-badge">Planned</span>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                  </article>
                ))}
              </div>
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
          max-width: 1100px;
          margin: 0 auto;
          padding: 36px 20px 72px;
        }

        .crm-eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: 0.12em;
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

        h3 {
          margin: 16px 0 10px;
          font-size: 18px;
        }

        .crm-subtitle {
          color: #cbd5e1;
          line-height: 1.6;
        }

        .crm-notice,
        .crm-error,
        .crm-company {
          margin-top: 24px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          line-height: 1.6;
        }

        .crm-error {
          color: #fca5a5;
          border-color: rgba(239, 68, 68, 0.4);
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

        .crm-selector label {
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 600;
        }

        select {
          box-sizing: border-box;
          width: 100%;
          padding: 12px;
          border: 1px solid #64748b;
          border-radius: 8px;
          background: #0f172a;
          color: #fff;
          font: inherit;
        }

        .company-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 18px;
        }

        .crm-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .crm-badges span,
        .crm-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(5, 150, 105, 0.15);
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

        .crm-id,
        .account-email {
          overflow-wrap: anywhere;
        }

        .crm-small {
          color: #94a3b8;
          font-size: 12px;
        }

        .quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 24px 0;
        }

        .crm-main :global(a.primary-link),
        .crm-main :global(a.secondary-link) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        .crm-main :global(a.primary-link) {
          background: #facc15;
          color: #1e293b;
        }

        .crm-main :global(a.secondary-link) {
          border: 1px solid #64748b;
          background: #0f172a;
          color: #f8fafc;
        }

        .crm-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .crm-main :global(a.crm-card) {
          display: block;
          min-width: 0;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          color: #f8fafc;
        }

        .crm-main :global(a.crm-card:hover) {
          border-color: #facc15;
          background: rgba(255, 255, 255, 0.05);
        }

        .crm-card h2 {
          margin-top: 16px;
        }

        .crm-card p,
        .planned-card p {
          color: #cbd5e1;
          line-height: 1.6;
        }

        .open-module {
          color: #facc15;
          font-size: 14px;
          font-weight: 700;
        }

        .planned-section {
          margin-top: 44px;
        }

        .planned-card {
          min-width: 0;
          padding: 24px;
          border: 1px dashed #475569;
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.35);
        }

        .planned-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 999px;
          background: #334155;
          color: #cbd5e1;
          font-size: 12px;
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
