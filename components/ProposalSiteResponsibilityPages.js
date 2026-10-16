'use client';

const PAGE_CLASS = 'proposal-page';

function formatList(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export default function ProposalSiteResponsibilityPages({
  company,
  proposal,
  lead,
  siteLayout,
  customerResponsibilities,
  documentsRequired,
  totalPages,
}) {
  const partnerName =
    company?.company_name || 'SolarHues Partner';

  const customerName =
    lead?.customer_name || 'Customer';

  const layout = siteLayout || {};

  const responsibilities = formatList(
    customerResponsibilities
  );

  const documents = formatList(documentsRequired);

  const hasLayout = Boolean(
    layout.layoutNotes ||
    layout.moduleArea ||
    layout.inverterLocation ||
    layout.cableRoute ||
    layout.earthingLocation
  );

  return (
    <>
      <section className={PAGE_CLASS}>
        <header className="page-header">
          <div>
            <span className="brand">SolarHues</span>
            <h2>Site layout &amp; installation plan</h2>
          </div>

          <span className="page-number">
            Page 11 of {totalPages}
          </span>
        </header>

        <div className="content">
          <p className="intro">
            This is an indicative installation layout. The final
            layout must be confirmed after a physical site survey,
            structural check and DISCOM requirements.
          </p>

          <div className="site-grid">
            <div>
              <span>Customer</span>
              <strong>{customerName}</strong>
            </div>

            <div>
              <span>Site</span>
              <strong>
                {[
                  lead?.locality,
                  lead?.city,
                  lead?.state,
                ]
                  .filter(Boolean)
                  .join(', ') || 'To be confirmed'}
              </strong>
            </div>

            <div>
              <span>Roof type</span>
              <strong>
                {layout.roofType || 'To be confirmed'}
              </strong>
            </div>

            <div>
              <span>Available roof area</span>
              <strong>
                {layout.availableRoofArea
                  ? `${layout.availableRoofArea} sq ft`
                  : 'To be confirmed'}
              </strong>
            </div>
          </div>

          <h3>Indicative layout</h3>

          {hasLayout ? (
            <div className="layout-grid">
              <div>
                <span>Module area</span>
                <strong>
                  {layout.moduleArea ||
                    'To be confirmed'}
                </strong>
              </div>

              <div>
                <span>Inverter location</span>
                <strong>
                  {layout.inverterLocation ||
                    'To be confirmed'}
                </strong>
              </div>

              <div>
                <span>Cable route</span>
                <strong>
                  {layout.cableRoute ||
                    'To be confirmed'}
                </strong>
              </div>

              <div>
                <span>Earthing location</span>
                <strong>
                  {layout.earthingLocation ||
                    'To be confirmed'}
                </strong>
              </div>
            </div>
          ) : null}

          <div className="layout-box">
            <span>Layout notes</span>

            <p>
              {layout.layoutNotes ||
                'The installer has not yet added layout notes for this proposal.'}
            </p>
          </div>

          <div className="note">
            This page is not a construction drawing. Do not begin
            installation based only on this indicative layout.
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
            <h2>
              Customer responsibilities &amp; documentation
            </h2>
          </div>

          <span className="page-number">
            Page 12 of {totalPages}
          </span>
        </header>

        <div className="content">
          <h3>Customer responsibilities</h3>

          {responsibilities.length > 0 ? (
            <ul className="list">
              {responsibilities.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              Customer responsibilities have not yet been added to
              this proposal.
            </p>
          )}

          <h3>Documents typically required</h3>

          {documents.length > 0 ? (
            <ul className="list">
              {documents.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              Required documents have not yet been added to this
              proposal.
            </p>
          )}

          <div className="note">
            Document requirements vary by state, DISCOM, consumer
            category and scheme. Confirm the exact checklist with
            the relevant DISCOM before collection. Do not collect
            or retain sensitive identity documents unless required
            and permitted for the specific process.
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
          font-size: 23px;
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

        .site-grid,
        .layout-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .site-grid > div,
        .layout-grid > div {
          min-width: 0;
          padding: 11px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .site-grid span,
        .layout-grid span {
          display: block;
          margin-bottom: 3px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .site-grid strong,
        .layout-grid strong {
          color: #0f172a;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .layout-box {
          margin-top: 16px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
        }

        .layout-box span {
          display: block;
          margin-bottom: 6px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .layout-box p {
          margin: 0;
          color: #334155;
          font-size: 12px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
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
