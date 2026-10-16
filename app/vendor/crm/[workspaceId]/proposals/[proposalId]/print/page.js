'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabase';
import { useAuth } from '../../../../../../providers';

const CUSTOMER_FIELDS = [
  ['contact', 'Installer contact details'],
  ['scope', 'Scope of work'],
  ['exclusions', 'Exclusions'],
  ['warranty', 'Warranty terms'],
  ['payment', 'Payment terms'],
  ['timeline', 'Estimated delivery / installation timeline'],
];

const EMPTY_DETAILS = {
  contact: '',
  scope: '',
  exclusions: '',
  warranty: '',
  payment: '',
  timeline: '',
};

function money(value) {
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

function dateLabel(value, dateOnly = false) {
  if (!value) return 'Not specified';

  const date = new Date(
    dateOnly ? `${value}T00:00:00` : value
  );

  if (Number.isNaN(date.getTime())) return 'Not specified';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function measurement(value, unit) {
  return value === null || value === undefined
    ? 'Not specified'
    : `${value} ${unit}`;
}

function label(value) {
  if (!value) return 'Not specified';

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProposalPrintPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const proposalId = params?.proposalId;

  const { user, loading } = useAuth();
  const userId = user?.id;

  const base = `/vendor/crm/${workspaceId}`;
  const loadKey =
    `${userId || ''}:${workspaceId || ''}:${proposalId || ''}`;

  const [record, setRecord] = useState(null);
  const [loadedFor, setLoadedFor] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [details, setDetails] = useState({ ...EMPTY_DETAILS });
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    let active = true;

    setRecord(null);
    setLoadedFor('');
    setError('');
    setDetails({ ...EMPTY_DETAILS });
    setReviewed(false);

    if (loading || !userId || !workspaceId || !proposalId) {
      return () => {
        active = false;
      };
    }

    async function loadDocument() {
      try {
        const [companyResult, memberResult, profileResult] =
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
              .eq('user_id', userId)
              .maybeSingle(),

            supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .maybeSingle(),
          ]);

        const accessError =
          companyResult.error ||
          memberResult.error ||
          profileResult.error;

        if (accessError) throw accessError;

        const company = companyResult.data;
        const member = memberResult.data;
        const isAdmin = profileResult.data?.role === 'admin';

        const workspaceAvailable =
          company &&
          company.status === 'active' &&
          (
            !company.access_expires_at ||
            new Date(company.access_expires_at).getTime() >
              Date.now()
          );

        if (!workspaceAvailable) {
          throw new Error(
            'Workspace is unavailable, expired, or inaccessible.'
          );
        }

        const memberAllowed =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        if (!isAdmin && !memberAllowed) {
          throw new Error(
            'Your account cannot prepare customer proposals here.'
          );
        }

        if (!active) return;

        const { data: proposal, error: proposalError } =
          await supabase
            .from('crm_proposals')
            .select(`
              id,
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
              valid_until,
              created_at
            `)
            .eq('id', proposalId)
            .eq('workspace_id', workspaceId)
            .maybeSingle();

        if (proposalError) throw proposalError;

        if (!proposal) {
          throw new Error(
            'Proposal not found in this workspace or inaccessible.'
          );
        }

        const [leadResult, itemsResult] = await Promise.all([
          supabase
            .from('crm_leads')
            .select('id, customer_name, locality, city, state, pincode')
            .eq('id', proposal.lead_id)
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
            .eq('proposal_id', proposal.id)
            .order('display_order', { ascending: true })
            .order('id', { ascending: true }),
        ]);

        if (leadResult.error) throw leadResult.error;
        if (itemsResult.error) throw itemsResult.error;

        if (!leadResult.data) {
          throw new Error(
            'Customer details are unavailable. Check access before printing.'
          );
        }

        if (!itemsResult.data?.length) {
          throw new Error(
            'No proposal items are available. Review this proposal ' +
            'before generating a customer document.'
          );
        }

        if (!active) return;

        setRecord({
          company,
          proposal,
          lead: leadResult.data,
          items: itemsResult.data,
        });
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not prepare this proposal.');
        }
      } finally {
        if (active) setLoadedFor(loadKey);
      }
    }

    loadDocument();

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

  useEffect(() => {
    if (!record || loadedFor !== loadKey) return;

    const previousTitle = document.title;
    document.title =
      `${record.proposal.proposal_number} - Solar Proposal`;

    return () => {
      document.title = previousTitle;
    };
  }, [record, loadedFor, loadKey]);

  function updateDetail(field, value) {
    setReviewed(false);
    setDetails((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  const missingRoute = !workspaceId || !proposalId;

  const waiting =
    loading ||
    Boolean(user && !missingRoute && loadedFor !== loadKey);

  const ready =
    !waiting &&
    user &&
    !missingRoute &&
    loadedFor === loadKey &&
    !error &&
    record;

  const address = record
    ? [
        record.lead.locality,
        record.lead.city,
        record.lead.state,
        record.lead.pincode,
      ].filter(Boolean).join(', ')
    : '';

  return (
    <div className="print-page">
      <div className="screen-only">
        <nav className="navigation" aria-label="Print view navigation">
          <Link href={`${base}/proposals/${proposalId}`}>
            ← Internal proposal
          </Link>
          <Link href={`${base}/proposals`}>All proposals</Link>
        </nav>

        <h1 className="screen-title">Customer PDF preview</h1>

        {waiting && (
          <div className="panel" role="status">
            Preparing proposal…
          </div>
        )}

        {!loading && !user && (
          <div className="panel">
            <p>Sign in to prepare this proposal.</p>
            <Link href="/vendor-login">Installer login →</Link>
          </div>
        )}

        {!loading && user && missingRoute && (
          <div className="panel error" role="alert">
            Workspace or proposal ID is missing.
          </div>
        )}

        {!waiting && user && error && (
          <div className="panel error" role="alert">
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
          <div className="panel">
            <h2>Customer-facing information</h2>

            <p className="hint">
              These entries appear in the PDF only. They are not
              saved and will be lost when you refresh or leave.
              Do not paste internal notes or unconfirmed promises.
            </p>

            <div className="editor-grid">
              {CUSTOMER_FIELDS.map(([field, title]) => (
                <div className="field" key={field}>
                  <label htmlFor={`customer-${field}`}>
                    {title}
                  </label>
                  <textarea
                    id={`customer-${field}`}
                    rows={3}
                    maxLength={5000}
                    value={details[field]}
                    placeholder="Leave blank if not yet specified"
                    onChange={(event) =>
                      updateDetail(field, event.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <p className="hint">
              Blank terms appear as “Not specified in this proposal.”
              Taxes are not separately broken out in the saved
              pricing. Review the commercial meaning before sending.
            </p>

            {record.proposal.status === 'draft' && (
              <p className="warning">
                This proposal is still a draft. The customer PDF
                will retain its Draft status.
              </p>
            )}

            <label className="review-check">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(event) =>
                  setReviewed(event.target.checked)
                }
              />
              I have reviewed the customer, items, pricing and terms.
            </label>

            <button
              type="button"
              disabled={!reviewed}
              onClick={() => window.print()}
            >
              Print / Save as PDF
            </button>

            <p className="hint">
              In the print dialog, choose A4 and Save as PDF.
              Turn off browser headers and footers to avoid printing
              the CRM URL. Check every page before sharing.
            </p>
          </div>
        )}
      </div>

      {ready && (
        <article
          id="customer-proposal-document"
          className="document"
          aria-label="Customer solar proposal"
        >
          <header className="document-header">
            <div>
              <p className="brand">SolarHues</p>
              <p className="brand-caption">
                Solar proposal prepared by
              </p>
              <h2 className="company-name">
                {record.company.company_name}
              </h2>
              {details.contact.trim() && (
                <p className="multiline contact">
                  {details.contact.trim()}
                </p>
              )}
            </div>

            <div className="proposal-reference">
              <h2>SOLAR PROPOSAL</h2>
              <p>{record.proposal.proposal_number}</p>
              <span className="status">
                {label(record.proposal.status)}
              </span>
            </div>
          </header>

          <section className="customer-grid">
            <div>
              <h3>Prepared for</h3>
              <p className="customer-name">
                {record.lead.customer_name || 'Customer'}
              </p>
              <p>{address || 'Site location not specified'}</p>
            </div>

            <dl className="reference-details">
              <div>
                <dt>Proposal date</dt>
                <dd>{dateLabel(record.proposal.created_at)}</dd>
              </div>
              <div>
                <dt>Valid until</dt>
                <dd>
                  {dateLabel(record.proposal.valid_until, true)}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3>Proposed solar system</h3>

            <div className="system-grid">
              <div className="metric">
                <span>System capacity</span>
                <strong>
                  {measurement(
                    record.proposal.system_capacity_kwp,
                    'kWp'
                  )}
                </strong>
              </div>

              <div className="metric">
                <span>Estimated monthly generation</span>
                <strong>
                  {measurement(
                    record.proposal.estimated_monthly_generation_kwh,
                    'kWh'
                  )}
                </strong>
              </div>

              <div className="metric">
                <span>Estimated monthly savings</span>
                <strong>
                  {money(
                    record.proposal.estimated_monthly_savings_inr
                  )}
                </strong>
              </div>
            </div>

            <p className="document-note">
              Generation and savings figures are estimates, not
              guarantees of performance or financial return.
            </p>
          </section>

          <section>
            <h3>Components and services</h3>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Description</th>
                    <th scope="col" className="number">Qty</th>
                    <th scope="col">Unit</th>
                    <th scope="col" className="number">
                      Unit price
                    </th>
                    <th scope="col" className="number">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {record.items.map((item) => (
                    <tr key={item.id}>
                      <td className="item-description">
                        <span className="item-type">
                          {label(item.item_type)}
                        </span>
                        <div className="multiline">
                          {item.description}
                        </div>
                      </td>
                      <td className="number">{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td className="number">
                        {money(item.unit_price_inr)}
                      </td>
                      <td className="number">
                        {money(item.amount_inr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="pricing-section">
            <div className="price-summary">
              <div>
                <span>Subtotal</span>
                <strong>
                  {money(record.proposal.subtotal_inr)}
                </strong>
              </div>
              <div>
                <span>Discount deduction</span>
                <strong>
                  {money(record.proposal.discount_inr)}
                </strong>
              </div>
              <div>
                <span>Subsidy deduction entered</span>
                <strong>
                  {money(record.proposal.subsidy_inr)}
                </strong>
              </div>
              <div className="grand-total">
                <span>Total after deductions</span>
                <strong>{money(record.proposal.total_inr)}</strong>
              </div>
            </div>

            <p className="document-note">
              Amounts are in Indian rupees (INR). The total shown
              follows the saved calculation: subtotal minus discount
              minus subsidy deduction. Tax treatment is not separately
              specified here.
            </p>

            {Number(record.proposal.subsidy_inr) > 0 && (
              <p className="subsidy-notice">
                The entered subsidy deduction does not confirm
                eligibility, approval, disbursement or upfront
                availability. The installer and customer must
                confirm who pays this amount and when.
              </p>
            )}
          </section>

          <section className="terms-section">
            <h3>Scope and commercial terms</h3>

            {CUSTOMER_FIELDS
              .filter(([field]) => field !== 'contact')
              .map(([field, title]) => (
                <div className="term" key={field}>
                  <h4>{title}</h4>
                  <p className="multiline">
                    {details[field].trim() ||
                      'Not specified in this proposal.'}
                  </p>
                </div>
              ))}
          </section>

          <footer className="document-footer">
            <p>
              Prepared by {record.company.company_name} using
              SolarHues.
            </p>
            <p>
              This document is a proposal, not a payment receipt.
              SolarHues branding does not certify installer approval,
              subsidy eligibility or workmanship.
            </p>
          </footer>
        </article>
      )}

      <style jsx>{`
        :global(body) {
          margin: 0;
          background: #1e293b;
        }

        .print-page {
          box-sizing: border-box;
          min-height: 100vh;
          padding: 28px 20px 64px;
          background: #1e293b;
          color: #f8fafc;
          font-family: Arial, sans-serif;
        }

        .screen-only {
          max-width: 1000px;
          margin: 0 auto;
        }

        .navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;
        }

        .print-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }

        .screen-title {
          font-size: 28px;
          margin: 0 0 20px;
        }

        .panel {
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: #0f172a;
          margin-bottom: 28px;
        }

        .panel h2 {
          margin: 0 0 12px;
          font-size: 20px;
        }

        .hint {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .warning {
          color: #fde68a;
          font-size: 13px;
          line-height: 1.6;
        }

        .error {
          color: #fecaca;
          overflow-wrap: anywhere;
        }

        .editor-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .field {
          display: grid;
          gap: 8px;
        }

        .field label {
          color: #cbd5e1;
          font-size: 13px;
        }

        textarea {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          resize: vertical;
          padding: 12px;
          border: 1px solid #64748b;
          border-radius: 9px;
          background: #1e293b;
          color: #fff;
          font: inherit;
          font-size: 14px;
        }

        .review-check {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 22px 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .review-check input {
          margin-top: 4px;
          accent-color: #facc15;
        }

        button {
          padding: 13px 18px;
          border: 0;
          border-radius: 9px;
          background: #facc15;
          color: #1e293b;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .document {
          box-sizing: border-box;
          max-width: 210mm;
          margin: 32px auto 0;
          padding: 16mm;
          background: #fff;
          color: #172033;
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        .document-header {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding-bottom: 22px;
          border-bottom: 3px solid #eab308;
        }

        .brand {
          margin: 0;
          color: #065f46;
          font-size: 25px;
          font-weight: 800;
        }

        .brand-caption {
          margin: 6px 0 2px;
          color: #64748b;
          font-size: 10px;
        }

        .company-name {
          margin: 0;
          color: #172033;
          font-size: 18px;
          overflow-wrap: anywhere;
        }

        .contact {
          margin: 8px 0 0;
          font-size: 11px;
        }

        .proposal-reference {
          flex-shrink: 0;
          max-width: 45%;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .proposal-reference h2 {
          margin: 0;
          color: #172033;
          font-size: 17px;
          letter-spacing: 0.04em;
        }

        .proposal-reference p {
          margin: 7px 0;
          font-weight: 700;
        }

        .status {
          display: inline-block;
          padding: 3px 9px;
          border: 1px solid #94a3b8;
          border-radius: 4px;
          font-size: 10px;
        }

        .document section {
          margin-top: 24px;
        }

        .document h3 {
          margin: 0 0 12px;
          color: #172033;
          font-size: 14px;
        }

        .customer-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 28px;
        }

        .customer-grid p {
          margin: 4px 0;
        }

        .customer-name {
          font-size: 15px;
          font-weight: 700;
        }

        .reference-details {
          margin: 0;
        }

        .reference-details > div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 8px;
        }

        .reference-details dt {
          color: #475569;
        }

        .reference-details dd {
          margin: 0;
          text-align: right;
        }

        .system-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .metric {
          padding: 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
        }

        .metric span {
          display: block;
          color: #475569;
          font-size: 10px;
        }

        .metric strong {
          display: block;
          margin-top: 6px;
          font-size: 14px;
        }

        .document-note {
          color: #475569;
          font-size: 10px;
          line-height: 1.6;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        th,
        td {
          padding: 10px 7px;
          border-bottom: 1px solid #cbd5e1;
          text-align: left;
          vertical-align: top;
        }

        th {
          color: #172033;
          background: #f1f5f9;
          border-top: 1px solid #cbd5e1;
          font-size: 10px;
        }

        .number {
          text-align: right;
          white-space: nowrap;
        }

        .item-description {
          width: 42%;
          overflow-wrap: anywhere;
        }

        .item-type {
          display: block;
          margin-bottom: 3px;
          color: #475569;
          font-size: 9px;
          text-transform: uppercase;
        }

        .multiline {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .price-summary {
          width: min(100%, 350px);
          margin-left: auto;
        }

        .price-summary > div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 7px 0;
        }

        .price-summary strong {
          white-space: nowrap;
        }

        .grand-total {
          margin-top: 7px;
          padding-top: 12px !important;
          border-top: 2px solid #172033;
          font-size: 14px;
        }

        .subsidy-notice {
          padding: 10px;
          border: 1px solid #d97706;
          color: #78350f;
          font-size: 10px;
        }

        .term {
          margin-bottom: 14px;
        }

        .term h4 {
          margin: 0 0 4px;
          font-size: 11px;
        }

        .term p {
          margin: 0;
          color: #334155;
          font-size: 11px;
        }

        .document-footer {
          margin-top: 30px;
          padding-top: 14px;
          border-top: 1px solid #cbd5e1;
          color: #64748b;
          font-size: 9px;
        }

        .document-footer p {
          margin: 4px 0;
        }

        @media (max-width: 700px) {
          .editor-grid,
          .customer-grid,
          .system-grid {
            grid-template-columns: 1fr;
          }

          .document {
            padding: 24px;
          }

          .document-header {
            flex-direction: column;
          }

          .proposal-reference {
            max-width: 100%;
            text-align: left;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          :global(html),
          :global(body) {
            background: #fff !important;
          }

          :global(body *) {
            visibility: hidden !important;
          }

          .document,
          .document * {
            visibility: visible !important;
          }

          .screen-only {
            display: none !important;
          }

          .print-page {
            padding: 0;
            min-height: 0;
            background: #fff;
          }

          .document {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
            box-shadow: none;
            color: #000;
          }

          .document-header {
            flex-direction: row;
            break-inside: avoid;
          }

          .proposal-reference {
            max-width: 45%;
            text-align: right;
          }

          .customer-grid {
            grid-template-columns: 1.2fr 1fr;
          }

          .system-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .table-wrap {
            overflow: visible;
          }

          thead {
            display: table-header-group;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          h3,
          h4 {
            break-after: avoid;
          }

          .metric,
          .price-summary,
          .document-footer {
            break-inside: avoid;
          }

          p {
            orphans: 3;
            widows: 3;
          }
        }
      `}</style>
    </div>
  );
}
