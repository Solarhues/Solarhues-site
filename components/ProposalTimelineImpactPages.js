'use client';

const PAGE_CLASS = 'proposal-page';

function formatNumber(value, suffix = '') {
  if (value == null || value === '') {
    return 'To be confirmed';
  }

  return `${Number(value).toLocaleString('en-IN')}${suffix}`;
}

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

export default function ProposalTimelineImpactPages({
  company,
  proposal,
  lead,
  timelineItems,
  environmental,
  savings,
  totalPages,
}) {
  const partnerName =
    company?.company_name || 'SolarHues Partner';

  const customerName =
    lead?.customer_name || 'Customer';

  const milestones = Array.isArray(timelineItems)
    ? timelineItems
    : [];

  const impact = environmental || {};

  const benefit = savings || {};

  const hasMilestones = milestones.length > 0;

  return (
    <>
      <section className={PAGE_CLASS}>
        <header className="page-header">
          <div>
            <span className="brand">SolarHues</span>
            <h2>Project timeline &amp; milestones</h2>
          </div>

          <span className="page-number">
            Page 9 of {totalPages}
          </span>
        </header>

        <div className="content">
          <p className="intro">
            The schedule below is indicative. Actual dates depend
            on agreement signing, site readiness, equipment
            availability, DISCOM approvals and site conditions.
          </p>

          {hasMilestones ? (
            <ol className="timeline">
              {milestones.map((milestone, index) => (
                <li
                  key={`${milestone.stage || 'milestone'}-${index}`}
                >
                  <div className="timeline-card">
                    <div className="timeline-top">
                      <strong>
                        {milestone.stage ||
                          `Milestone ${index + 1}`}
                      </strong>

                      <span>
                        {milestone.duration ||
                          'Duration to be confirmed'}
                      </span>
                    </div>

                    <p>
                      {milestone.details ||
                        'Details to be confirmed.'}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty">
              The installer has not yet added a project timeline.
            </p>
          )}

          <div className="note">
            This timeline does not create a delivery guarantee.
            Final milestones and responsibilities must be recorded
            in the signed agreement.
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
            <h2>Environmental impact &amp; savings</h2>
          </div>

          <span className="page-number">
            Page 10 of {totalPages}
          </span>
        </header>

        <div className="content">
          <p className="intro">
            These are estimates based on the information entered
            for this proposal. They are not guarantees of
            generation, savings or environmental outcomes.
          </p>

          <div className="impact-grid">
            <div>
              <span>Estimated annual CO2 avoided</span>
              <strong>
                {formatNumber(
                  impact.co2SavedKg,
                  ' kg'
                )}
              </strong>
            </div>

            <div>
              <span>Equivalent trees per year</span>
              <strong>
                {formatNumber(
                  impact.treeEquivalent
                )}
              </strong>
            </div>

            <div>
              <span>Estimated annual bill savings</span>
              <strong>
                {formatCurrency(
                  benefit.annualSavings
                )}
              </strong>
            </div>

            <div>
              <span>Estimated payback period</span>
              <strong>
                {benefit.paybackYears
                  ? `${benefit.paybackYears} years`
                  : 'To be confirmed'}
              </strong>
            </div>
          </div>

          <h3>How these estimates are calculated</h3>

          <ul className="list">
            <li>
              Generation depends on system capacity, location,
              orientation, shading, weather and equipment
              performance.
            </li>

            <li>
              Bill savings depend on actual consumption, tariff
              structure, export arrangements and future electricity
              rates.
            </li>

            <li>
              Environmental equivalents are indicative and use
              standard conversion assumptions.
            </li>

            <li>
              Subsidy eligibility and disbursal depend on the
              applicable scheme, documentation and DISCOM process.
            </li>
          </ul>

          <div className="note">
            Do not present these figures as assured returns. Review
            all assumptions before sharing this proposal with a
            customer.
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

        .timeline {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .timeline li {
          position: relative;
          padding-left: 22px;
          margin-bottom: 12px;
        }

        .timeline li::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 7px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #facc15;
        }

        .timeline li::after {
          content: '';
          position: absolute;
          left: 8.5px;
          top: 18px;
          bottom: -12px;
          width: 1px;
          background: #e2e8f0;
        }

        .timeline li:last-child::after {
          display: none;
        }

        .timeline-card {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .timeline-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
        }

        .timeline-top strong {
          color: #0f172a;
          font-size: 12px;
        }

        .timeline-top span {
          flex: 0 0 auto;
          color: #64748b;
          font-size: 10px;
          font-weight: 600;
        }

        .timeline-card p {
          margin: 0;
          color: #475569;
          font-size: 11px;
          line-height: 1.55;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .impact-grid > div {
          min-width: 0;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .impact-grid span {
          display: block;
          margin-bottom: 4px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .impact-grid strong {
          color: #0f172a;
          font-size: 14px;
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
