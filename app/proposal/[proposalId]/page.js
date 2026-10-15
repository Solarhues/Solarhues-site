'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Logo from '../../../components/Logo';

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
    month: 'long',
    year: 'numeric',
  });
}

export default function PublicProposalPage() {
  const { proposalId } = useParams();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setProposal(null);
    setError('');
    setLoading(true);

    if (!proposalId) {
      return () => {
        active = false;
      };
    }

    async function loadProposal() {
      try {
        const { data, error: proposalError } = await supabase
          .from('crm_proposals')
          .select(
            `
            id,
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
          .in('status', ['sent', 'accepted'])
          .maybeSingle();

        if (proposalError) throw proposalError;

        if (!active) return;

        if (!data) {
          throw new Error(
            'This proposal is not available or the link is invalid.'
          );
        }

        setProposal(data);
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'This proposal is not available or the link is invalid.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProposal();

    return () => {
      active = false;
    };
  }, [proposalId]);

  const items = [...(proposal?.crm_proposal_items || [])].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  );

  return (
    <div className="public-proposal">
      <header>
        <Logo height={36} />
      </header>

      <main>
        {loading && (
          <p role="status">Loading proposal…</p>
        )}

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {proposal && (
          <>
            <section className="hero">
              <p className="eyebrow">Solar proposal</p>
              <h1>
                Proposal {proposal.proposal_number}
              </h1>
              <p className="valid">
                Valid until {formatDate(proposal.valid_until)}
              </p>
            </section>

            <section>
              <h2>Your solar system</h2>

              <div className="summary">
                <div>
                  <span>System capacity</span>
                  <strong>
                    {proposal.system_capacity_kwp
                      ? `${proposal.system_capacity_kwp} kWp`
                      : 'To be confirmed'}
                  </strong>
                </div>

                <div>
                  <span>Estimated monthly generation</span>
                  <strong>
                    {proposal.estimated_monthly_generation_kwh
                      ? `${proposal.estimated_monthly_generation_kwh} kWh`
                      : 'To be confirmed'}
                  </strong>
                </div>

                <div>
                  <span>Estimated monthly savings</span>
                  <strong>
                    {proposal.estimated_monthly_savings_inr
                      ? formatMoney(
                          proposal.estimated_monthly_savings_inr
                        )
                      : 'To be confirmed'}
                  </strong>
                </div>
              </div>
            </section>

            <section>
              <h2>What’s included</h2>

              {items.length === 0 ? (
                <p>Proposal items are not available.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th>Qty</th>
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
                          <td>
                            {item.quantity} {item.unit}
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
              <h2>Investment</h2>

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

              {proposal.notes && (
                <div className="notes">
                  <h3>Notes</h3>
                  <p>{proposal.notes}</p>
                </div>
              )}
            </section>

            <section className="cta">
              <h2>Ready to proceed?</h2>
              <p>
                Contact your SolarHues installer to confirm the
                proposal and schedule the next step.
              </p>
              <Link href="/">Visit SolarHues</Link>
            </section>
          </>
        )}
      </main>

      <style jsx>{`
        .public-proposal {
          min-height: 100vh;
          background: #f8fafc;
          color: #1e293b;
          font-family: Inter, -apple-system, sans-serif;
        }
        header {
          padding: 18px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #fff;
        }
        main {
          max-width: 820px;
          margin: auto;
          padding: 32px 20px 72px;
        }
        h1 { margin: 0 0 8px; }
        h2 { margin: 0 0 18px; font-size: 20px; }
        h3 { margin: 0 0 8px; font-size: 15px; }
        .eyebrow {
          color: #059669;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-size: 12px;
          font-weight: 700;
        }
        .valid { color: #64748b; }
        section {
          margin: 20px 0;
          padding: 26px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
        }
        .hero {
          background: #ecfdf5;
          border-color: #a7f3d0;
        }
        .error {
          color: #b91c1c;
          background: #fef2f2;
          border-color: #fecaca;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .summary div {
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }
        .summary span {
          display: block;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 560px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc;
          color: #64748b;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        tr:last-child td { border-bottom: 0; }
        .pricing p {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin: 0 0 10px;
        }
        .pricing span { color: #64748b; }
        .pricing .total {
          padding-top: 14px;
          border-top: 2px solid #059669;
          font-size: 18px;
        }
        .notes {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
        }
        .notes p {
          margin: 0;
          color: #475569;
          white-space: pre-wrap;
        }
        .cta {
          text-align: center;
          background: #1e293b;
          color: #f8fafc;
          border-color: #1e293b;
        }
        .cta a {
          display: inline-block;
          margin-top: 12px;
          padding: 12px 20px;
          border-radius: 9px;
          background: #facc15;
          color: #1e293b !important;
          font-weight: 700;
          text-decoration: none;
        }
        @media (max-width: 700px) {
          .summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
