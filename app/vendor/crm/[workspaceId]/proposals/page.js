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
