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
3. Workspace-wide Proposals list
Create app/vendor/crm/[workspaceId]/proposals/page.js. It lists every proposal in the workspace, with a status filter and pagination.

jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';
import Logo from '../../../../../components/Logo';

const STATUSES = [
  ['draft', 'Draft'],
  ['sent', 'Sent'],
  ['accepted', 'Accepted'],
  ['rejected', 'Rejected'],
];

const PAGE_SIZE = 20;

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProposalsListPage() {
  const { workspaceId } = useParams();
  const { user, loading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [canRead, setCanRead] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');

  const [proposals, setProposals] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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

    setProposals([]);
    setListError('');
    setTotalCount(0);

    if (!user?.id || !workspaceId || !canRead) {
      return () => {
        active = false;
      };
    }

    async function loadProposals() {
      setListLoading(true);

      try {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from('crm_proposals')
          .select(
            `
            id,
            lead_id,
            proposal_number,
            status,
            system_capacity_kwp,
            total_inr,
            valid_until,
            created_at,
            crm_leads (
              customer_name,
              phone,
              city
            )
          `,
            { count: 'exact' }
          )
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, count, error: queryError } = await query;

        if (queryError) throw queryError;
        if (!active) return;

        setProposals(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        if (active) {
          setListError(err.message || 'Could not load proposals.');
        }
      } finally {
        if (active) setListLoading(false);
      }
    }

    loadProposals();

    return () => {
      active = false;
    };
  }, [user?.id, workspaceId, canRead, statusFilter, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const waiting = loading || Boolean(user && loadedFor !== loadKey);

  return (
    <div className="proposals-page">
      <header>
        <Logo height={34} />
        <Link href={`/vendor/crm/${workspaceId}/overview`}>
          ← Overview
        </Link>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Proposals</h1>

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
            proposals.
          </div>
        )}

        {!waiting && user && workspace && canRead && (
          <>
            <p className="subtitle">{workspace.company_name}</p>

            <div className="toolbar">
              <select
                aria-label="Filter proposals by status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(0);
                }}
              >
                <option value="all">All statuses</option>
                {STATUSES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <p className="muted">
                {totalCount} proposal{totalCount === 1 ? '' : 's'}
              </p>
            </div>

            {listError && (
              <div className="error" role="alert">
                {listError}
              </div>
            )}

            {listLoading ? (
              <p role="status">Loading proposals…</p>
            ) : proposals.length === 0 ? (
              <div className="empty">
                <h2>No proposals found</h2>
                <p>
                  Open a lead and choose Create proposal, or change the
                  status filter.
                </p>
              </div>
            ) : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Proposal</th>
                        <th>Customer</th>
                        <th>Capacity</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>

                    <tbody>
                      {proposals.map((proposal) => (
                        <tr key={proposal.id}>
                          <td>
                            <Link
                              href={`/vendor/crm/${workspaceId}/${proposal.lead_id}/proposals/${proposal.id}`}
                              className="strong-link"
                            >
                              {proposal.proposal_number}
                            </Link>
                            <span className="meta">
                              Valid until {formatDate(proposal.valid_until)}
                            </span>
                          </td>

                          <td>
                            <Link
                              href={`/vendor/crm/${workspaceId}/${proposal.lead_id}`}
                            >
                              {proposal.crm_leads?.customer_name || '—'}
                            </Link>
                            <span className="meta">
                              {[
                                proposal.crm_leads?.phone,
                                proposal.crm_leads?.city,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </td>

                          <td>
                            {proposal.system_capacity_kwp
                              ? `${proposal.system_capacity_kwp} kWp`
                              : '—'}
                          </td>

                          <td>{formatMoney(proposal.total_inr)}</td>

                          <td>
                            <span className={`status status-${proposal.status}`}>
                              {STATUSES.find(
                                ([value]) => value === proposal.status
                              )?.[1] || proposal.status}
                            </span>
                          </td>

                          <td>{formatDate(proposal.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <button
                    type="button"
                    disabled={page === 0 || listLoading}
                    onClick={() => setPage(page - 1)}
                  >
                    ← Previous
                  </button>

                  <span>
                    Page {page + 1} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page + 1 >= totalPages || listLoading}
                    onClick={() => setPage(page + 1)}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        .proposals-page {
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
        .proposals-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }
        main {
          max-width: 1100px;
          margin: auto;
          padding: 32px 20px 72px;
        }
        h1 { margin: 0 0 8px; }
        .eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-size: 12px;
        }
        .subtitle, .muted { color: #94a3b8; }
        .toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }
        select {
          box-sizing: border-box;
          width: 220px;
          padding: 12px;
          border: 1px solid #64748b;
          border-radius: 9px;
          background: #0f172a;
          color: #fff;
          font: inherit;
        }
        .notice, .error, .empty {
          margin: 20px 0;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        .error { color: #fca5a5; }
        .empty { text-align: center; }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 820px;
        }
        th, td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid #334155;
          vertical-align: top;
        }
        th {
          color: #94a3b8;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        tr:last-child td { border-bottom: 0; }
        .strong-link { font-weight: 700; }
        .meta {
          display: block;
          margin-top: 3px;
          color: #94a3b8;
          font-size: 12px;
          overflow-wrap: anywhere;
        }
        .status {
          display: inline-block;
          padding: 4px 9px;
          border-radius: 999px;
          background: #334155;
          font-size: 12px;
        }
        .status-sent { background: #0e7490; }
        .status-accepted { background: #059669; }
        .status-rejected { background: #7f1d1d; }
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
        }
        .pagination button {
          border: 1px solid #64748b;
          border-radius: 9px;
          padding: 10px 16px;
          background: #0f172a;
          color: #fff;
          cursor: pointer;
        }
        .pagination button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
