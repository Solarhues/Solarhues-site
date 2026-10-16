'use client';

const PAGE_CLASS = 'proposal-page';

function formatList(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export default function ProposalFaqContactPages({
  company,
  proposal,
  lead,
  partnerProfile,
  faqs,
  documentNotes,
  totalPages,
}) {
  const partnerName =
    company?.company_name || 'SolarHues Partner';

  const customerName =
    lead?.customer_name || 'Customer';

  const contact = partnerProfile || {};

  const questions = Array.isArray(faqs) ? faqs : [];

  const notes = documentNotes || '';

  return (
    <>
      <section className={PAGE_CLASS}>
        <header className="page-header">
          <div>
            <span className="brand">SolarHues</span>
            <h2>Frequently asked questions</h2>
          </div>

          <span className="page-number">
            Page 15 of {totalPages}
          </span>
        </header>

        <div className="content">
          <p className="intro">
            These answers are general guidance. Your final
            agreement, site survey, DISCOM requirements and
            applicable scheme rules take priority.
          </p>

          {questions.length > 0 ? (
            <div className="faq-list">
              {questions.map((item, index) => (
                <div
                  className="faq-item"
                  key={`${item.question || 'question'}-${index}`}
                >
                  <h3>
                    {item.question ||
                      'Question to be confirmed'}
                  </h3>

                  <p>
                    {item.answer ||
                      'Answer to be confirmed.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">
              Frequently asked questions have not yet been added
              to this proposal.
            </p>
          )}

          <div className="note">
            Do not use this page to make guaranteed generation,
            savings, subsidy, financing or approval claims.
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
            <h2>Contact &amp; document information</h2>
          </div>

          <span className="page-number">
            Page 16 of {totalPages}
          </span>
        </header>

        <div className="content">
          <h3>Partner contact</h3>

          <div className="contact-grid">
            <div>
              <span>Partner</span>
              <strong>{partnerName}</strong>
            </div>

            <div>
              <span>Contact person</span>
              <strong>
                {contact.contactName || 'To be confirmed'}
              </strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>
                {contact.phone || 'To be confirmed'}
              </strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                {contact.email || 'To be confirmed'}
              </strong>
            </div>
          </div>

          <div className="address-box">
            <span>Partner address</span>
            <p>
              {contact.address ||
                'Address to be confirmed.'}
            </p>
          </div>

          <h3>Document information</h3>

          <div className="contact-grid">
            <div>
              <span>Customer</span>
              <strong>{customerName}</strong>
            </div>

            <div>
              <span>Proposal number</span>
              <strong>
                {proposal?.proposal_number ||
                  'To be confirmed'}
              </strong>
            </div>

            <div>
              <span>Proposal status</span>
              <strong>
                {proposal?.status
                  ? proposal.status
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                      )
                  : 'To be confirmed'}
              </strong>
            </div>

            <div>
              <span>Valid until</span>
              <strong>
                {proposal?.valid_until ||
                  'To be confirmed'}
              </strong>
            </div>
          </div>

          {notes ? (
            <div className="notes-box">
              <span>Document notes</span>
              <p>{notes}</p>
            </div>
          ) : null}

          <div className="disclaimer">
            <h3>Important disclaimer</h3>

            <p>
              This document is an indicative proposal prepared for
              review. It is not a contract, invoice, payment
              demand, installation guarantee or approval
              confirmation. Final scope, equipment, price, taxes,
              timeline and responsibilities must be confirmed in a
              signed agreement.
            </p>

            <p>
              Generation, savings, payback, environmental impact
              and subsidy outcomes are estimates. Actual results
              depend on site conditions, consumption, tariffs,
              equipment performance, weather, approvals and
              applicable regulations.
            </p>
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
          margin: 18px 0 8px;
          color: #0f172a;
          font-size: 14px;
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

        .faq-list {
          display: grid;
          gap: 10px;
        }

        .faq-item {
          padding: 11px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .faq-item h3 {
          margin: 0 0 5px;
          color: #0f172a;
          font-size: 12.5px;
        }

        .faq-item p {
          margin: 0;
          color: #475569;
          font-size: 11.5px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .contact-grid > div {
          min-width: 0;
          padding: 11px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .contact-grid span {
          display: block;
          margin-bottom: 3px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .contact-grid strong {
          color: #0f172a;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .address-box,
        .notes-box {
          margin-top: 16px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .address-box span,
        .notes-box span {
          display: block;
          margin-bottom: 6px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .address-box p,
        .notes-box p {
          margin: 0;
          color: #334155;
          font-size: 12px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .disclaimer {
          margin-top: 20px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-left: 3px solid #facc15;
          border-radius: 8px;
          background: #fffbeb;
        }

        .disclaimer h3 {
          margin: 0 0 8px;
          color: #78350f;
        }

        .disclaimer p {
          margin: 0 0 8px;
          color: #78350f;
          font-size: 10.5px;
          line-height: 1.6;
        }

        .disclaimer p:last-child {
          margin-bottom: 0;
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
