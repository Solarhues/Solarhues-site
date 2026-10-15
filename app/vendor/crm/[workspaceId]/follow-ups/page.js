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

function stageLabel(value) {
  return STAGES.find(([key]) => key === value)?.[1] || value;
}

function formatDue(value) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getDueStatus(value) {
  if (!value) return '';

  const due = new Date(value);
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  if (due < startOfToday) return 'overdue';
  if (due >= startOfToday && due <= endOfToday) return 'today';
  return 'upcoming';
}

export default function FollowUpsPage() {
  const { workspaceId } = useParams();
  const { user, loading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [canRead, setCanRead] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');

  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);
  const [followUpsError, setFollowUpsError] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const loadKey = `${user?.id || ''}:${workspaceId || ''}`;

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setCanRead(false);
    setLoadedFor('');
    setAccessError('');
    setFollowUps([]);

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

    setFollowUps([]);
    setFollowUpsError('');

    if (!user?.id || !workspaceId || !canRead) {
      return () => {
        active = false;
      };
    }

    async function loadFollowUps() {
      setFollowUpsLoading(true);

      try {
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
            next_follow_up_at
          `
          )
          .eq('workspace_id', workspaceId)
          .not('next_follow_up_at', 'is', null)
          .order('next_follow_up_at', { ascending: true })
          .limit(100);

        if (stageFilter !== 'all') {
          query = query.eq('stage', stageFilter);
        }

        const { data, error: followUpsQueryError } = await query;

        if (followUpsQueryError) throw followUpsQueryError;
        if (!active) return;

        setFollowUps(data || []);
      } catch (err) {
        if (active) {
          setFollowUpsError(
            err.message || 'Could not load follow-ups.'
          );
        }
      } finally {
        if (active) setFollowUpsLoading(false);
      }
    }

    loadFollowUps();

    return () => {
      active = false;
    };
  }, [user?.id, workspaceId, canRead, stageFilter]);

  const overdue = followUps.filter(
    (lead) => getDueStatus(lead.next_follow_up_at) === 'overdue'
  );

  const today = followUps.filter(
    (lead) => getDueStatus(lead.next_follow_up_at) === 'today'
  );

  const upcoming = followUps.filter(
    (lead) => getDueStatus(lead.next_follow_up_at) === 'upcoming'
  );

  const waiting =
    loading || Boolean(user && loadedFor !== loadKey);

  function renderGroup(title, leads, tone) {
    if (leads.length === 0) return null;

    return (
      <section className="group">
        <h2 className={tone}>
          {title} ({leads.length})
        </h2>

        <div className="cards">
          {leads.map((lead) => (
            <article key={lead.id} className="card">
              <div>
                <Link
                  href={`/vendor/crm/${workspaceId}/${lead.id}`}
                  className="customer-link"
                >
                  {lead.customer_name}
                </Link>

                <p className="meta">
                  {lead.phone} · {lead.email}
                </p>

                <p className="meta">
                  {[lead.city, lead.state]
                    .filter(Boolean)
                    .join(', ') || 'Location not added'}
                </p>
              </div>

              <div className="right">
                <span className={`stage stage-${lead.stage}`}>
                  {stageLabel(lead.stage)}
                </span>

                <p className="due">
                  Due: {formatDue(lead.next_follow_up_at)}
                </p>

                <Link
                  href={`/vendor/crm/${workspaceId}/${lead.id}`}
                  className="open-link"
                >
                  Open lead →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="followups-page">
      <header>
        <Logo height={34} />
        <Link href={`/vendor/crm/${workspaceId}`}>
          ← Leads list
        </Link>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Follow-ups</h1>

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
            can view follow-ups.
          </div>
        )}

        {!waiting && user && workspace && canRead && (
          <>
            <p className="subtitle">{workspace.company_name}</p>

            <div className="toolbar">
              <select
                aria-label="Filter follow-ups by stage"
                value={stageFilter}
                onChange={(event) =>
                  setStageFilter(event.target.value)
                }
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

            {followUpsError && (
              <div className="error" role="alert">
                {followUpsError}
              </div>
            )}

            {followUpsLoading ? (
              <p role="status">Loading follow-ups…</p>
            ) : followUps.length === 0 ? (
              <div className="empty">
                <h2>No scheduled follow-ups</h2>
                <p>
                  Add a next follow-up time to a lead, and it will
                  appear here.
                </p>
              </div>
            ) : (
              <>
                {renderGroup(
                  'Overdue',
                  overdue,
                  'overdue-title'
                )}
                {renderGroup(
                  'Today',
                  today,
                  'today-title'
                )}
                {renderGroup(
                  'Upcoming',
                  upcoming,
                  'upcoming-title'
                )}
              </>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        .followups-page {
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
        .followups-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }
        main {
          max-width: 1000px;
          margin: auto;
          padding: 32px 20px 72px;
        }
        h1 { margin: 0 0 8px; }
        h2 { margin: 0 0 16px; font-size: 19px; }
        .eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-size: 12px;
        }
        .subtitle { color: #94a3b8; }
        .toolbar {
          display: grid;
          grid-template-columns: 220px auto;
          gap: 12px;
          margin: 24px 0;
        }
        select {
          box-sizing: border-box;
          width: 100%;
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
          justify-content: center;
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
        .group { margin: 28px 0; }
        .overdue-title { color: #fca5a5; }
        .today-title { color: #facc15; }
        .upcoming-title { color: #6ee7b7; }
        .cards {
          display: grid;
          gap: 12px;
        }
        .card {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 18px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        .customer-link {
          color: #facc15 !important;
          font-weight: 700;
        }
        .meta {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 13px;
          overflow-wrap: anywhere;
        }
        .right {
          text-align: right;
          flex-shrink: 0;
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
        .due {
          margin: 9px 0;
          color: #cbd5e1;
          font-size: 13px;
        }
        .open-link {
          font-size: 13px;
          font-weight: 600;
        }
        .empty {
          text-align: center;
        }
        @media (max-width: 700px) {
          .toolbar {
            grid-template-columns: 1fr;
          }
          .card {
            flex-direction: column;
          }
          .right {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
