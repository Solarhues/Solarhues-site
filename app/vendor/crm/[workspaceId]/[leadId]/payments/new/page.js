'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabase';
import { useAuth } from '../../../../../../providers';
import Logo from '../../../../../../../components/Logo';

const PURPOSES = [
  ['advance', 'Advance payment'],
  ['material', 'Material payment'],
  ['installation', 'Installation payment'],
  ['final', 'Final payment'],
  ['other', 'Other payment'],
];

export default function CreatePaymentRequestPage() {
  const { workspaceId, leadId } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [lead, setLead] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [canWrite, setCanWrite] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');

  const [requestNumber, setRequestNumber] = useState('');
  const [proposalId, setProposalId] = useState('');
  const [purpose, setPurpose] = useState('advance');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadKey = `${user?.id || ''}:${workspaceId || ''}`;

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setLead(null);
    setProposals([]);
    setCanWrite(false);
    setLoadedFor('');
    setAccessError('');

    if (!user?.id || !workspaceId || !leadId) {
      return () => {
        active = false;
      };
    }

    async function loadContext() {
      try {
        const [workspaceResult, memberResult, profileResult, leadResult, proposalsResult] =
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

            supabase
              .from('crm_leads')
              .select(
                `
                id,
                workspace_id,
                customer_name,
                phone,
                email,
                city,
                state
              `
              )
              .eq('id', leadId)
              .eq('workspace_id', workspaceId)
              .maybeSingle(),

            supabase
              .from('crm_proposals')
              .select(
                `
                id,
                proposal_number,
                status,
                total_inr
              `
              )
              .eq('lead_id', leadId)
              .eq('workspace_id', workspaceId)
              .in('status', ['sent', 'accepted'])
              .order('created_at', { ascending: false }),
          ]);

        const queryError =
          workspaceResult.error ||
          memberResult.error ||
          profileResult.error ||
          leadResult.error ||
          proposalsResult.error;

        if (queryError) throw queryError;
        if (!active) return;

        const company = workspaceResult.data;
        const member = memberResult.data;
        const isAdmin = profileResult.data?.role === 'admin';
        const leadData = leadResult.data;
        const proposalData = proposalsResult.data || [];

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

        if (!leadData) {
          throw new Error('Lead not found in this workspace.');
        }

        const memberCanWrite =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        setWorkspace(company);
        setLead(leadData);
        setProposals(proposalData);
        setCanWrite(Boolean(isAdmin || memberCanWrite));

        const now = new Date();
        setRequestNumber(
          `PAY-${now.getFullYear()}${String(
            now.getMonth() + 1
          ).padStart(2, '0')}-${Date.now()
            .toString()
            .slice(-6)}`
        );
      } catch (err) {
        if (active) {
          setAccessError(
            err.message || 'Could not load payment context.'
          );
        }
      } finally {
        if (active) setLoadedFor(loadKey);
      }
    }

    loadContext();

    return () => {
      active = false;
    };
  }, [user?.id, workspaceId, leadId, loadKey]);

  function validate() {
    if (!requestNumber.trim()) {
      return 'Please enter a payment request number.';
    }

    const amountValue = Number(amount);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return 'Please enter a payment amount greater than zero.';
    }

    if (
      dueDate &&
      Number.isNaN(new Date(dueDate).getTime())
    ) {
      return 'Please enter a valid due date.';
    }

    return '';
  }

  async function savePaymentRequest(event) {
    event.preventDefault();

    if (saving) return;

    setError('');

    if (!user || !workspace || !lead || !canWrite) {
      setError(
        'Your account cannot create payment requests for this lead.'
      );
      return;
    }

    const problem = validate();

    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);

    try {
      const { error: insertError } = await supabase
        .from('crm_payment_requests')
        .insert({
          workspace_id: workspace.id,
          lead_id: lead.id,
          proposal_id: proposalId || null,
          request_number: requestNumber.trim(),
          purpose,
          status: 'pending',
          amount_inr: Number(amount),
          due_date: dueDate || null,
          notes: notes.trim() || null,
          created_by: user.id,
        });

      if (insertError) throw insertError;

      router.push(
        `/vendor/crm/${workspaceId}/${leadId}`
      );
    } catch (err) {
      setError(
        err.message || 'Could not create the payment request.'
      );
    } finally {
      setSaving(false);
    }
  }

  const waiting =
    loading || Boolean(user && loadedFor !== loadKey);

  return (
    <div className="payment-page">
      <header>
        <Logo height={34} />
        <Link href={`/vendor/crm/${workspaceId}/${leadId}`}>
          ← Lead details
        </Link>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Create payment request</h1>

        {waiting && (
          <p role="status">Checking access…</p>
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

        {!waiting && user && workspace && lead && canWrite && (
          <>
            <p className="subtitle">
              {lead.customer_name}
              {lead.city ? `, ${lead.city}` : ''}
            </p>

            <form onSubmit={savePaymentRequest} noValidate>
              {error && (
                <div className="error" role="alert">
                  {error}
                </div>
              )}

              <fieldset disabled={saving}>
                <section>
                  <h2>Payment details</h2>

                  <div className="grid">
                    <div className="field">
                      <label htmlFor="request_number">
                        Request number *
                      </label>
                      <input
                        id="request_number"
                        value={requestNumber}
                        onChange={(event) =>
                          setRequestNumber(event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="purpose">
                        Payment purpose *
                      </label>
                      <select
                        id="purpose"
                        value={purpose}
                        onChange={(event) =>
                          setPurpose(event.target.value)
                        }
                      >
                        {PURPOSES.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="amount">
                        Amount requested (₹) *
                      </label>
                      <input
                        id="amount"
                        type="number"
                        min="1"
                        step="any"
                        value={amount}
                        onChange={(event) =>
                          setAmount(event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="due_date">
                        Payment due date
                      </label>
                      <input
                        id="due_date"
                        type="date"
                        value={dueDate}
                        onChange={(event) =>
                          setDueDate(event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="proposal_id">
                        Link to proposal
                      </label>
                      <select
                        id="proposal_id"
                        value={proposalId}
                        onChange={(event) =>
                          setProposalId(event.target.value)
                        }
                      >
                        <option value="">
                          No proposal linked
                        </option>

                        {proposals.map((proposal) => (
                          <option
                            key={proposal.id}
                            value={proposal.id}
                          >
                            {proposal.proposal_number} · ₹
                            {Number(
                              proposal.total_inr || 0
                            ).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field notes">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      rows={4}
                      maxLength={10000}
                      value={notes}
                      onChange={(event) =>
                        setNotes(event.target.value)
                      }
                    />
                  </div>

                  <p className="hint">
                    Do not store card numbers, CVV, UPI PINs,
                    passwords, or full bank credentials here.
                  </p>
                </section>

                <button type="submit">
                  {saving
                    ? 'Creating request…'
                    : 'Create payment request'}
                </button>
              </fieldset>
            </form>
          </>
        )}
      </main>

      <style jsx>{`
        .payment-page {
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
        .payment-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }
        main {
          max-width: 820px;
          margin: auto;
          padding: 32px 20px 72px;
        }
        h1 { margin: 0 0 8px; }
        h2 { margin: 0 0 18px; font-size: 19px; }
        .eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-size: 12px;
        }
        .subtitle, .hint { color: #94a3b8; }
        .hint { font-size: 12px; line-height: 1.6; }
        section, .notice, .error {
          margin: 20px 0;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        .error { color: #fca5a5; }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .field { display: grid; gap: 7px; }
        label { font-size: 13px; color: #cbd5e1; }
        input, select, textarea {
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
        .notes { margin-top: 18px; }
        fieldset { border: 0; padding: 0; margin: 0; }
        button {
          border: 0;
          border-radius: 9px;
          padding: 13px 20px;
          background: #facc15;
          color: #1e293b;
          font-weight: 700;
          cursor: pointer;
        }
        button:disabled {
          opacity: .6;
          cursor: wait;
        }
        @media (max-width: 640px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
