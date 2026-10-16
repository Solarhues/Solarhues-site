'use client';

const SERVICES = [
  {
    key: 'approvals',
    number: '01',
    title: 'Permissions & approvals',
    description:
      'Support for applicable documentation and approval requirements.',
    symbol: 'document',
  },
  {
    key: 'siteAudit',
    number: '02',
    title: 'Site audit',
    description:
      'Review of the proposed site and installation requirements.',
    symbol: 'search',
  },
  {
    key: 'design',
    number: '03',
    title: 'System design',
    description:
      'A proposed configuration based on the agreed site requirements.',
    symbol: 'grid',
  },
  {
    key: 'agreement',
    number: '04',
    title: 'Agreement & documentation',
    description:
      'A defined scope, commercial offer and project responsibilities.',
    symbol: 'document',
  },
  {
    key: 'finance',
    number: '05',
    title: 'Financial assistance',
    description:
      'Assistance options, where offered and separately confirmed.',
    symbol: 'finance',
  },
  {
    key: 'quality',
    number: '06',
    title: 'Product quality',
    description:
      'Equipment specifications recorded in the proposed solution.',
    symbol: 'check',
  },
  {
    key: 'safety',
    number: '07',
    title: 'Safety & insurance',
    description:
      'Applicable safety scope and any insurance coverage stated separately.',
    symbol: 'shield',
  },
  {
    key: 'maintenance',
    number: '08',
    title: 'Annual maintenance',
    description:
      'Maintenance coverage where selected and expressly included.',
    symbol: 'tools',
  },
  {
    key: 'commissioning',
    number: '09',
    title: 'Plant commissioning',
    description:
      'Commissioning and handover activities within the agreed scope.',
    symbol: 'power',
  },
];

const BENEFITS = [
  {
    title: 'End-to-end solutions',
    description: 'A connected approach across the agreed project scope.',
  },
  {
    title: 'One-stop energy destination',
    description: 'A single place to discuss your energy requirements.',
  },
  {
    title: 'Expert-managed process',
    description: 'Defined coordination and responsibilities.',
  },
  {
    title: 'Custom design',
    description: 'A solution proposed around your site requirements.',
  },
  {
    title: 'Premium products',
    description: 'Selected equipment identified by specification.',
  },
  {
    title: 'Quality workmanship',
    description: 'Installation requirements documented in the scope.',
  },
];

const VALID_STATUSES = [
  'Included',
  'Optional',
  'Not included',
  'Not specified',
];

function formatDate(value) {
  if (!value) return 'Not specified';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not specified';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ServiceIcon({ type }) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === 'document' && (
        <>
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M14 3v5h4M9 12h6M9 16h6" />
        </>
      )}

      {type === 'search' && (
        <>
          <circle cx="10" cy="10" r="6" />
          <path d="m15 15 6 6M7 10h6M10 7v6" />
        </>
      )}

      {type === 'grid' && (
        <>
          <rect x="3" y="4" width="18" height="15" rx="1" />
          <path d="M9 4v15M15 4v15M3 9h18M3 14h18" />
        </>
      )}

      {type === 'finance' && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 9h18M7 14h3M15 14h2" />
        </>
      )}

      {type === 'check' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </>
      )}

      {type === 'shield' && (
        <>
          <path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6z" />
          <path d="m8 12 3 3 5-6" />
        </>
      )}

      {type === 'tools' && (
        <>
          <path d="M14 5a5 5 0 0 0-6 6L3 16a3 3 0 0 0 5 5l5-5a5 5 0 0 0 6-6l-4 4-4-4 4-4z" />
        </>
      )}

      {type === 'power' && (
        <>
          <path d="M12 2v9" />
          <path d="M7 5a9 9 0 1 0 10 0" />
        </>
      )}
    </svg>
  );
}

function ProductGraphic({ type }) {
  return (
    <svg
      viewBox="0 0 180 90"
      width="180"
      height="90"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === 'modules' && (
        <>
          <path d="M35 15h105l-13 55H22z" />
          <path d="M70 15 57 70M105 15 92 70M30 33h105M26 51h105" />
          <path d="M57 70v8M108 70v8M45 79h76" />
          <circle cx="155" cy="18" r="9" />
        </>
      )}

      {type === 'inverters' && (
        <>
          <rect x="60" y="10" width="60" height="65" rx="6" />
          <rect x="72" y="23" width="36" height="18" rx="2" />
          <path d="M75 52h30M75 59h30M75 66h30M78 75v8M102 75v8" />
          <path d="m91 25-7 9h8l-3 6" />
        </>
      )}

      {type === 'structures' && (
        <>
          <path d="m30 48 105-27 20 18L50 66z" />
          <path d="M47 62v17M137 43v36M28 80h127" />
          <path d="m47 75 90-28M47 62l90 32" />
          <path d="m65 39 20 18M100 30l20 18" />
        </>
      )}
    </svg>
  );
}

function Footer({ proposalDate, pageNumber, totalPages }) {
  return (
    <footer className="page-footer">
      <span>{proposalDate}</span>
      <span>hello@solarhues.com</span>
      <span>
        Page {pageNumber} of {totalPages}
      </span>

      <style jsx>{`
        .page-footer {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px 16px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid #dbe3e9;
          color: #64748b;
          font-size: 9px;
          line-height: 1.5;
        }
      `}</style>
    </footer>
  );
}

export default function ProposalCapabilitiesPages({
  company,
  proposal,
  serviceCoverage = {},
  productRange = {},
  totalPages = 4,
}) {
  if (!company || !proposal) return null;

  const proposalDate = formatDate(proposal.created_at);

  const productGroups = [
    {
      key: 'modules',
      title: 'Solar modules',
      subtitle: 'Panel technologies and specifications',
      entries: productRange.modules || [],
      note:
        'The selected module make, model, rated power and quantity ' +
        'will be stated in the proposed solution and component schedule.',
    },
    {
      key: 'inverters',
      title: 'Solar inverters',
      subtitle: 'Inverter types and configurations',
      entries: productRange.inverters || [],
      note:
        'The selected inverter type, make, model, rated capacity ' +
        'and quantity will be stated in the proposed solution.',
    },
    {
      key: 'structures',
      title: 'Mounting structures',
      subtitle: 'Mounting arrangements for the proposed site',
      entries: productRange.structures || [],
      note:
        'The selected structure will be identified in the proposal, ' +
        'subject to the agreed site assessment and design.',
    },
  ];

  return (
    <div className="capabilities-pages">
      {/* PAGE 3 */}
      <section
        className="sheet page-three"
        aria-label="Why choose us"
      >
        <header className="page-header">
          <div>
            <p className="eyebrow">A connected solar journey</p>
            <h2>Why choose us</h2>
          </div>

          <span className="brand">SolarHues</span>
        </header>

        <p className="introduction">
          A structured approach to your solar project, with
          responsibilities and service coverage defined in the
          proposal prepared by {company.company_name}.
        </p>

        <div className="service-grid">
          {SERVICES.map((service) => {
            const suppliedStatus = serviceCoverage[service.key];

            const status = VALID_STATUSES.includes(suppliedStatus)
              ? suppliedStatus
              : 'Not specified';

            const statusClass =
              status === 'Included'
                ? 'included'
                : status === 'Optional'
                  ? 'optional'
                  : 'neutral';

            return (
              <article className="service-card" key={service.key}>
                <div className="service-top">
                  <span className="icon-box">
                    <ServiceIcon type={service.symbol} />
                  </span>

                  <span className="service-number">
                    {service.number}
                  </span>
                </div>

                <h3>{service.title}</h3>
                <p>{service.description}</p>

                <span className={`coverage ${statusClass}`}>
                  {status}
                </span>
              </article>
            );
          })}
        </div>

        <div className="benefit-heading">
          <h3>Our approach</h3>
          <span>Simple. Coordinated. Clearly defined.</span>
        </div>

        <div className="benefit-grid">
          {BENEFITS.map((benefit) => (
            <div className="benefit" key={benefit.title}>
              <span className="benefit-dot" />
              <div>
                <h4>{benefit.title}</h4>
                <p>{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="disclaimer">
          Service availability is proposal-specific. Optional or
          unspecified services are not included unless expressly
          agreed. Financing, insurance and approvals are subject
          to their applicable terms and requirements.
        </p>

        <Footer
          proposalDate={proposalDate}
          pageNumber={3}
          totalPages={totalPages}
        />
      </section>

      {/* PAGE 4 */}
      <section
        className="sheet page-four"
        aria-label="Product range"
      >
        <header className="page-header">
          <div>
            <p className="eyebrow">Equipment and installation options</p>
            <h2>Our product range</h2>
          </div>

          <span className="brand">SolarHues</span>
        </header>

        <p className="introduction">
          An overview of the product categories offered by{' '}
          {company.company_name}. This range is not a list of
          equipment included in your quotation.
        </p>

        <div className="product-list">
          {productGroups.map((group, index) => (
            <article className="product-block" key={group.key}>
              <div className="product-visual">
                <ProductGraphic type={group.key} />

                <span className="category-number">
                  0{index + 1}
                </span>
              </div>

              <div className="product-content">
                <p className="category-label">{group.subtitle}</p>
                <h3>{group.title}</h3>

                {group.entries.length > 0 ? (
                  <ul className="product-options">
                    {group.entries.map((entry, entryIndex) => (
                      <li key={`${group.key}-${entryIndex}`}>
                        {entry}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="unspecified">
                    Available options have not yet been specified
                    for this partner.
                  </p>
                )}

                <p className="product-note">{group.note}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="selection-note">
          <h3>Range versus selected equipment</h3>
          <p>
            Only the equipment, quantities and services expressly
            listed in this proposal form part of the offered
            solution. Product-range illustrations are schematic
            and do not represent a specific make or model.
          </p>
        </div>

        <Footer
          proposalDate={proposalDate}
          pageNumber={4}
          totalPages={totalPages}
        />
      </section>

      <style jsx>{`
        .capabilities-pages {
          color: #172033;
          font-family: Arial, sans-serif;
        }

        .sheet {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          width: 210mm;
          min-height: 297mm;
          margin: 24px auto;
          padding: 18mm;
          background: #fff;
          color: #172033;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
          font-size: 12px;
          line-height: 1.6;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eab308;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #047857;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        h2 {
          margin: 0;
          color: #172033;
          font-size: 32px;
          line-height: 1.2;
          letter-spacing: -0.035em;
        }

        .brand {
          color: #065f46;
          font-size: 18px;
          font-weight: 800;
          white-space: nowrap;
        }

        .introduction {
          margin: 20px 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.8;
        }

        .service-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .service-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
          padding: 13px;
          border: 1px solid #dbe3e9;
          border-radius: 8px;
        }

        .service-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 10px;
        }

        .icon-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 8px;
          background: #ecfdf5;
          color: #047857;
        }

        .service-number {
          color: #94a3b8;
          font-size: 9px;
        }

        .service-card h3 {
          margin: 0;
          color: #172033;
          font-size: 11px;
          line-height: 1.5;
        }

        .service-card p {
          margin: 7px 0 10px;
          color: #64748b;
          font-size: 9px;
          line-height: 1.7;
        }

        .coverage {
          display: inline-block;
          margin-top: auto;
          padding: 2px 7px;
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          font-size: 8px;
        }

        .included {
          border-color: #a7f3d0;
          background: #ecfdf5;
          color: #065f46;
        }

        .optional {
          border-color: #fde68a;
          background: #fffbeb;
          color: #92400e;
        }

        .neutral {
          background: #f8fafc;
          color: #64748b;
        }

        .benefit-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .benefit-heading h3 {
          margin: 0;
          font-size: 14px;
        }

        .benefit-heading > span {
          color: #64748b;
          font-size: 9px;
        }

        .benefit-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px 20px;
          margin-top: 16px;
        }

        .benefit {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .benefit-dot {
          flex: 0 0 auto;
          width: 6px;
          height: 6px;
          margin-top: 6px;
          border-radius: 50%;
          background: #eab308;
        }

        .benefit h4 {
          margin: 0;
          color: #172033;
          font-size: 10px;
        }

        .benefit p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 9px;
          line-height: 1.6;
        }

        .disclaimer {
          margin: 22px 0;
          color: #64748b;
          font-size: 9px;
          line-height: 1.7;
        }

        .product-list {
          display: grid;
          gap: 18px;
        }

        .product-block {
          display: grid;
          grid-template-columns: 145px minmax(0, 1fr);
          border: 1px solid #dbe3e9;
          border-radius: 10px;
          overflow: hidden;
        }

        .product-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 170px;
          padding: 12px;
          background: #f1f7f4;
          color: #047857;
        }

        .product-visual :global(svg) {
          width: 100%;
          max-width: 160px;
          height: auto;
        }

        .category-number {
          position: absolute;
          top: 12px;
          left: 14px;
          color: #64748b;
          font-size: 9px;
        }

        .product-content {
          min-width: 0;
          padding: 18px;
        }

        .category-label {
          margin: 0 0 5px;
          color: #64748b;
          font-size: 8px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .product-content h3 {
          margin: 0;
          color: #172033;
          font-size: 19px;
          line-height: 1.3;
        }

        .product-options {
          margin: 12px 0;
          padding-left: 16px;
          color: #334155;
          font-size: 10px;
          line-height: 1.8;
        }

        .unspecified {
          color: #64748b;
          font-size: 10px;
          font-style: italic;
        }

        .product-note {
          margin: 12px 0 0;
          color: #64748b;
          font-size: 9px;
          line-height: 1.7;
        }

        .selection-note {
          margin: 22px 0;
          padding: 14px;
          border-left: 3px solid #eab308;
          background: #f8fafc;
        }

        .selection-note h3 {
          margin: 0 0 5px;
          font-size: 11px;
        }

        .selection-note p {
          margin: 0;
          color: #64748b;
          font-size: 9px;
          line-height: 1.7;
        }

        @media screen and (max-width: 850px) {
          .sheet {
            width: 100%;
            min-height: auto;
            padding: 28px;
          }
        }

        @media screen and (max-width: 600px) {
          .service-grid,
          .benefit-grid {
            grid-template-columns: 1fr;
          }

          .product-block {
            grid-template-columns: 1fr;
          }

          .product-visual {
            min-height: 110px;
          }

          .page-header {
            flex-wrap: wrap;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          .sheet {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 18mm;
            box-shadow: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .page-three {
            break-before: page;
            page-break-before: always;
            break-after: page;
            page-break-after: always;
          }

          .service-card,
          .benefit,
          .product-block,
          .selection-note {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          h3,
          h4 {
            break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
