'use client';

function formatDate(value, dateOnly = false) {
  if (!value) return 'Not specified';

  const date = new Date(
    dateOnly ? `${value}T00:00:00` : value
  );

  if (Number.isNaN(date.getTime())) return 'Not specified';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function statusLabel(value) {
  if (!value) return 'Not specified';

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function capacityLabel(value) {
  if (value === null || value === undefined || value === '') {
    return 'Capacity to be confirmed';
  }

  const capacity = Number(value);

  return Number.isFinite(capacity) && capacity > 0
    ? `${capacity} kWp proposed capacity`
    : 'Capacity to be confirmed';
}

function PageFooter({ proposalDate, pageNumber, totalPages }) {
  return (
    <div className="proposal-page-footer">
      <span>{proposalDate}</span>

      <span>hello@solarhues.com</span>

      <span>
        Page {pageNumber} of {totalPages}
      </span>

      <style jsx>{`
        .proposal-page-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px 16px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid #dbe3e9;
          color: #64748b;
          font-family: Arial, sans-serif;
          font-size: 9px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

export default function ProposalOpeningPages({
  company,
  proposal,
  lead,
  partnerProfile = {},
  solarHuesAbout = '',
  totalPages = 2,
}) {
  if (!company || !proposal || !lead) {
    return null;
  }

  const partnerName =
    company.company_name || 'Installer company';

  const proposalDate = formatDate(proposal.created_at);

  const siteLocation = [
    lead.locality,
    lead.city,
    lead.state,
    lead.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const partnerAbout =
    typeof partnerProfile.about === 'string'
      ? partnerProfile.about.trim()
      : '';

  const aboutSolarHues =
    typeof solarHuesAbout === 'string'
      ? solarHuesAbout.trim()
      : '';

  const partnerContact = [
    partnerProfile.contactName,
    partnerProfile.phone,
    partnerProfile.email,
    partnerProfile.address,
  ]
    .filter(Boolean)
    .join('\n');

  const partnerLogoUrl = partnerProfile.logoUrl || '';

  return (
    <div className="opening-pages">
      {/* PAGE 1 — COVER */}
      <section
        className="proposal-sheet cover-sheet"
        aria-label="Proposal cover"
      >
        <div className="cover-top">
          <div className="solarhues-brand">
            <div className="brand-symbol" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div>
              <p className="brand-name">SolarHues</p>
              <p className="brand-domain">solarhues.com</p>
            </div>
          </div>

          <span className="document-status">
            {statusLabel(proposal.status)}
          </span>
        </div>

        <div className="cover-main">
          <p className="eyebrow">Your solar proposal</p>

          <h1>
            A solar solution,
            <br />
            designed for you.
          </h1>

          <p className="cover-introduction">
            Proposed system, equipment, services and commercial
            details for your property.
          </p>

          <div className="capacity-label">
            <span className="capacity-dot" />
            {capacityLabel(proposal.system_capacity_kwp)}
          </div>
        </div>

        <div className="cover-art" aria-hidden="true">
          <div className="sun" />

          <div className="solar-array">
            {Array.from({ length: 12 }, (_, index) => (
              <span className="solar-cell" key={index} />
            ))}
          </div>

          <div className="array-shadow" />

          <p>Designed around your energy requirements</p>
        </div>

        <div className="customer-block">
          <div>
            <p className="small-label">Prepared for</p>
            <h2>{lead.customer_name || 'Customer'}</h2>
            <p className="location">
              {siteLocation || 'Site location to be confirmed'}
            </p>
          </div>

          <div className="reference-block">
            <p className="small-label">Proposal reference</p>
            <p className="reference-number">
              {proposal.proposal_number || 'Not specified'}
            </p>

            <p className="validity">
              Valid until:{' '}
              {formatDate(proposal.valid_until, true)}
            </p>
          </div>
        </div>

        <div className="partner-band">
          <div>
            <p className="small-label">Prepared by</p>
            <p className="partner-name">{partnerName}</p>
          </div>

          {partnerLogoUrl && (
            <img
              className="partner-logo"
              src={partnerLogoUrl}
              alt={`${partnerName} logo`}
              loading="eager"
            />
          )}
        </div>

        <PageFooter
          proposalDate={proposalDate}
          pageNumber={1}
          totalPages={totalPages}
        />
      </section>

      {/* PAGE 2 — ABOUT */}
      <section
        className="proposal-sheet about-sheet"
        aria-label="About SolarHues and the installer"
      >
        <div className="page-heading">
          <div>
            <p className="eyebrow">The people behind your proposal</p>
            <h2>About us</h2>
          </div>

          <span className="small-brand">SolarHues</span>
        </div>

        <div className="about-section">
          <div className="section-index">01</div>

          <div className="about-content">
            <p className="section-kicker">The platform</p>
            <h3>About SolarHues</h3>

            {aboutSolarHues ? (
              <p className="description">{aboutSolarHues}</p>
            ) : (
              <p className="description placeholder">
                Approved SolarHues company description has not yet
                been provided.
              </p>
            )}

            <div className="platform-details">
              <div>
                <span>Website</span>
                <strong>solarhues.com</strong>
              </div>

              <div>
                <span>Contact</span>
                <strong>hello@solarhues.com</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        <div className="about-section">
          <div className="section-index">02</div>

          <div className="about-content">
            <p className="section-kicker">Your installation partner</p>

            <div className="partner-heading">
              <h3>{partnerName}</h3>

              {partnerLogoUrl && (
                <img
                  className="about-partner-logo"
                  src={partnerLogoUrl}
                  alt={`${partnerName} logo`}
                  loading="eager"
                />
              )}
            </div>

            {partnerAbout ? (
              <p className="description">{partnerAbout}</p>
            ) : (
              <p className="description placeholder">
                Partner company description has not yet been
                provided.
              </p>
            )}

            {partnerContact ? (
              <div className="partner-contact">
                <p className="small-label">Partner contact</p>
                <p>{partnerContact}</p>
              </div>
            ) : (
              <p className="contact-placeholder">
                Partner contact details to be confirmed.
              </p>
            )}
          </div>
        </div>

        <div className="responsibility-note">
          <p className="small-label">Proposal responsibility</p>
          <p>
            This proposal is prepared by {partnerName} using
            SolarHues. The scope, equipment, pricing, warranties and
            services offered are those expressly stated in this
            proposal. Platform branding alone does not establish
            installer authorisation or certification.
          </p>
        </div>

        <PageFooter
          proposalDate={proposalDate}
          pageNumber={2}
          totalPages={totalPages}
        />
      </section>

      <style jsx>{`
        .opening-pages {
          color: #172033;
          font-family: Arial, sans-serif;
        }

        .proposal-sheet {
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
          line-height: 1.6;
        }

        .cover-top,
        .solarhues-brand,
        .page-heading,
        .partner-band,
        .partner-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .solarhues-brand {
          justify-content: flex-start;
          gap: 12px;
        }

        .brand-symbol {
          display: grid;
          grid-template-columns: repeat(2, 12px);
          gap: 3px;
          transform: rotate(-8deg);
        }

        .brand-symbol span {
          display: block;
          width: 12px;
          height: 12px;
          border: 1px solid #065f46;
          background: #d1fae5;
        }

        .brand-symbol span:last-child {
          border-color: #ca8a04;
          background: #facc15;
        }

        .brand-name {
          margin: 0;
          color: #065f46;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.2;
        }

        .brand-domain {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 10px;
          letter-spacing: 0.04em;
        }

        .document-status {
          padding: 4px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          color: #475569;
          font-size: 10px;
        }

        .cover-main {
          margin-top: 46px;
        }

        .eyebrow {
          margin: 0 0 12px;
          color: #047857;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          color: #172033;
          font-size: 43px;
          line-height: 1.12;
          letter-spacing: -0.045em;
          font-weight: 800;
        }

        .cover-introduction {
          max-width: 380px;
          margin: 20px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.8;
        }

        .capacity-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 7px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          color: #334155;
          font-size: 11px;
        }

        .capacity-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #059669;
        }

        .cover-art {
          position: relative;
          height: 210px;
          margin-top: 24px;
          overflow: hidden;
          border-radius: 14px;
          background: #f5f8f7;
        }

        .sun {
          position: absolute;
          top: 22px;
          right: 70px;
          width: 67px;
          height: 67px;
          border: 1px solid #eab308;
          border-radius: 50%;
          background: #fef3c7;
        }

        .solar-array {
          position: absolute;
          z-index: 2;
          top: 60px;
          left: 85px;
          display: grid;
          grid-template-columns: repeat(4, 63px);
          grid-template-rows: repeat(3, 28px);
          gap: 5px;
          padding: 7px;
          border: 2px solid #64748b;
          background: #e2e8f0;
          transform: skewX(-19deg) rotate(-7deg);
        }

        .solar-cell {
          display: block;
          border: 1px solid #64748b;
          background: #1e293b;
        }

        .array-shadow {
          position: absolute;
          top: 159px;
          left: 85px;
          width: 310px;
          height: 10px;
          border-radius: 50%;
          background: #dbe5e0;
        }

        .cover-art p {
          position: absolute;
          right: 18px;
          bottom: 8px;
          margin: 0;
          color: #64748b;
          font-size: 9px;
        }

        .customer-block {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 24px;
          margin-top: 28px;
        }

        .small-label {
          margin: 0 0 6px;
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .customer-block h2 {
          margin: 0;
          color: #172033;
          font-size: 19px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .location {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .reference-block {
          text-align: right;
        }

        .reference-number {
          margin: 0;
          color: #172033;
          font-size: 12px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .validity {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 10px;
        }

        .partner-band {
          margin: 25px 0 22px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
        }

        .partner-name {
          margin: 0;
          color: #172033;
          font-size: 16px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .partner-logo {
          max-width: 115px;
          max-height: 48px;
          object-fit: contain;
        }

        .page-heading {
          align-items: flex-start;
          padding-bottom: 24px;
          border-bottom: 2px solid #eab308;
        }

        .page-heading h2 {
          margin: 0;
          color: #172033;
          font-size: 34px;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }

        .small-brand {
          color: #065f46;
          font-size: 18px;
          font-weight: 800;
        }

        .about-section {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 18px;
          margin-top: 32px;
        }

        .section-index {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid #cbd5e1;
          border-radius: 50%;
          color: #047857;
          font-size: 10px;
          font-weight: 700;
        }

        .about-content {
          min-width: 0;
        }

        .section-kicker {
          margin: 0 0 6px;
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .about-content h3 {
          margin: 0;
          color: #172033;
          font-size: 22px;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .description {
          margin: 15px 0 0;
          color: #475569;
          font-size: 12px;
          line-height: 1.85;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .placeholder {
          color: #64748b;
          font-style: italic;
        }

        .platform-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 22px;
        }

        .platform-details span {
          display: block;
          margin-bottom: 5px;
          color: #64748b;
          font-size: 9px;
          text-transform: uppercase;
        }

        .platform-details strong {
          color: #334155;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .section-divider {
          height: 1px;
          margin-top: 30px;
          background: #e2e8f0;
        }

        .partner-heading {
          align-items: flex-start;
        }

        .about-partner-logo {
          max-width: 95px;
          max-height: 40px;
          object-fit: contain;
        }

        .partner-contact {
          margin-top: 20px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }

        .partner-contact > p:last-child {
          margin: 0;
          color: #475569;
          font-size: 11px;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .contact-placeholder {
          color: #64748b;
          font-size: 10px;
          margin-top: 20px;
        }

        .responsibility-note {
          margin: 28px 0 24px;
          padding: 14px;
          border-left: 3px solid #eab308;
          background: #f8fafc;
        }

        .responsibility-note > p:last-child {
          margin: 0;
          color: #64748b;
          font-size: 9px;
          line-height: 1.7;
        }

        @media screen and (max-width: 850px) {
          .proposal-sheet {
            width: 100%;
            min-height: auto;
            padding: 28px;
          }

          .cover-main {
            margin-top: 30px;
          }

          h1 {
            font-size: 36px;
          }

          .proposal-sheet :global(.proposal-page-footer) {
            margin-top: 26px;
          }
        }

        @media screen and (max-width: 520px) {
          .customer-block,
          .platform-details {
            grid-template-columns: 1fr;
          }

          .reference-block {
            text-align: left;
          }

          .solar-array {
            left: 35px;
            grid-template-columns: repeat(4, 42px);
          }

          .array-shadow {
            left: 35px;
            width: 220px;
          }

          .sun {
            right: 30px;
          }

          .about-section {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .page-heading {
            flex-wrap: wrap;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          .proposal-sheet {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 18mm;
            box-shadow: none;
            break-inside: avoid;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .cover-sheet {
            break-after: page;
            page-break-after: always;
          }

          .about-section,
          .partner-band,
          .customer-block,
          .responsibility-note {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .opening-pages {
            background: #fff;
          }
        }
      `}</style>
    </div>
  );
}
