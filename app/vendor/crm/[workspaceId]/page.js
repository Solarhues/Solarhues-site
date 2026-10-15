'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';
import Logo from '../../../../../components/Logo';

const STAGES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['site_visit', 'Site visit'],
  ['proposal_sent', 'Proposal sent'],
  ['won', 'Won'],
  ['lost', 'Lost'],
];

const PAGE_SIZE = 20;

function formatDate(value) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function stageLabel(value) {
  return STAGES.find(([key]) => key === value)?.[1] || value;
}

export default function WorkspaceLeadsPage() {
  const { workspaceId } = useParams();
  const { user, loading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [canRead, setCanRead] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');

  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState('');

  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadKey = `${user?.id || ''}:${workspaceId || ''}`;

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setCanRead(false);
    setLoadedFor('');
    setAccessError('');
    setLeads([]);
    setTotalCount(0);
    setPage(0);

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
          (
            !company.access_expires_at ||
            new Date(company.access_expires_at).getTime() > Date.now()
          );

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
          setAccessError(
            err.message || 'Could not check workspace access.'
          );
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

    setLeads([]);
    setLeadsError('');
    setTotalCount(0);

    if (!user?.id || !workspaceId || !canRead) {
      return () => {
        active = false;
      };
    }

    async function loadLeads() {
      setLeadsLoading(true);

      try {
        const trimmedSearch = search.trim();
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from('crm_leads')
          .select(
            `
            id,
            customer_name,
            phone,
            email,
            city,
            state,
            building_type,
            stage,
            lead_source,
            created_at,
            next_follow_up_at
          `,
            { count: 'exact' }
          )
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (stage !== 'all') {
          query = query.eq('stage', stage);
        }

        if (trimmedSearch) {
          const safeSearch = trimmedSearch.replace(/[%,()]/g, '');

          query = query.or(
            [
              `customer_name.ilike.%${safeSearch}%`,
              `phone.ilike.%${safeSearch}%`,
              `email.ilike.%${safeSearch}%`,
            ].join(',')
          );
        }

        const { data, count, error: leadsQueryError } =
          await query;

        if (leadsQueryError) throw leadsQueryError;
        if (!active) return;

        setLeads(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        if (active) {
          setLeadsError(
            err.message || 'Could not load leads.'
          );
        }
      } finally {
        if (active) setLeadsLoading(false);
      }
    }

    loadLeads();

    return () => {
      active = false;
    };
  }, [
    user?.id,
    workspaceId,
    canRead,
    search,
    stage,
    page,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  );

  const waiting =
    loading || Boolean(user && loadedFor !== loadKey);

  return (
    <div className="workspace-page">
      <header>
        <Logo height={34} />
        <Link href="/vendor/crm">← CRM dashboard</Link>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Leads</h1>

        {waiting && (
          <p role="status">Checking workspace access…</p>
        )}

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
            Only workspace owners, sales staff and SolarHues admins
            can view leads.
          </div>
        )}

        {!waiting && user && workspace && canRead && (
          <>
            <p className="subtitle">{workspace.company_name}</p>

            <div className="toolbar">
              <input
                type="search"
                aria-label="Search leads"
                placeholder="Search name, phone or email"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
              />

              <select
                aria-label="Filter by stage"
                value={stage}
                onChange={(event) => {
                  setStage(event.target.value);
                  setPage(0);
                }}
              >
                <option value="all">All stages</option>
                {STAGES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <Link
                href={`/vendor/crm/${workspaceId}/new`}
                className="add-link"
              >
                + Add lead
              </Link>
            </div>

            {leadsError && (
              <div className="error" role="alert">
                {leadsError}
              </div>
            )}

            {leadsLoading ? (
              <p role="status">Loading leads…</p>
            ) : leads.length === 0 ? (
              <div className="empty">
                <h2>No leads found</h2>
                <p>
                  Try changing the search or stage filter, or add
                  your first lead.
                </p>
              </div>
            ) : (
              <>
                <p className="count">
                  Showing {leads.length} of {totalCount} lead
                  {totalCount === 1 ? '' : 's'}
                </p>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Contact</th>
                        <th>Location</th>
                        <th>Stage</th>
                        <th>Created</th>
                      </tr>
                    </thead>

                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id}>
                          <td>
                            <span className="name">
                              {lead.customer_name}
                            </span>
                            <span className="meta">
                              {lead.building_type || '—'}
                            </span>
                          </td>

                          <td>
                            <span>{lead.phone}</span>
                            <span className="meta">
                              {lead.email}
                            </span>
                          </td>

                          <td>
                            {[lead.city, lead.state]
                              .filter(Boolean)
                              .join(', ') || '—'}
                          </td>

                          <td>
                            <span
                              className={`stage stage-${lead.stage}`}
                            >
                              {stageLabel(lead.stage)}
                            </span>
                          </td>

                          <td>{formatDate(lead.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <button
                    type="button"
                    disabled={page === 0 || leadsLoading}
                    onClick={() => setPage(page - 1)}
                  >
                    ← Previous
                  </button>

                  <span>
                    Page {page + 1} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      page + 1 >= totalPages || leadsLoading
                    }
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
        .workspace-page {
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
        .workspace-page :global(a) {
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
        .subtitle, .count { color: #94a3b8; }
        .toolbar {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) 190px auto;
          gap: 12px;
          margin: 24px 0;
        }
        input, select {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid #64748b;
          border-radius: 9px;
          background: #0f172a;
          color: #fff;
          font: inherit;
        }
        .add-link {
          display: inline-flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 9px;
          background: #facc15;
          color: #1e293b !important;
          font-weight: 700;
          white-space: nowrap;
        }
        .notice, .error, .empty {
          margin: 20px 0;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        .error { color: #fca5a5; }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
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
        .name {
          display: block;
          font-weight: 600;
        }
        .meta {
          display: block;
          color: #94a3b8;
          font-size: 12px;
          margin-top: 3px;
          overflow-wrap: anywhere;
        }
        .stage {
          display: inline-block;
          padding: 4px 9px;
          border-radius: 999px;
          background: #334155;
          font-size: 12px;
        }
        .stage-won { background: #059669; }
        .stage-lost { background: #7f1d1d; }
        .stage-proposal_sent { background: #7c3aed; }
        .stage-site_visit { background: #0e7490; }
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
        @media (max-width: 760px) {
          .toolbar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
