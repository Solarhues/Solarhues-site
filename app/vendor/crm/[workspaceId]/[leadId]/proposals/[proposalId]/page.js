'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabase';
import { useAuth } from '../../../../../../providers';
import Logo from '../../../../../../../components/Logo';

const STATUSES = [
  ['draft', 'Draft'],
  ['sent', 'Sent'],
  ['accepted', 'Accepted'],
  ['rejected', 'Rejected'],
];

const ITEM_LABELS = {
  panel: 'Panel',
  inverter: 'Inverter',
  mounting: 'Mounting',
  installation: 'Installation',
  other: 'Other',
};

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

function formatDateTime(value) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ProposalViewPage() {
  const { workspaceId, leadId, proposalId } = useParams();
  const { user, loading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');

  const [proposal, setProposal] = useState(null);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalError, setProposalError] = useState('');

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSaved, setStatusSaved] = useState(false);

  const loadKey = `${user?.id || ''}:${workspaceId || ''}`;

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setCanWrite(false);
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
          (
            !company.access_expires_at ||
            new Date(company.access_expires_at).getTime() > Date.now()
          );

        if (!available) {
          throw new Error(
            'Workspace unavailable, suspended, expired, or inaccessible.'
          );
        }

        const memberCanWrite =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        setWorkspace(company);
        setCanWrite(Boolean(isAdmin || memberCanWrite));
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

    setProposal(null);
    setProposalError('');
    setStatusError('');
    setStatusSaved(false);

    if (
      !user?.id ||
      !workspaceId ||
      !leadId ||
      !proposalId ||
      !canWrite
    ) {
      return () => {
        active = false;
      };
    }

    async function loadProposal() {
      setProposalLoading(true);

      try {
        const { data, error: proposalQueryError } = await supabase
          .from('crm_proposals')
          .select(
            `
            *,
            crm_proposal_items (
              id,
              item_type,
              description,
              quantity,
              unit,
              unit_price_inr,
              amount_inr,
              display_order
            )
          `
          )
          .eq('id', proposalId)
          .eq('workspace_id', workspaceId)
          .eq('lead_id', leadId)
          .maybeSingle();

        if (proposalQueryError) throw proposalQueryError;
        if (!active) return;

        if (!data) {
          throw new Error(
            'Proposal not found in this workspace or lead.'
          );
        }

        setProposal(data);
      } catch (err) {
        if (active) {
          setProposalError(
            err.message || 'Could not load this proposal.'
          );
        }
      } finally {
        if (active) setProposalLoading(false);
      }
    }

    loadProposal();

    return () => {
      active = false;
    };
  }, [
    user?.id,
    workspaceId,
    leadId,
    proposalId,
    canWrite,
  ]);

  async function updateStatus(nextStatus) {
    if (updatingStatus || !proposal) return;

    setStatusError('');
    setStatusSaved(false);
    setUpdatingStatus(true);

    try {
      const { data, error: updateError } = await supabase
        .from('crm_proposals')
        .update({ status: nextStatus })
        .eq('id', proposal.id)
        .eq('workspace_id', workspaceId)
        .eq('lead_id', leadId)
        .select('*')
        .single();

      if (updateError) throw updateError;

      setProposal((previous) => ({
        ...previous,
        ...data,
      }));
      setStatusSaved(true);
    } catch (err) {
      setStatusError(
        err.message || 'Could not update proposal status.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  const items = [...(proposal?.crm_proposal_items || [])].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  );

  const waiting =
    loading || Boolean(user && loadedFor !== loadKey);

  return (
    <div className="proposal-view-page">
      <header>
        <Logo height={34} />
        <Link href={`/vendor/crm/${workspaceId}/${leadId}`}>
          ← Lead details
        </Link>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Proposal</h1>

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

        {!waiting && user && workspace && !canWrite && (
          <div className="notice">
            Only workspace owners, sales staff and SolarHues admins
            can view proposals.
          </div>
        )}

        {!waiting && user && workspace && canWrite && (
          <>
            {proposalLoading && (
              <p role="status">Loading proposal…</p>
            )}

            {proposalError && (
              <div className="error" role="alert">
                {proposalError}
              </div>
            )}

            {proposal && (
              <>
                <section>
                  <div className="proposal-head">
                    <div>
                      <p className="proposal-number">
                        {proposal.proposal_number}
                      </p>
                      <p className="status-line">
                        Status:{' '}
                        <strong>
                          {STATUSES.find(
                            ([value]) =>
                              value === proposal.status
                          )?.[1] || proposal.status}
                        </strong>
                      </p>
                    </div>

                    <div className="status-actions">
                      {['sent', 'accepted'].includes(
                        proposal.status
                      ) && (
                        <Link
                          href={`/proposal/${proposal.id}`}
                          target="_blank"
                          className="share-link"
                        >
                          Open customer link
                        </Link>
                      )}

                      {STATUSES.map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          disabled={
                            updatingStatus ||
                            proposal.status === value
                          }
                          className={
                            proposal.status === value
                              ? 'active'
                              : ''
                          }
                          onClick={() =>
                            updateStatus(value)
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {statusSaved && (
                    <div className="success" role="status">
                      Proposal status updated.
                    </div>
                  )}

                  {statusError && (
                    <div className="error" role="alert">
                      {statusError}
                    </div>
                  )}
                </section>

                <section>
                  <h2>Proposal summary</h2>

                  <div className="summary">
                    <p>
                      <span>System capacity</span>
                      <strong>
                        {proposal.system_capacity_kwp
                          ? `${proposal.system_capacity_kwp} kWp`
                          : '—'}
                      </strong>
                    </p>

                    <p>
                      <span>Estimated monthly generation</span>
                      <strong>
                        {proposal.estimated_monthly_generation_kwh
                          ? `${proposal.estimated_monthly_generation_kwh} kWh`
                          : '—'}
                      </strong>
                    </p>

                    <p>
                      <span>Estimated monthly savings</span>
                      <strong>
                        {proposal.estimated_monthly_savings_inr
                          ? formatMoney(
                              proposal.estimated_monthly_savings_inr
                            )
                          : '—'}
                      </strong>
                    </p>

                    <p>
                      <span>Valid until</span>
                      <strong>
                        {formatDate(proposal.valid_until)}
                      </strong>
                    </p>

                    <p>
                      <span>Created</span>
                      <strong>
                        {formatDateTime(proposal.created_at)}
                      </strong>
                    </p>

                    <p>
                      <span>Last updated</span>
                      <strong>
                        {formatDateTime(proposal.updated_at)}
                      </strong>
                    </p>
                  </div>

                  {proposal.notes && (
                    <div className="notes">
                      <h3>Notes</h3>
                      <p>{proposal.notes}</p>
                    </div>
                  )}
                </section>

               <section>
  <h2>Items</h2>

  {items.length === 0 ? (
    <p>No proposal items were saved.</p>
  ) : (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                {ITEM_LABELS[item.item_type] ||
                  item.item_type}
              </td>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>
                {formatMoney(item.unit_price_inr)}
              </td>
              <td>
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
                  <h2>Pricing</h2>

                  <div className="pricing">
                    <p>
                      <span>Subtotal</span>
                      <strong>
                        {formatMoney(proposal.subtotal_inr)}
                      </strong>
                    </p>

                    <p>
                      <span>Discount</span>
                      <strong>
                        -{formatMoney(proposal.discount_inr)}
                      </strong>
                    </p>

                    <p>
                      <span>Subsidy</span>
                      <strong>
                        -{formatMoney(proposal.subsidy_inr)}
                      </strong>
                    </p>

                    <p className="total">
                      <span>Total payable</span>
                      <strong>
                        {formatMoney(proposal.total_inr)}
                      </strong>
                    </p>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        .proposal-view-page {
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
        .proposal-view-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }
        main {
          max-width: 940px;
          margin: auto;
          padding: 32px 20px 72px;
        }
        h1 { margin: 0 0 8px; }
        h2 { margin: 0 0 18px; font-size: 19px; }
        h3 { margin: 0 0 8px; font-size: 15px; }
        .eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-size: 12px;
        }
        section, .notice, .error, .success {
          margin: 20px 0;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        .error { color: #fca5a5; }
        .success {
          border-color: #059669;
          color: #6ee7b7;
          margin-top: 16px;
        }
        .proposal-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }
        .proposal-number {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }
        .status-line {
          margin: 6px 0 0;
          color: #94a3b8;
        }
        .status-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .share-link {
          display: inline-block;
          padding: 10px 16px;
          border: 1px solid #64748b;
          border-radius: 9px;
          background: #0f172a;
          color: #fff !important;
          font-weight: 600;
        }
        .status-actions button {
          border: 1px solid #64748b;
          background: #0f172a;
          color: #cbd5e1;
          padding: 9px 13px;
          border-radius: 999px;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
        }
        .status-actions button.active {
          background: #facc15;
          border-color: #facc15;
          color: #1e293b;
          font-weight: 700;
        }
        .status-actions button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        .summary, .pricing {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .summary p,
        .pricing p {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin: 0;
          padding: 12px;
          border: 1px solid #334155;
          border-radius: 10px;
          background: rgba(15,23,42,.6);
        }
        .summary span,
        .pricing span {
          color: #94a3b8;
          font-size: 13px;
        }
        .pricing .total {
          border-color: #facc15;
        }
        .notes {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #334155;
        }
        .notes p {
          margin: 0;
          color: #cbd5e1;
          white-space: pre-wrap;
        }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid #475569;
          border-radius: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 680px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #334155;
        }
        th {
          color: #94a3b8;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        tr:last-child td { border-bottom: 0; }
        @media (max-width: 700px) {
          .summary, .pricing {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
