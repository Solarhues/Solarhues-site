'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';
import Logo from '../../../../../components/Logo';

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function WorkspaceOverviewPage() {
  const { workspaceId } = useParams();
  const { user, loading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [canRead, setCanRead] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');

  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentProposals, setRecentProposals] = useState([]);
  const [dataError, setDataError] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  const loadKey = `${user?.id || ''}:${workspaceId || ''}`;

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setCanRead(false);
    setLoadedFor('');
    setAccessError('');

    if (!user?.id || !workspaceId) {
      return () => {
        active = false;
      };
    }

    async function loadAccess() {
      try {
        const [workspaceResult, memberResult, profileResult] =
          await Promise.all([
            supabase
              .from('crm_workspaces')
              .select('id, company_name, status, access_expires_at')
              .eq('id', workspaceId)
              .maybeSingle(),
            supabase
              .from('crm_workspace_members')
              .select('member_role, is_active')
              .eq('workspace_id', workspaceId)
              .eq('user_id', user.id)
              .maybeSingle(),
            supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle(),
          ]);

        const queryError =
          workspaceResult.error ||
          memberResult.error ||
          profileResult.error;

        if (queryError) throw queryError;
        if (!active) return;

        const company = workspaceResult.data;
        const member = memberResult.data;
        const isAdmin = profileResult.data?.role === 'admin';

        const available =
          company &&
          company.status === 'active' &&
          (!company.access_expires_at ||
            new Date(company.access_expires_at).getTime() > Date.now());

        if (!available) {
          throw new Error(
            'Workspace unavailable, suspended, expired, or inaccessible.'
          );
        }

        const memberCanRead =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        setWorkspace(company);
        setCanRead(Boolean(isAdmin || memberCanRead));
      } catch (err) {
        if (active) {
          setAccessError(err.message || 'Could not check workspace access.');
        }
      } finally {
        if (active) setLoadedFor(loadKey);
      }
    }

    loadAccess();

    return () => {
      active = false;
    };
  }, [user?.id, workspaceId, loadKey]);

  useEffect(() => {
    let active = true;

    setStats(null);
    setRecentLeads([]);
    setRecentProposals([]);
    setDataError('');

    if (!user?.id || !workspaceId || !canRead) {
      return () => {
        active = false;
      };
    }

    async function loadData() {
      setDataLoading(true);

      try {
        const count = (table) =>
          supabase
            .from(table)
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId);

        const nowIso = new Date().toISOString();

        const [
          leadsTotal,
          leadsNew,
          followUpsDue,
          proposalsDraft,
          proposalsSent,
          proposalsAccepted,
          pendingPayments,
          latestLeads,
          latestProposals,
        ] = await Promise.all([
          count('crm_leads'),
          count('crm_leads').eq('stage', 'new'),
          count('crm_leads')
            .not('next_follow_up_at', 'is', null)
            .lte('next_follow_up_at', nowIso)
            .not('stage', 'in', '(won,lost)'),
          count('crm_proposals').eq('status', 'draft'),
          count('crm_proposals').eq('status', 'sent'),
          count('crm_proposals').eq('status', 'accepted'),
          supabase
            .from('crm_payment_requests')
            .select('amount_inr')
            .eq('workspace_id', workspaceId)
            .eq('status', 'pending')
            .limit(1000),
          supabase
            .from('crm_leads')
            .select('id, customer_name, city, stage, created_at')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('crm_proposals')
            .select(
              `
              id,
              lead_id,
              proposal_number,
              status,
              total_inr,
              created_at,
              crm_leads ( customer_name )
            `
            )
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        const firstError = [
          leadsTotal,
          leadsNew,
          followUpsDue,
          proposalsDraft,
          proposalsSent,
          proposalsAccepted,
          pendingPayments,
          latestLeads,
          latestProposals,
        ].find((result) => result.error)?.error;

        if (firstError) throw firstError;
        if (!active) return;

        const pendingRows = pendingPayments.data || [];

        setStats({
          leadsTotal: leadsTotal.count || 0,
          leadsNew: leadsNew.count || 0,
          followUpsDue: followUpsDue.count || 0,
          proposalsDraft: proposalsDraft.count || 0,
          proposalsSent: proposalsSent.count || 0,
          proposalsAccepted: proposalsAccepted.count || 0,
          pendingCount: pendingRows.length,
          pendingAmount: pendingRows.reduce(
            (total, row) => total + Number(row.amount_inr || 0),
            0
          ),
        });
        setRecentLeads(latestLeads.data || []);
        setRecentProposals(latestProposals.data || []);
      } catch (err) {
        if (active) {
          setDataError(err.message || 'Could not load the dashboard.');
        }
      } finally {
        if (active) setDataLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [user?.id, workspaceId, canRead]);

  const base = `/vendor/crm/${workspaceId}`;
  const waiting = loading || Boolean(user && loadedFor !== loadKey);

  const cards = stats
    ? [
        ['Total leads', stats.leadsTotal, base],
        ['New leads', stats.leadsNew, base],
        ['Follow-ups due', stats.followUpsDue, `${base}/follow-ups`],
        ['Draft proposals', stats.proposalsDraft, `${base}/proposals`],
        ['Sent proposals', stats.proposalsSent, `${base}/proposals`],
        ['Accepted proposals', stats.proposalsAccepted, `${base}/proposals`],
        [
          `Pending payments (${stats.pendingCount})`,
          formatMoney(stats.pendingAmount),
          `${base}/payments`,
        ],
      ]
    : [];

  return (
    <div className="overview-page">
      <header>
        <Logo height={34} />
        <Link href="/vendor/crm">← All workspaces</Link>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Overview</h1>

        {waiting && <p role="status">Checking workspace access…</p>}

        {!loading && !user && (
          <div className="notice">
            Please <Link href="/vendor-login">sign in</Link> first.
          </div>
        )}

        {!waiting && user && accessError && (
          <div className="error" role="alert">
            {accessError}
          </div>
        )}

        {!waiting && user && workspace && !canRead && (
          <div className="notice">
            Only workspace owners, sales staff and SolarHues admins can view
            this dashboard.
          </div>
        )}

        {!waiting && user && workspace && canRead && (
          <>
            <p className="subtitle">{workspace.company_name}</p>

            <div className="actions">
              <Link href={`${base}/new`} className="primary">
                + Add lead
              </Link>
              <Link href={base} className="ghost">
                View all leads
              </Link>
              <Link href={`${base}/proposals`} className="ghost">
                View all proposals
              </Link>
            </div>

            {dataError && (
              <div className="error" role="alert">
                {dataError}
              </div>
            )}

            {dataLoading && <p role="status">Loading dashboard…</p>}

            {stats && (
              <div className="cards">
                {cards.map(([label, value, href]) => (
                  <Link key={label} href={href} className="card">
                    <span className="value">{value}</span>
                    <span className="label">{label}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="columns">
              <section>
                <h2>Recent leads</h2>
                {recentLeads.length === 0 ? (
                  <p className="muted">No leads yet.</p>
                ) : (
                  <ul>
                    {recentLeads.map((lead) => (
                      <li key={lead.id}>
                        <Link href={`${base}/${lead.id}`}>
                          {lead.customer_name}
                        </Link>
                        <span className="muted">
                          {[lead.city, lead.stage].filter(Boolean).join(' · ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2>Recent proposals</h2>
                {recentProposals.length === 0 ? (
                  <p className="muted">No proposals yet.</p>
                ) : (
                  <ul>
                    {recentProposals.map((proposal) => (
                      <li key={proposal.id}>
                        <Link
                          href={`${base}/${proposal.lead_id}/proposals/${proposal.id}`}
                        >
                          {proposal.proposal_number}
                        </Link>
                        <span className="muted">
                          {proposal.crm_leads?.customer_name || '—'} ·{' '}
                          {proposal.status} · {formatMoney(proposal.total_inr)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        .overview-page {
          min-height: 100vh;
          background: #1e293b;
          color: #f8fafc;
          font-family: Inter, -apple-system, sans-serif;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 14px 24px;
          border-bottom: 1px solid #334155;
        }
        .overview-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }
        main {
          max-width: 1100px;
          margin: auto;
          padding: 32px 20px 72px;
        }
        h1 { margin: 0 0 8px; }
        h2 { margin: 0 0 14px; font-size: 18px; }
        .eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-size: 12px;
        }
        .subtitle, .muted { color: #94a3b8; }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 20px 0;
        }
        .actions :global(a) {
          padding: 11px 16px;
          border-radius: 9px;
          font-weight: 700;
          font-size: 14px;
        }
        .actions :global(a.primary) {
          background: #facc15;
          color: #1e293b;
        }
        .actions :global(a.ghost) {
          border: 1px solid #64748b;
          background: #0f172a;
          color: #fff;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin: 24px 0;
        }
        .cards :global(a.card) {
          display: grid;
          gap: 6px;
          padding: 18px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
          color: #f8fafc;
        }
        .value { font-size: 26px; font-weight: 800; }
        .label { color: #94a3b8; font-size: 13px; }
        .columns {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        section, .notice, .error {
          margin: 20px 0;
          padding: 22px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        .error { color: #fca5a5; }
        ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 12px;
        }
        li {
          display: grid;
          gap: 3px;
          font-size: 14px;
        }
        li .muted { font-size: 12px; }
        @media (max-width: 760px) {
          .columns { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
