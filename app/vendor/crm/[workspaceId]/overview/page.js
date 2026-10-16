'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';

function formatDate(value, includeTime = false) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: 'numeric',
          minute: '2-digit',
        }
      : {}),
  });
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return '—';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function readableLabel(value) {
  if (!value) return '—';

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function WorkspaceOverviewPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId;

  const { user, loading } = useAuth();
  const userId = user?.id;

  const loadKey = `${userId || ''}:${workspaceId || ''}`;
  const base = `/vendor/crm/${workspaceId}`;

  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);

  const [leads, setLeads] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [payments, setPayments] = useState([]);

  const [totals, setTotals] = useState({
    leads: 0,
    proposals: 0,
    followUps: 0,
    overdueFollowUps: 0,
    openPayments: 0,
  });

  const [fetching, setFetching] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [snapshotAt, setSnapshotAt] = useState(null);

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setMembership(null);
    setLeads([]);
    setProposals([]);
    setFollowUps([]);
    setPayments([]);
    setTotals({
      leads: 0,
      proposals: 0,
      followUps: 0,
      overdueFollowUps: 0,
      openPayments: 0,
    });
    setError('');
    setLoadedFor('');
    setSnapshotAt(null);
    setFetching(false);

    if (loading || !userId || !workspaceId) {
      return () => {
        active = false;
      };
    }

    async function loadOverview() {
      setFetching(true);

      try {
        const { data: membershipData, error: membershipError } =
          await supabase
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
            .eq('workspace_id', workspaceId)
            .eq('is_active', true)
            .maybeSingle();

        if (membershipError) throw membershipError;

        if (!active) return;

        const record = membershipData
          ? {
              ...membershipData,
              workspace: Array.isArray(membershipData.workspace)
                ? membershipData.workspace[0]
                : membershipData.workspace,
            }
          : null;

        const currentWorkspace = record?.workspace;
        const now = new Date();
        const nowIso = now.toISOString();

        const accessValid =
          currentWorkspace &&
          currentWorkspace.status === 'active' &&
          (
            !currentWorkspace.access_expires_at ||
            new Date(currentWorkspace.access_expires_at).getTime() >
              now.getTime()
          );

        if (!accessValid) {
          throw new Error(
            'You do not have active access to this workspace.'
          );
        }

        const [
          leadsResult,
          proposalsResult,
          followUpsResult,
          paymentsResult,
          leadCountResult,
          proposalCountResult,
          followUpCountResult,
          overdueCountResult,
          openPaymentCountResult,
        ] = await Promise.all([
          supabase
            .from('crm_leads')
            .select(`
              id,
              created_at,
              customer_name,
              city,
              stage
            `)
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(5),

          supabase
            .from('crm_proposals')
            .select(`
              id,
              created_at,
              lead_id,
              proposal_number,
              status,
              total_inr
            `)
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(5),

          supabase
            .from('crm_leads')
            .select(`
              id,
              customer_name,
              next_follow_up_at,
              notes,
              stage
            `)
            .eq('workspace_id', workspaceId)
            .not('next_follow_up_at', 'is', null)
            .order('next_follow_up_at', { ascending: true })
            .limit(5),

          supabase
            .from('crm_payment_requests')
            .select(`
              id,
              created_at,
              lead_id,
              request_number,
              purpose,
              amount_inr,
              due_date,
              status
            `)
            .eq('workspace_id', workspaceId)
            .or('status.is.null,status.not.in.(paid,cancelled)')
            .order('created_at', { ascending: false })
            .limit(5),

          supabase
            .from('crm_leads')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId),

          supabase
            .from('crm_proposals')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId),

          supabase
            .from('crm_leads')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)
            .not('next_follow_up_at', 'is', null),

          supabase
            .from('crm_leads')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)
            .lt('next_follow_up_at', nowIso),

          supabase
            .from('crm_payment_requests')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)
            .or('status.is.null,status.not.in.(paid,cancelled)'),
        ]);

        const queryResults = [
          ['Latest leads', leadsResult],
          ['Latest proposals', proposalsResult],
          ['Follow-ups', followUpsResult],
          ['Open payment requests', paymentsResult],
          ['Lead total', leadCountResult],
          ['Proposal total', proposalCountResult],
          ['Follow-up total', followUpCountResult],
          ['Overdue follow-up total', overdueCountResult],
          ['Open payment total', openPaymentCountResult],
        ];

        for (const [label, result] of queryResults) {
          if (result.error) {
            throw new Error(`${label}: ${result.error.message}`);
          }
        }

        if (!active) return;

        const relatedLeadIds = [
          ...new Set(
            [
              ...(proposalsResult.data || []).map(
                (item) => item.lead_id
              ),
              ...(paymentsResult.data || []).map(
                (item) => item.lead_id
              ),
            ].filter(Boolean)
          ),
        ];

        let relatedLeads = [];

        if (relatedLeadIds.length > 0) {
          const { data: leadNames, error: leadNamesError } =
            await supabase
              .from('crm_leads')
              .select('id, customer_name')
              .eq('workspace_id', workspaceId)
              .in('id', relatedLeadIds);

          if (leadNamesError) {
            throw new Error(
              `Customer names: ${leadNamesError.message}`
            );
          }

          relatedLeads = leadNames || [];
        }

        if (!active) return;

        const leadsById = new Map(
          relatedLeads.map((lead) => [lead.id, lead])
        );

        setWorkspace(currentWorkspace);
        setMembership(record);
        setLeads(leadsResult.data || []);

        setProposals(
          (proposalsResult.data || []).map((item) => ({
            ...item,
            customer_name:
              leadsById.get(item.lead_id)?.customer_name || '',
          }))
        );

        setFollowUps(followUpsResult.data || []);

        setPayments(
          (paymentsResult.data || []).map((item) => ({
            ...item,
            customer_name:
              leadsById.get(item.lead_id)?.customer_name || '',
          }))
        );

        setTotals({
          leads: leadCountResult.count ?? 0,
          proposals: proposalCountResult.count ?? 0,
          followUps: followUpCountResult.count ?? 0,
          overdueFollowUps: overdueCountResult.count ?? 0,
          openPayments: openPaymentCountResult.count ?? 0,
        });

        setSnapshotAt(nowIso);
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Could not load the workspace overview.'
          );
        }
      } finally {
        if (active) {
          setFetching(false);
          setLoadedFor(loadKey);
        }
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, [userId, loading, workspaceId, loadKey, retry]);

  const waiting =
    loading ||
    Boolean(
      user && workspaceId && (fetching || loadedFor !== loadKey)
    );

  const ready =
    !waiting &&
    user &&
    workspaceId &&
    loadedFor === loadKey &&
    !error &&
    workspace;

  const isOverdue = (value) =>
    Boolean(
      value &&
      snapshotAt &&
      new Date(value).getTime() < new Date(snapshotAt).getTime()
    );

  return (
    <div className="overview-page">
      <div className="overview-heading">
        <div>
          <p className="overview-eyebrow">CRM overview</p>
          <h1>{ready ? workspace.company_name : 'Workspace'}</h1>
          <p className="overview-subtitle">
            Workspace totals, recent activity and outstanding work.
          </p>
        </div>

        {ready && (
          <div className="heading-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Refresh
            </button>

            <Link href={`${base}/new`} className="primary-action">
              + Add lead
            </Link>
          </div>
        )}
      </div>

      {waiting && (
        <div className="overview-notice" role="status">
          Loading workspace overview…
        </div>
      )}

      {!loading && !user && (
        <div className="overview-notice">
          <h2>Sign in required</h2>
          <p>Use your installer account to view this workspace.</p>
          <Link href="/vendor-login">Go to installer login →</Link>
        </div>
      )}

      {!loading && user && !workspaceId && (
        <div className="overview-error" role="alert">
          <h2>Workspace ID unavailable</h2>
          <p>Open a workspace from the CRM entry page.</p>
          <Link href="/vendor/crm">Choose workspace →</Link>
        </div>
      )}

      {!waiting && user && error && (
        <div className="overview-error" role="alert">
          <h2>Could not load overview</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {ready && (
        <>
          <p className="snapshot-note">
            Snapshot: {formatDate(snapshotAt, true)}.
            Counts include records visible to your account.
          </p>

          <section
            className="summary-grid"
            aria-label="Workspace totals"
          >
            <Link href={base} className="summary-card">
              <span className="summary-number">{totals.leads}</span>
              <span className="summary-label">Total leads</span>
              <span className="summary-link">View leads →</span>
            </Link>

            <Link
              href={`${base}/proposals`}
              className="summary-card"
            >
              <span className="summary-number">
                {totals.proposals}
              </span>
              <span className="summary-label">Total proposals</span>
              <span className="summary-link">View proposals →</span>
            </Link>

            <Link
              href={`${base}/follow-ups`}
              className="summary-card"
            >
              <span className="summary-number">
                {totals.followUps}
              </span>
              <span className="summary-label">
                Scheduled follow-ups
              </span>
              <span
                className={
                  totals.overdueFollowUps > 0
                    ? 'summary-detail overdue-text'
                    : 'summary-detail'
                }
              >
                {totals.overdueFollowUps} overdue
              </span>
              <span className="summary-link">View follow-ups →</span>
            </Link>

            <Link
              href={`${base}/payments`}
              className="summary-card"
            >
              <span className="summary-number">
                {totals.openPayments}
              </span>
              <span className="summary-label">
                Open payment requests
              </span>
              <span className="summary-link">View payments →</span>
            </Link>
          </section>

          <nav className="quick-links" aria-label="CRM quick links">
            <Link href={base}>All leads →</Link>
            <Link href={`${base}/proposals`}>All proposals →</Link>
            <Link href={`${base}/follow-ups`}>Follow-ups →</Link>
            <Link href={`${base}/payments`}>Payment requests →</Link>
          </nav>

          <section className="overview-section">
            <div className="section-heading">
              <h2>Latest leads</h2>
              <Link href={base}>View all →</Link>
            </div>

            <p className="section-note">
              Up to five most recently created leads.
            </p>

            {leads.length === 0 ? (
              <div className="empty-state">
                <p>No leads have been added yet.</p>
                <Link href={`${base}/new`}>
                  Add your first lead →
                </Link>
              </div>
            ) : (
              <div className="record-list">
                {leads.map((lead) => (
                  <Link
                    href={`${base}/${lead.id}`}
                    className="record-row"
                    key={lead.id}
                  >
                    <div className="record-content">
                      <strong>
                        {lead.customer_name || 'Unnamed customer'}
                      </strong>
                      <p className="record-description">
                        {lead.city || 'Location not set'} ·{' '}
                        {readableLabel(lead.stage)}
                      </p>
                    </div>

                    <span className="record-value">
                      {formatDate(lead.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="overview-section">
            <div className="section-heading">
              <h2>Latest proposals</h2>
              <Link href={`${base}/proposals`}>View all →</Link>
            </div>

            <p className="section-note">
              Up to five most recently created proposals.
            </p>

            {proposals.length === 0 ? (
              <div className="empty-state">
                <p>No proposals have been created yet.</p>
                <Link href={base}>
                  Open a lead to create a proposal →
                </Link>
              </div>
            ) : (
              <div className="record-list">
                {proposals.map((proposal) => (
                  <Link
                    href={`${base}/proposals/${proposal.id}`}
                    className="record-row"
                    key={proposal.id}
                  >
                    <div className="record-content">
                      <strong>
                        {proposal.proposal_number ||
                          'Untitled proposal'}
                      </strong>
                      <p className="record-description">
                        {proposal.customer_name ||
                          'Customer unavailable'}{' '}
                        · {readableLabel(proposal.status)}
                      </p>
                    </div>

                    <span className="record-value">
                      {formatMoney(proposal.total_inr)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <div className="two-column">
            <section className="overview-section">
              <div className="section-heading">
                <h2>Follow-ups needing attention</h2>
                <Link href={`${base}/follow-ups`}>View all →</Link>
              </div>

              <p className="section-note">
                Earliest five scheduled dates, including overdue
                follow-ups. Clear or reschedule a lead’s date after
                completing the follow-up.
              </p>

              {followUps.length === 0 ? (
                <div className="empty-state">
                  <p>No follow-ups scheduled.</p>
                </div>
              ) : (
                <div className="record-list">
                  {followUps.map((item) => (
                    <Link
                      href={`${base}/${item.id}`}
                      className="record-row"
                      key={item.id}
                    >
                      <div className="record-content">
                        <strong>
                          {item.customer_name || 'Customer lead'}
                        </strong>

                        <p className="record-description">
                          {formatDate(item.next_follow_up_at, true)}
                        </p>

                        <p
                          className={
                            isOverdue(item.next_follow_up_at)
                              ? 'record-description overdue-text'
                              : 'record-description'
                          }
                        >
                          {isOverdue(item.next_follow_up_at)
                            ? 'Overdue'
                            : 'Scheduled'}{' '}
                          · {readableLabel(item.stage)}
                        </p>

                        {item.notes && (
                          <p className="record-description note-preview">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="overview-section">
              <div className="section-heading">
                <h2>Open payment requests</h2>
                <Link href={`${base}/payments`}>View all →</Link>
              </div>

              <p className="section-note">
                Latest five requests excluding paid and cancelled
                statuses. Records with no status are included.
              </p>

              {payments.length === 0 ? (
                <div className="empty-state">
                  <p>No open payment requests.</p>
                </div>
              ) : (
                <div className="record-list">
                  {payments.map((item) => (
                    <Link
                      href={
                        item.lead_id
                          ? `${base}/${item.lead_id}`
                          : `${base}/payments`
                      }
                      className="record-row"
                      key={item.id}
                    >
                      <div className="record-content">
                        <strong>
                          {item.request_number ||
                            item.purpose ||
                            'Payment request'}
                        </strong>

                        <p className="record-description">
                          {item.customer_name ||
                            'Customer unavailable'}{' '}
                          ·{' '}
                          {item.status
                            ? readableLabel(item.status)
                            : 'Status not set'}
                        </p>

                        {item.purpose && (
                          <p className="record-description">
                            {item.purpose}
                          </p>
                        )}

                        {item.due_date && (
                          <p className="record-description">
                            Due:{' '}
                            {formatDate(
                              `${item.due_date}T00:00:00`
                            )}
                          </p>
                        )}
                      </div>

                      <span className="record-value">
                        {formatMoney(item.amount_inr)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <p className="section-note payment-note">
                Payment records do not by themselves verify receipt
                of funds. This page does not collect or transfer money.
              </p>
            </section>
          </div>

          <section className="workspace-meta">
            <h2>Workspace access</h2>

            <div className="meta-badges">
              <span>Role: {membership?.member_role || '—'}</span>
              <span>Plan: {workspace.access_plan || '—'}</span>
              <span>Status: {workspace.status}</span>
            </div>

            <p className="meta-note">
              Workspace access does not by itself confirm installer
              approval or payment of a subscription.
            </p>

            <Link href="/vendor/crm?select=1">
              Switch workspace →
            </Link>
          </section>
        </>
      )}

      <style jsx>{`
        .overview-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 20px 72px;
          color: #f8fafc;
        }

        .overview-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 18px;
        }

        .overview-eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 12px;
          font-weight: 700;
        }

        h1 {
          margin: 0;
          font-size: 30px;
          overflow-wrap: anywhere;
        }

        h2 {
          margin: 0;
          font-size: 20px;
        }

        .overview-subtitle {
          color: #cbd5e1;
          margin: 8px 0 0;
          line-height: 1.6;
        }

        .overview-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }

        .heading-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .overview-page :global(a.primary-action) {
          display: inline-flex;
          align-items: center;
          padding: 12px 18px;
          border-radius: 10px;
          background: #facc15;
          color: #1e293b;
          font-weight: 700;
          white-space: nowrap;
        }

        button {
          padding: 11px 16px;
          border: 0;
          border-radius: 8px;
          background: #facc15;
          color: #1e293b;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        button.secondary-button {
          border: 1px solid #64748b;
          background: #0f172a;
          color: #f8fafc;
        }

        .overview-notice,
        .overview-error,
        .overview-section,
        .workspace-meta {
          margin-top: 24px;
          padding: 22px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          line-height: 1.6;
        }

        .overview-error {
          color: #fca5a5;
          border-color: rgba(239, 68, 68, 0.4);
          overflow-wrap: anywhere;
        }

        .snapshot-note,
        .section-note {
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.6;
        }

        .snapshot-note {
          margin-top: 20px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 20px;
        }

        .overview-page :global(a.summary-card) {
          display: block;
          min-width: 0;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          color: #f8fafc;
        }

        .overview-page :global(a.summary-card:hover) {
          border-color: #facc15;
        }

        .summary-number {
          display: block;
          font-size: 28px;
          font-weight: 800;
        }

        .summary-label {
          display: block;
          margin-top: 6px;
          color: #cbd5e1;
          font-size: 14px;
        }

        .summary-detail {
          display: block;
          margin-top: 6px;
          color: #94a3b8;
          font-size: 12px;
        }

        .summary-link {
          display: block;
          margin-top: 12px;
          color: #facc15;
          font-size: 13px;
          font-weight: 700;
        }

        .quick-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 20px;
          margin-top: 22px;
          font-size: 14px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }

        .record-list {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .overview-page :global(a.record-row) {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 14px;
          min-width: 0;
          padding: 14px 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.45);
          color: #f8fafc;
        }

        .overview-page :global(a.record-row:hover) {
          border-color: #facc15;
        }

        .record-content {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .record-content strong {
          display: block;
        }

        .record-description {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
        }

        .record-value {
          color: #facc15;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .overdue-text {
          color: #fca5a5;
        }

        .note-preview {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .empty-state {
          margin-top: 16px;
          padding: 18px;
          border: 1px dashed #475569;
          border-radius: 10px;
          color: #cbd5e1;
        }

        .empty-state p {
          margin-top: 0;
        }

        .two-column {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .two-column > section {
          min-width: 0;
        }

        .payment-note {
          margin-top: 18px;
        }

        .meta-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        .meta-badges span {
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(5, 150, 105, 0.15);
          color: #6ee7b7;
          font-size: 12px;
        }

        .meta-note {
          margin: 16px 0;
          color: #94a3b8;
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .two-column {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          .overview-section,
          .workspace-meta {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
}
