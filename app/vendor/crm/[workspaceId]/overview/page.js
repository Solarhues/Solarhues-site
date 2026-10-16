'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';

export default function WorkspaceOverviewPage() {
  const params = useParams();
  const { user, loading } = useAuth();

  const workspaceId = params?.workspaceId;

  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const [leads, setLeads] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [payments, setPayments] = useState([]);

  const [fetching, setFetching] = useState(false);
  const [loadedWorkspaceId, setLoadedWorkspaceId] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setMembership(null);
    setLeads([]);
    setProposals([]);
    setFollowUps([]);
    setPayments([]);
    setError('');
    setLoadedWorkspaceId(null);

    if (loading || !user?.id || !workspaceId) {
      setFetching(false);

      return () => {
        active = false;
      };
    }

    const userId = user.id;
    const currentWorkspaceId = workspaceId;

    async function loadOverview() {
      setFetching(true);

      try {
        const { data: membershipData, error: membershipError } =
          await supabase
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
            .eq('workspace_id', currentWorkspaceId)
            .eq('is_active', true)
            .maybeSingle();

        if (membershipError) throw membershipError;

        const record = membershipData
          ? {
              ...membershipData,
              workspace: Array.isArray(membershipData.workspace)
                ? membershipData.workspace[0]
                : membershipData.workspace,
            }
          : null;

        const currentWorkspace = record?.workspace;
        const now = Date.now();

        const accessValid =
          currentWorkspace &&
          currentWorkspace.status === 'active' &&
          (
            !currentWorkspace.access_expires_at ||
            new Date(currentWorkspace.access_expires_at).getTime() > now
          );

        if (!accessValid) {
          throw new Error(
            'You do not have active access to this workspace.'
          );
        }

        if (active) {
          setWorkspace(currentWorkspace);
          setMembership(record);
        }

       const [
  leadsResult,
  proposalsResult,
  followUpsResult,
  paymentsResult,
] = await Promise.all([
  supabase
    .from('crm_leads')
    .select(`
      id,
      created_at,
      customer_name,
      customer_phone:phone,
      site_city:city,
      sales_stage:stage,
      workspace_id
    `)
    .eq('workspace_id', currentWorkspaceId)
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
      total_amount:total_inr,
      workspace_id
    `)
    .eq('workspace_id', currentWorkspaceId)
    .order('created_at', { ascending: false })
    .limit(5),

  supabase
    .from('crm_leads')
    .select(`
      id,
      customer_name,
      due_at:next_follow_up_at,
      notes,
      workspace_id
    `)
    .eq('workspace_id', currentWorkspaceId)
    .not('next_follow_up_at', 'is', null)
    .order('next_follow_up_at', { ascending: true })
    .limit(5),

  supabase
    .from('crm_payment_requests')
    .select(`
      id,
      created_at,
      lead_id,
      title:purpose,
      amount:amount_inr,
      due_date,
      status,
      workspace_id
    `)
    .eq('workspace_id', currentWorkspaceId)
    .order('created_at', { ascending: false })
    .limit(5),
]);

const queryResults = [
  ['Leads', leadsResult],
  ['Proposals', proposalsResult],
  ['Follow-ups', followUpsResult],
  ['Payment requests', paymentsResult],
];

for (const [label, result] of queryResults) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
}

if (!active) return;

// Load names for the leads referenced by proposals and payments.
// This avoids assuming a particular foreign-key relationship name.
const relatedLeadIds = [
  ...new Set(
    [
      ...(proposalsResult.data || []).map((item) => item.lead_id),
      ...(paymentsResult.data || []).map((item) => item.lead_id),
    ].filter(Boolean)
  ),
];

let relatedLeads = [];

if (relatedLeadIds.length > 0) {
  const { data: leadNames, error: leadNamesError } = await supabase
    .from('crm_leads')
    .select('id, customer_name')
    .eq('workspace_id', currentWorkspaceId)
    .in('id', relatedLeadIds);

  if (leadNamesError) {
    throw new Error(`Customer names: ${leadNamesError.message}`);
  }

  relatedLeads = leadNames || [];
}

if (!active) return;

const leadsById = new Map(
  relatedLeads.map((lead) => [lead.id, lead])
);

setLeads(leadsResult.data || []);

setProposals(
  (proposalsResult.data || []).map((item) => ({
    ...item,
    customer_name: leadsById.get(item.lead_id)?.customer_name || '',
  }))
);

setFollowUps(
  (followUpsResult.data || []).map((lead) => ({
    id: lead.id,
    due_at: lead.due_at,
    status: 'Scheduled',
    notes: lead.notes,
    lead: {
      id: lead.id,
      customer_name: lead.customer_name,
    },
  }))
);

setPayments(
  (paymentsResult.data || []).map((item) => ({
    ...item,
    lead: item.lead_id
      ? {
          id: item.lead_id,
          customer_name:
            leadsById.get(item.lead_id)?.customer_name || '',
        }
      : null,
  }))
);
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Could not load the workspace overview.'
          );
        }
      } finally {
        if (active) {
          setFetching(false);
          setLoadedWorkspaceId(currentWorkspaceId);
        }
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, [user?.id, loading, workspaceId, retry]);

  const waiting =
    loading ||
    Boolean(
      user && (fetching || loadedWorkspaceId !== workspaceId)
    );

  const leadCount = leads.length;
  const proposalCount = proposals.length;

  const pendingFollowUps = followUps.filter(
    (item) => item.status !== 'completed'
  ).length;

  const pendingPayments = payments.filter(
    (item) => item.status !== 'paid' && item.status !== 'cancelled'
  ).length;

  const base = `/vendor/crm/${workspaceId}`;

  const formatDate = (value) => {
    if (!value) return '—';

    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatMoney = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overview-page">
      <div className="overview-heading">
        <div>
          <p className="overview-eyebrow">CRM overview</p>
          <h1>{workspace?.company_name || 'Workspace'}</h1>
          <p className="overview-subtitle">
            Recent leads, proposals, follow-ups and payment requests.
          </p>
        </div>

        <Link href={`${base}/new`} className="primary-action">
          + Add lead
        </Link>
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

      {!waiting && user && !error && workspace && (
        <>
          <section className="summary-grid">
            <Link href={base} className="summary-card">
              <span className="summary-number">{leadCount}</span>
              <span className="summary-label">Recent leads</span>
              <span className="summary-link">View leads →</span>
            </Link>

            <Link
              href={`${base}/proposals`}
              className="summary-card"
            >
              <span className="summary-number">{proposalCount}</span>
              <span className="summary-label">Recent proposals</span>
              <span className="summary-link">View proposals →</span>
            </Link>

            <Link
              href={`${base}/follow-ups`}
              className="summary-card"
            >
              <span className="summary-number">{pendingFollowUps}</span>
              <span className="summary-label">Next follow-ups (up to 5)</span>
              <span className="summary-link">View follow-ups →</span>
            </Link>

            <Link
              href={`${base}/payments`}
              className="summary-card"
            >
              <span className="summary-number">{pendingPayments}</span>
              <span className="summary-label">
  Open payments among latest 5
</span>
              <span className="summary-link">View payments →</span>
            </Link>
          </section>

          <section className="overview-section">
            <div className="section-heading">
              <h2>Latest leads</h2>
              <Link href={base}>View all →</Link>
            </div>

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
                    <div>
                      <strong>
                        {lead.customer_name || 'Unnamed customer'}
                      </strong>
                      <span>
                        {lead.site_city || 'Location not set'} ·{' '}
                        {lead.sales_stage || 'New'}
                      </span>
                    </div>

                    <span className="record-date">
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

            {proposals.length === 0 ? (
              <div className="empty-state">
                <p>No proposals have been created yet.</p>
                <Link href={`${base}/proposals`}>
                  Open proposals →
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
                    <div>
                      <strong>
                        {proposal.proposal_number || 'Untitled proposal'}
                      </strong>
                      <span>
                        {proposal.customer_name || 'No customer'} ·{' '}
                        {proposal.status || 'Draft'}
                      </span>
                    </div>

                    <span className="record-date">
                      {formatMoney(proposal.total_amount)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <div className="two-column">
            <section className="overview-section">
              <div className="section-heading">
                <h2>Follow-ups</h2>
                <Link href={`${base}/follow-ups`}>View all →</Link>
              </div>

              {followUps.length === 0 ? (
                <div className="empty-state">
                  <p>No follow-ups scheduled.</p>
                </div>
              ) : (
                <div className="record-list">
                  {followUps.map((item) => (
                    <Link
                      href={`${base}/${item.lead?.id || ''}`}
                      className="record-row"
                      key={item.id}
                    >
                      <div>
                        <strong>
                          {item.lead?.customer_name || 'Customer lead'}
                        </strong>
                        <span>
                          {item.notes || 'Follow-up'} ·{' '}
                          {item.status || 'Pending'}
                        </span>
                      </div>

                      <span className="record-date">
                        {formatDate(item.due_at)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="overview-section">
              <div className="section-heading">
                <h2>Payment requests</h2>
                <Link href={`${base}/payments`}>View all →</Link>
              </div>

              {payments.length === 0 ? (
                <div className="empty-state">
                  <p>No payment requests recorded.</p>
                </div>
              ) : (
                <div className="record-list">
                  {payments.map((item) => (
                    <Link
                      href={`${base}/${item.lead?.id || ''}`}
                      className="record-row"
                      key={item.id}
                    >
                      <div>
                        <strong>
                          {item.title || 'Payment request'}
                        </strong>
                        <span>
                          {item.lead?.customer_name || 'Customer lead'} ·{' '}
                          {item.status || 'Pending'}
                        </span>
                      </div>

                      <span className="record-date">
                        {formatMoney(item.amount)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
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
        }

        h2 {
          margin: 0;
          font-size: 20px;
        }

        .overview-subtitle {
          color: #cbd5e1;
          margin: 8px 0 0;
        }

        .overview-page :global(a) {
          color: #facc15;
          text-decoration: none;
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
        }

        button {
          margin-top: 12px;
          padding: 10px 16px;
          border: 0;
          border-radius: 8px;
          background: #facc15;
          color: #1e293b;
          font-weight: 700;
          cursor: pointer;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
        }

        .overview-page :global(a.summary-card) {
          display: block;
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

        .summary-link {
          display: block;
          margin-top: 12px;
          color: #facc15;
          font-size: 13px;
          font-weight: 700;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .record-list {
          display: grid;
          gap: 10px;
        }

        .overview-page :global(a.record-row) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.45);
          color: #f8fafc;
        }

        .overview-page :global(a.record-row:hover) {
          border-color: #facc15;
        }

        .record-row strong {
          display: block;
        }

        .record-row span {
          color: #94a3b8;
          font-size: 13px;
        }

        .record-date {
          white-space: nowrap;
          color: #facc15 !important;
          font-weight: 700;
        }

        .empty-state {
          padding: 18px;
          border: 1px dashed #475569;
          border-radius: 10px;
          color: #cbd5e1;
        }

        .two-column {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .meta-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .meta-badges span {
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(5, 150, 105, 0.15);
          color: #6ee7b7;
          font-size: 12px;
        }

        .meta-note {
          margin: 16px 0 0;
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
        }
      `}</style>
    </div>
  );
}
