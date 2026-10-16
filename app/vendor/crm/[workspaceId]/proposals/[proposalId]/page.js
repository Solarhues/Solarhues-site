'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../lib/supabase';
import { useAuth } from '../../../../../providers';

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return '—';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value, dateOnly = false) {
  if (!value) return '—';

  const date = new Date(dateOnly ? `${value}T00:00:00` : value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function label(value) {
  if (!value) return '—';

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function measurement(value, unit) {
  return value === null || value === undefined
    ? '—'
    : `${value} ${unit}`;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const proposalId = params?.proposalId;

  const { user, loading } = useAuth();
  const userId = user?.id;

  const base = `/vendor/crm/${workspaceId}`;
  const loadKey =
    `${userId || ''}:${workspaceId || ''}:${proposalId || ''}`;

  const [workspace, setWorkspace] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [lead, setLead] = useState(null);
  const [items, setItems] = useState([]);

  const [loadedFor, setLoadedFor] = useState('');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setProposal(null);
    setLead(null);
    setItems([]);
    setLoadedFor('');
    setFetching(false);
    setError('');

    if (loading || !userId || !workspaceId || !proposalId) {
      return () => {
        active = false;
      };
    }

    async function loadProposal() {
      setFetching(true);

      try {
        const [
          workspaceResult,
          memberResult,
          profileResult,
        ] = await Promise.all([
          supabase
            .from('crm_workspaces')
            .select('id, company_name, status, access_expires_at')
            .eq('id', workspaceId)
            .maybeSingle(),

          supabase
            .from('crm_workspace_members')
            .select('member_role, is_active')
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .maybeSingle(),

          supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle(),
        ]);

        const accessQueryError =
          workspaceResult.error ||
          memberResult.error ||
          profileResult.error;

        if (accessQueryError) throw accessQueryError;

        const company = workspaceResult.data;
        const member = memberResult.data;
        const isAdmin = profileResult.data?.role === 'admin';

        const available =
          company &&
          company.status === 'active' &&
          (
            !company.access_expires_at ||
            new Date(company.access_expires_at).getTime() >
              Date.now()
          );

        if (!available) {
          throw new Error(
            'Workspace unavailable, suspended, expired, or inaccessible.'
          );
        }

        const memberAllowed =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        if (!isAdmin && !memberAllowed) {
          throw new Error(
            'Only workspace owners, sales staff and SolarHues ' +
            'admins can view proposals on this page.'
          );
        }

        if (!active) return;

        const {
          data: proposalData,
          error: proposalError,
        } = await supabase
          .from('crm_proposals')
          .select(`
            id,
            workspace_id,
            lead_id,
            proposal_number,
            status,
            system_capacity_kwp,
            estimated_monthly_generation_kwh,
            estimated_monthly_savings_inr,
            subtotal_inr,
            discount_inr,
            subsidy_inr,
            total_inr,
            notes,
            valid_until,
            created_at,
            updated_at
          `)
          .eq('id', proposalId)
          .eq('workspace_id', workspaceId)
          .maybeSingle();

        if (proposalError) {
          throw new Error(`Proposal: ${proposalError.message}`);
        }

        if (!proposalData) {
          throw new Error(
            'Proposal not found in this workspace, or your account ' +
            'does not have permission to read it.'
          );
        }

        if (!active) return;

        const [leadResult, itemsResult] = await Promise.all([
          supabase
            .from('crm_leads')
            .select(`
              id,
              customer_name,
              phone,
              email,
              locality,
              city,
              state,
              pincode
            `)
            .eq('id', proposalData.lead_id)
            .eq('workspace_id', workspaceId)
            .maybeSingle(),

          supabase
            .from('crm_proposal_items')
            .select(`
              id,
              item_type,
              description,
              quantity,
              unit,
              unit_price_inr,
              amount_inr,
              display_order
            `)
            .eq('proposal_id', proposalData.id)
            .order('display_order', { ascending: true })
            .order('id', { ascending: true }),
        ]);

        if (leadResult.error) {
          throw new Error(`Customer: ${leadResult.error.message}`);
        }

        if (itemsResult.error) {
          throw new Error(`Proposal items: ${itemsResult.error.message}`);
        }

        if (!active) return;

        setWorkspace(company);
        setProposal(proposalData);
        setLead(leadResult.data);
        setItems(itemsResult.data || []);
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not load this proposal.');
        }
      } finally {
        if (active) {
          setFetching(false);
          setLoadedFor(loadKey);
        }
      }
    }

    loadProposal();

    return () => {
      active = false;
    };
  }, [
    userId,
    loading,
    workspaceId,
    proposalId,
    loadKey,
    retry,
  ]);

  const missingRoute = !workspaceId || !proposalId;

  const waiting =
    loading ||
    Boolean(
      user && !missingRoute &&
      (fetching || loadedFor !== loadKey)
    );

  const ready =
    !waiting &&
    user &&
    !missingRoute &&
    loadedFor === loadKey &&
    !error &&
    workspace &&
    proposal;

  const address = lead
    ? [lead.locality, lead.city, lead.state, lead.pincode]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <div className="proposal-detail-page">
      <nav className="navigation" aria-label="Proposal navigation">
        <Link href={`${base}/proposals`}>
          ← All proposals
        </Link>

        <Link href={`${base}/overview`}>Overview</Link>
      </nav>

      {waiting && (
        <div className="notice" role="status">
          Loading proposal…
        </div>
      )}

      {!loading && !user && (
        <div className="notice">
          <h1>Sign in required</h1>
          <p>Use your installer account to view this proposal.</p>
          <Link href="/vendor-login">Installer login →</Link>
        </div>
      )}

      {!loading && user && missingRoute && (
        <div className="error" role="alert">
          Workspace or proposal ID is missing.
        </div>
      )}

      {!waiting && user && error && (
        <div className="error" role="alert">
          <h1>Could not load proposal</h1>
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
          <div className="heading">
            <div>
              <p className="eyebrow">Installer CRM · Proposal</p>
              <h1>
                {proposal.proposal_number || 'Untitled proposal'}
              </h1>
              <p className="subtitle">{workspace.company_name}</p>
            </div>

            <span className="status">
              {label(proposal.status)}
            </span>
          </div>

          <div className="actions">
            <Link
              href={`${base}/${proposal.lead_id}`}
              className="action-link"
            >
              Open lead details →
            </Link>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Refresh
            </button>
          </div>

          <div className="two-column">
            <section>
              <h2>Customer</h2>

              {lead ? (
                <dl>
                  <div>
                    <dt>Name</dt>
                    <dd>{lead.customer_name || '—'}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{lead.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{lead.email || '—'}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{address || '—'}</dd>
                  </div>
                </dl>
              ) : (
                <p className="hint">
                  Customer details are unavailable to this account.
                </p>
              )}
            </section>

            <section>
              <h2>System and estimates</h2>

              <dl>
                <div>
                  <dt>System capacity</dt>
                  <dd>
                    {measurement(
                      proposal.system_capacity_kwp,
                      'kWp'
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Estimated monthly generation</dt>
                  <dd>
                    {measurement(
                      proposal.estimated_monthly_generation_kwh,
                      'kWh'
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Estimated monthly savings</dt>
                  <dd>
                    {formatMoney(
                      proposal.estimated_monthly_savings_inr
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Valid until</dt>
                  <dd>
                    {formatDate(proposal.valid_until, true)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section>
            <h2>Proposal items</h2>

            {items.length === 0 ? (
              <div className="empty-state">
                No items are visible for this proposal. If this is
                an older draft, it may have been created before the
                transactional save was added.
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <caption className="sr-only">
                    Saved proposal line items and amounts
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Item</th>
                      <th scope="col">Description</th>
                      <th scope="col" className="number">
                        Quantity
                      </th>
                      <th scope="col">Unit</th>
                      <th scope="col" className="number">
                        Unit price
                      </th>
                      <th scope="col" className="number">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{label(item.item_type)}</td>
                        <td className="description">
                          {item.description}
                        </td>
                        <td className="number">{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td className="number">
                          {formatMoney(item.unit_price_inr)}
                        </td>
                        <td className="number">
                          {formatMoney(item.amount_inr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2>Saved pricing</h2>

            <dl className="pricing">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatMoney(proposal.subtotal_inr)}</dd>
              </div>
              <div>
                <dt>Discount deduction</dt>
                <dd>{formatMoney(proposal.discount_inr)}</dd>
              </div>
              <div>
                <dt>Subsidy deduction</dt>
                <dd>{formatMoney(proposal.subsidy_inr)}</dd>
              </div>
              <div className="total-row">
                <dt>Total after deductions</dt>
                <dd>{formatMoney(proposal.total_inr)}</dd>
              </div>
            </dl>

            <p className="hint">
              This shows the saved proposal amounts. A subsidy
              entry does not confirm eligibility, approval or receipt.
            </p>
          </section>

          {proposal.notes && (
            <section>
              <h2>Notes</h2>
              <p className="notes">{proposal.notes}</p>
            </section>
          )}

          <section>
            <h2>Record details</h2>

            <dl>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(proposal.created_at)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(proposal.updated_at)}</dd>
              </div>
              <div>
                <dt>Proposal ID</dt>
                <dd>{proposal.id}</dd>
              </div>
            </dl>

            <p className="hint">
              This is an internal, read-only proposal view. Opening
              it does not send the proposal or change its status.
            </p>
          </section>
        </>
      )}

      <style jsx>{`
        :global(body) {
          margin: 0;
          background: #1e293b;
        }

        .proposal-detail-page {
          box-sizing: border-box;
          width: 100%;
          max-width: 1100px;
          min-height: 100vh;
          margin: auto;
          padding: 28px 20px 72px;
          background: #1e293b;
          color: #f8fafc;
          font-family: Inter, -apple-system, BlinkMacSystemFont,
            'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
        }

        .proposal-detail-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }

        .navigation,
        .actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px;
        }

        .navigation {
          margin-bottom: 28px;
          font-size: 14px;
        }

        .heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #6ee7b7;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          color: #f8fafc;
          font-size: 30px;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        h2 {
          margin: 0 0 18px;
          color: #f8fafc;
          font-size: 20px;
        }

        .subtitle {
          margin: 10px 0 0;
          color: #cbd5e1;
        }

        .status {
          display: inline-block;
          padding: 6px 14px;
          border: 1px solid #065f46;
          border-radius: 999px;
          background: #064e3b;
          color: #a7f3d0;
          font-size: 13px;
          font-weight: 700;
        }

        .actions {
          margin-top: 24px;
        }

        button,
        .proposal-detail-page :global(a.action-link) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 16px;
          border: 0;
          border-radius: 9px;
          background: #facc15;
          color: #1e293b;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        button.secondary-button {
          border: 1px solid #64748b;
          background: #0f172a;
          color: #f8fafc;
        }

        section,
        .notice,
        .error {
          min-width: 0;
          margin-top: 24px;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: #0f172a;
        }

        .error {
          color: #fecaca;
          border-color: #b91c1c;
          overflow-wrap: anywhere;
        }

        .error h1 {
          color: #fecaca;
          font-size: 24px;
        }

        .two-column {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        dl {
          display: grid;
          gap: 16px;
          margin: 0;
        }

        dt {
          color: #94a3b8;
          font-size: 12px;
        }

        dd {
          margin: 4px 0 0;
          color: #f8fafc;
          overflow-wrap: anywhere;
        }

        .table-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        th,
        td {
          padding: 13px 12px;
          border-bottom: 1px solid #334155;
          text-align: left;
          vertical-align: top;
        }

        th {
          background: #1e293b;
          color: #cbd5e1;
          font-size: 12px;
        }

        td {
          color: #f8fafc;
        }

        .number {
          text-align: right;
          white-space: nowrap;
        }

        .description {
          min-width: 180px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .pricing {
          max-width: 540px;
          margin-left: auto;
        }

        .pricing > div {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 20px;
        }

        .pricing dt {
          color: #cbd5e1;
          font-size: 14px;
        }

        .pricing dd {
          margin: 0;
          text-align: right;
          white-space: nowrap;
        }

        .pricing .total-row {
          padding-top: 16px;
          border-top: 1px solid #475569;
        }

        .total-row dt,
        .total-row dd {
          color: #facc15;
          font-size: 17px;
          font-weight: 700;
        }

        .notes {
          color: #cbd5e1;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .hint {
          margin-top: 20px;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.7;
        }

        .empty-state {
          padding: 18px;
          border: 1px dashed #64748b;
          border-radius: 10px;
          color: #cbd5e1;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 760px) {
          .two-column {
            grid-template-columns: 1fr;
            gap: 0;
          }

          section {
            padding: 18px;
          }

          h1 {
            font-size: 25px;
          }
        }
      `}</style>
    </div>
  );
}
