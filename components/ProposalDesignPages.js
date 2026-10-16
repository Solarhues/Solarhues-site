'use client';

const PAGE_CLASS = 'proposal-page';

function formatCapacity(value) {
  if (value == null || value === '') return 'To be confirmed';

  return `${value} kWp`;
}

function formatCurrency(value) {
  if (value == null || value === '') return 'To be confirmed';

  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function formatList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export default function ProposalDesignPages({
  company,
  proposal,
  lead,
  systemDesign,
  scopeItems,
  equipmentItems,
  totalPages,
}) {
  const partnerName =
    company?.company_name || 'SolarHues Partner';

  const customerName =
    lead?.customer_name || 'Customer';

  const design = systemDesign || {};

  const scope = formatList(scopeItems);

  const equipment = Array.isArray(equipmentItems)
    ? equipmentItems
    : [];

  const hasEquipment = equipment.length > 0;

  return (
    <>
      <section className={PAGE_CLASS}>
        <header className="page-header">
          <div>
            <span className="brand">SolarHues</span>
            <h2>System design &amp; scope of work</h2>
          </div>

          <span className="page-number">
            Page 5 of {totalPages}
          </span>
        </header>

        <div className="content">
          <div className="summary-grid">
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
              <span>Proposed capacity</span>
              <strong>
                {formatCapacity(
                  proposal?.system_capacity_kwp
                )}
              </strong>
            </div>

            <div>
              <span>Roof type</span>
              <strong>
                {design.roofType || 'To be confirmed'}
              </strong>
            </div>
          </div>

          <h3>Proposed system configuration</h3>

          <div className="design-grid">
            <div>
              <span>Mounting structure</span>
              <strong>
                {design.mountingStructure ||
                  'To be confirmed'}
              </strong>
            </div>

            <div>
              <span>Array configuration</span>
              <strong>
                {design.arrayConfiguration ||
                  'To be confirmed'}
              </strong>
            </div>

            <div>
              <span>Estimated monthly generation</span>
              <strong>
                {design.monthlyGeneration
                  ? `${design.monthlyGeneration} units`
                  : 'To be confirmed'}
              </strong>
            </div>

            <div>
              <span>Estimated annual generation</span>
              <strong>
                {design.annualGeneration
                  ? `${design.annualGeneration} units`
                  : 'To be confirmed'}
              </strong>
            </div>
          </div>

          <h3>Scope of work</h3>

          {scope.length > 0 ? (
            <ul className="scope-list">
              {scope.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              The installer has not yet confirmed the detailed
              scope of work for this proposal.
            </p>
          )}

          <div className="note">
            Final system design, generation estimates and scope
            are subject to site survey, structural assessment,
            DISCOM requirements and applicable regulations.
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
            <h2>Equipment &amp; bill of materials</h2>
          </div>

          <span className="page-number">
            Page 6 of {totalPages}
          </span>
        </header>

        <div className="content">
          <p className="intro">
            The equipment below reflects the installer’s
            proposed bill of materials. Final brands, models and
            quantities must be confirmed in the signed agreement.
          </p>

          {hasEquipment ? (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Specification / model</th>
                  <th>Quantity</th>
                </tr>
              </thead>

              <tbody>
                {equipment.map((item, index) => (
                  <tr key={`${item.name || 'item'}-${index}`}>
                    <td>{item.name || 'Item'}</td>
                    <td>
                      {item.specification ||
                        item.model ||
                        'To be confirmed'}
                    </td>
                    <td>
                      {item.quantity || 'To be confirmed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">
              The installer has not yet added the equipment
              list for this proposal.
            </p>
          )}

          <div className="note">
            Equipment eligibility, warranties, certifications and
            subsidy compliance must be verified before order
            confirmation. This page does not itself confirm
            equipment availability or pricing.
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
          padding-top: 18px;
        }

        h3 {
          margin: 22px 0 10px;
          color: #0f172a;
          font-size: 15px;
        }

        .intro {
          margin: 0 0 16px;
          color: #475569;
          font-size: 12px;
        }

        .summary-grid,
        .design-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 8px;
        }

        .summary-grid > div,
        .design-grid > div {
          min-width: 0;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .summary-grid span,
        .design-grid span {
          display: block;
          margin-bottom: 3px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .summary-grid strong,
        .design-grid strong {
          color: #0f172a;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .scope-list {
          margin: 0;
          padding-left: 18px;
          color: #334155;
          font-size: 12px;
        }

        .scope-list li {
          margin-bottom: 7px;
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

        .empty {
          padding: 14px;
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
