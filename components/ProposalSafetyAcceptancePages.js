'use client';

const PAGE_CLASS = 'proposal-page';

function formatList(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export default function ProposalSafetyAcceptancePages({
  company,
  proposal,
  lead,
  safetyItems,
  qualityItems,
  complianceItems,
  acceptanceNotes,
  totalPages,
}) {
  const partnerName =
    company?.company_name || 'SolarHues Partner';

  const customerName =
    lead?.customer_name || 'Customer';

  const safety = formatList(safetyItems);

  const quality = formatList(qualityItems);

  const compliance = formatList(complianceItems);

  const notes = acceptanceNotes || '';

  return (
    <>
      <section className={PAGE_CLASS}>
        <header className="page-header">
          <div>
            <span className="brand">SolarHues</span>
            <h2>Safety, quality &amp; compliance</h2>
          </div>

          <span className="page-number">
            Page 13 of {totalPages}
          </span>
        </header>

        <div className="content">
          <p className="intro">
            The installer should confirm only the safety, quality
            and compliance practices it will actually follow for
            this project. These commitments must be reflected in
            the final agreement.
          </p>

          <h3>Safety practices</h3>

          {safety.length > 0 ? (
            <ul className="list">
              {safety.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              Safety practices have not yet been added to this
              proposal.
            </p>
          )}

          <h3>Quality checks</h3>

          {quality.length > 0 ? (
            <ul className="list">
              {quality.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              Quality checks have not yet been added to this
              proposal.
            </p>
          )}

          <h3>Compliance and approvals</h3>

          {compliance.length > 0 ? (
            <ul className="list">
              {compliance.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              Compliance and approval details have not yet been
              added to this proposal.
            </p>
          )}

          <div className="note">
            Electrical work, net-metering, structural changes and
            subsidy processes must comply with applicable local
            regulations, DISCOM requirements and manufacturer
            instructions.
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
            <h2>Proposal acceptance</h2>
          </div>

          <span className="page-number">
            Page 14 of {totalPages}
          </span>
        </header>

        <div className="content">
          <p className="intro">
            This page records the customer’s intention to proceed.
            It does not itself create a binding contract, transfer
            funds, or confirm installation.
          </p>

          <div className="acceptance-box">
            <div className="acceptance-row">
              <span>Customer</span>
              <strong>{customerName}</strong>
            </div>

            <div className="acceptance-row">
              <span>Proposal number</span>
              <strong>
                {proposal?.proposal_number ||
                  'To be confirmed'}
              </strong>
            </div>

            <div className="acceptance-row">
              <span>System capacity</span>
              <strong>
                {proposal?.system_capacity_kwp == null
                  ? 'To be confirmed'
                  : `${proposal.system_capacity_kwp} kWp`}
              </strong>
            </div>

            <div className="acceptance-row">
              <span>Valid until</span>
              <strong>
                {proposal?.valid_until ||
                  'To be confirmed'}
              </strong>
            </div>
          </div>

          {notes ? (
            <div className="notes-box">
              <span>Additional notes</span>
              <p>{notes}</p>
            </div>
          ) : null}

          <div className="declaration">
            <p>
              By signing below, the customer confirms that they
              have reviewed this proposal and wish to proceed to
              the next step. Final commercial terms, equipment,
              timeline and responsibilities will be recorded in
              the signed agreement.
            </p>
          </div>

          <div className="signature-box">
            <div>
              <span>Customer signature</span>
              <div className="signature-line" />
              <p>{customerName}</p>
            </div>

            <div>
              <span>Date</span>
              <div className="signature-line" />
              <p>DD / MM / YYYY</p>
            </div>
          </div>

          <div className="signature-box">
            <div>
              <span>For {partnerName}</span>
              <div className="signature-line" />
              <p>Authorised signatory</p>
            </div>

            <div>
              <span>Date</span>
              <div className="signature-line" />
              <p>DD / MM / YYYY</p>
            </div>
          </div>

          <div className="note">
            SolarHues does not enable payment collection or
            contract execution through this preview. Acceptance,
            agreement signing and payment movement require separate
            verified workflows and compliance review.
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

        .list {
          margin: 0;
          padding-left: 18px;
          color: #334155;
          font-size: 12px;
        }

        .list li {
          margin-bottom: 7px;
        }

        .empty {
          padding: 13px;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          color: #64748b;
          font-size: 12px;
        }

        .acceptance-box {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }

        .acceptance-row {
          min-width: 0;
          padding: 11px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .acceptance-row span {
          display: block;
          margin-bottom: 3px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .acceptance-row strong {
          color: #0f172a;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .notes-box {
          margin-bottom: 18px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .notes-box span {
          display: block;
          margin-bottom: 6px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .notes-box p {
          margin: 0;
          color: #334155;
          font-size: 12px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .declaration {
          margin: 18px 0;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .declaration p {
          margin: 0;
          color: #334155;
          font-size: 11.5px;
          line-height: 1.6;
        }

        .signature-box {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 22px;
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

        .note {
          margin-top: 18px;
          padding: 10px 12px;
          border-left: 3px solid #facc15;
          background: #fffbeb;
          color: #78350f;
          font-size: 10.5px;
          line-height: 1.55;
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
