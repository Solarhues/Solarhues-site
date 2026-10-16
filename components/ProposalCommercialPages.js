'use client';

const PAGE_CLASS = 'proposal-page';

function formatCurrency(value) {
  if (value == null || value === '') {
    return 'To be confirmed';
  }

  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function formatList(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export default function ProposalCommercialPages({
  company,
  proposal,
  lead,
  commercial,
  paymentSchedule,
  warrantyItems,
  nextSteps,
  totalPages,
}) {
  const partnerName =
    company?.company_name || 'SolarHues Partner';

  const customerName =
    lead?.customer_name || 'Customer';

  const details = commercial || {};

  const payments = Array.isArray(paymentSchedule)
    ? paymentSchedule
    : [];

  const warranties = formatList(warrantyItems);

  const steps = formatList(nextSteps);

  const hasPayments = payments.length > 0;

  return (
    <>
      <section className={PAGE_CLASS}>
        <header className="page-header">
          <div>
            <span className="brand">SolarHues</span>
            <h2>Commercial summary</h2>
          </div>

          <span className="page-number">
            Page 7 of {totalPages}
          </span>
        </header>

        <div className="content">
          <p className="intro">
            This page summarises the proposed commercial terms.
            The final payable amount, taxes, subsidies and payment
            schedule must be confirmed in the signed agreement.
          </p>

          <div className="amount-grid">
            <div>
              <span>System capacity</span>
              <strong>
                {proposal?.system_capacity_kwp == null
                  ? 'To be confirmed'
                  : `${proposal.system_capacity_kwp} kWp`}
              </strong>
            </div>

            <div>
              <span>Basic proposal value</span>
              <strong>
                {formatCurrency(details.basicAmount)}
              </strong>
            </div>

            <div>
              <span>GST</span>
              <strong>
                {formatCurrency(details.gstAmount)}
              </strong>
            </div>

            <div>
              <span>Total including GST</span>
              <strong>
                {formatCurrency(details.totalIncludingGst)}
              </strong>
            </div>
          </div>

          <h3>Payment schedule</h3>

          {hasPayments ? (
            <table>
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Percentage</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment, index) => (
                  <tr
                    key={`${payment.milestone || 'payment'}-${index}`}
                  >
                    <td>
                      {payment.milestone || 'Milestone'}
                    </td>

                    <td>
                      {payment.percentage
                        ? `${payment.percentage}%`
                        : 'To be confirmed'}
                    </td>

                    <td>
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">
              The installer has not yet added a payment schedule.
            </p>
          )}

          <div className="note">
            Do not treat this page as a payment demand. SolarHues
            does not enable live payment movement until escrow and
            related compliance requirements are reviewed and
            approved.
          </div>
        </div>

        <footer className="page-footer">
          <span>
            Prepared for {customerName} by {partnerName}
          </span>

          <span>
            {proposal?.proposal_number ||
              'Solar proposal'}
          </span>
        </footer>
      </section>

      <section className={PAGE_CLASS}>
        <header className="page-header">
          <div>
            <span className="brand">SolarHues</span>
            <h2>Warranty, terms &amp; next steps</h2>
          </div>

          <span className="page-number">
            Page 8 of {totalPages}
          </span>
        </header>

        <div className="content">
          <h3>Warranty summary</h3>

          {warranties.length > 0 ? (
            <ul className="list">
              {warranties.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              Warranty terms have not yet been added to this
              proposal.
            </p>
          )}

          <h3>Important terms</h3>

          <ul className="list">
            <li>
              This document is an invitation to review the proposed
              solution and is not a contract.
            </li>

            <li>
              Final equipment, pricing, timeline and scope are
              subject to site survey, written agreement and
              applicable approvals.
            </li>

            <li>
              Subsidy eligibility, documentation and disbursal are
              governed by the applicable scheme and DISCOM process.
            </li>

            <li>
              Generation figures are estimates. Actual output
              depends on site conditions, shading, weather,
              equipment performance and usage.
            </li>
          </ul>

          <h3>Next steps</h3>

          {steps.length > 0 ? (
            <ol className="list numbered">
              {steps.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty">
              Next steps have not yet been added to this proposal.
            </p>
          )}

          <div className="signature-box">
            <div>
              <span>For {partnerName}</span>
              <div className="signature-line" />
              <p>Authorised signatory</p>
            </div>

            <div>
              <span>Customer acceptance</span>
              <div className="signature-line" />
              <p>{customerName}</p>
            </div>
          </div>
        </div>

        <footer className="page-footer">
          <span>
            Prepared for {customerName} by {partnerName}
          </span>

          <span>
            {proposal?.proposal_number ||
              'Solar proposal'}
          </span>
        </footer>
      </section>

      <style jsx>{`
        .proposal-page {
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          width: 210mm;
          height: 297mm;
          padding: 16mm 14mm 18mm;
          overflow: hidden;
          background: #ffffff;
          color: #0f172a;
          font-family: Inter, -apple-system, BlinkMacSystemFont,
            'Segoe UI', Arial, sans-serif;
          line-height: 1.55;
          page-break-after: always;
          break-after: page;
        }

        .proposal-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #facc15;
        }

        .brand {
          display: block;
          margin-bottom: 4px;
          color: #059669;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        h2 {
          margin: 0;
          color: #0f172a;
          font-family: 'Space Grotesk', Inter, Arial, sans-serif;
          font-size: 24px;
          line-height: 1.25;
        }

        h3 {
          margin: 20px 0 10px;
          color: #0f172a;
          font-size: 15px;
        }

        .page-number {
          flex: 0 0 auto;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .content {
          flex: 1 1 auto;
          min-height: 0;
          padding-top: 16px;
        }

        .intro {
          margin: 0 0 16px;
          color: #475569;
          font-size: 12px;
        }

        .amount-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .amount-grid > div {
          min-width: 0;
          padding: 11px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .amount-grid span {
          display: block;
          margin-bottom: 3px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .amount-grid strong {
          color: #0f172a;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        th,
        td {
          padding: 8px 9px;
          border: 1px solid #e2e8f0;
          text-align: left;
          vertical-align: top;
          overflow-wrap: anywhere;
        }

        th {
          background: #f1f5f9;
          color: #334155;
          font-size: 10px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        td {
          color: #0f172a;
        }

        .list {
          margin: 0;
          padding-left: 18px;
          color: #334155;
          font-size: 12px;
        }

        .list li {
          margin-bottom: 7px;
        }

        .numbered {
          padding-left: 20px;
          list-style: decimal;
        }

        .empty {
          padding: 13px;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          color: #64748b;
          font-size: 12px;
        }

        .note {
          margin-top: 18px;
          padding: 10px 12px;
          border-left: 3px solid #facc15;
          background: #fffbeb;
          color: #78350f;
          font-size: 10.5px;
          line-height: 1.55;
        }

        .signature-box {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          margin-top: 28px;
        }

        .signature-box span {
          display: block;
          margin-bottom: 34px;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
        }

        .signature-line {
          border-bottom: 1px solid #94a3b8;
        }

        .signature-box p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 10px;
        }

        .page-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 9.5px;
        }

        .page-footer span {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        @media print {
          .proposal-page {
            width: 210mm;
            height: 297mm;
            padding: 16mm 14mm 18mm;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}
