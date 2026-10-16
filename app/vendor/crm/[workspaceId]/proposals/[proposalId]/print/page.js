'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabase';
import { useAuth } from '../../../../../../providers';
import ProposalOpeningPages from '../../../../../../../components/ProposalOpeningPages';
import ProposalCapabilitiesPages from '../../../../../../../components/ProposalCapabilitiesPages';

const EMPTY_PROFILE = {
  contactName: '',
  phone: '',
  email: '',
  address: '',
  logoUrl: '',
  about: '',
};

const PROFILE_FIELDS = [
  ['contactName', 'Partner contact person', 'text'],
  ['phone', 'Partner phone number', 'tel'],
  ['email', 'Partner contact email', 'email'],
  ['logoUrl', 'Partner logo image URL — optional', 'url'],
];

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

  const [partnerProfile, setPartnerProfile] = useState({
    ...EMPTY_PROFILE,
  });

  const [solarHuesAbout, setSolarHuesAbout] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [printError, setPrintError] = useState('');

  useEffect(() => {
    let active = true;

    setRecord(null);
    setLoadedFor('');
    setError('');
    setPartnerProfile({ ...EMPTY_PROFILE });
    setSolarHuesAbout('');
    setReviewed(false);
    setPrintError('');

    if (loading || !userId || !workspaceId || !proposalId) {
      return () => {
        active = false;
      };
    }

    async function loadDocument() {
      try {
        const [
          companyResult,
          memberResult,
          profileResult,
        ] = await Promise.all([
          supabase
            .from('crm_workspaces')
            .select(`
              id,
              company_name,
              status,
              access_expires_at
            `)
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

        const accessQueryError =
          companyResult.error ||
          memberResult.error ||
          profileResult.error;

        if (accessQueryError) throw accessQueryError;

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
            'Workspace is unavailable, expired, suspended, or inaccessible.'
          );
        }

        const memberAllowed =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        if (!isAdmin && !memberAllowed) {
          throw new Error(
            'Only workspace owners, sales staff and SolarHues ' +
            'admins can prepare customer proposals on this page.'
          );
        }

        if (!active) return;

        const {
          data: proposal,
          error: proposalError,
        } = await supabase
          .from('crm_proposals')
          .select(`
            id,
            workspace_id,
            lead_id,
            proposal_number,
            status,
            system_capacity_kwp,
            valid_until,
            created_at
          `)
          .eq('id', proposalId)
          .eq('workspace_id', workspaceId)
          .maybeSingle();

        if (proposalError) {
          throw new Error(`Proposal: ${proposalError.message}`);
        }

        if (!proposal) {
          throw new Error(
            'Proposal not found in this workspace, or your ' +
            'account does not have permission to read it.'
          );
        }

        if (!active) return;

        const {
          data: lead,
          error: leadError,
        } = await supabase
          .from('crm_leads')
          .select(`
            id,
            customer_name,
            locality,
            city,
            state,
            pincode
          `)
          .eq('id', proposal.lead_id)
          .eq('workspace_id', workspaceId)
          .maybeSingle();

        if (leadError) {
          throw new Error(`Customer: ${leadError.message}`);
        }

        if (!lead) {
          throw new Error(
            'Customer details are unavailable. Review lead ' +
            'access before preparing this document.'
          );
        }

        if (!active) return;

        setRecord({
          company,
          proposal,
          lead,
        });
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Could not prepare this proposal.'
          );
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
      `${record.proposal.proposal_number || 'Solar Proposal'} ` +
      '- Cover and About';

    return () => {
      document.title = previousTitle;
    };
  }, [record, loadedFor, loadKey]);

  function updateProfile(field, value) {
    setReviewed(false);
    setPrintError('');

    setPartnerProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateSolarHuesAbout(value) {
    setReviewed(false);
    setPrintError('');
    setSolarHuesAbout(value);
  }

  function printDocument() {
    setPrintError('');

    if (!reviewed) {
      setPrintError('Review the document before printing.');
      return;
    }

    const images = Array.from(
      document.querySelectorAll(
        '#customer-proposal-document img'
      )
    );

    if (images.some((image) => !image.complete)) {
      setPrintError(
        'The partner logo is still loading. Wait and try again.'
      );
      return;
    }

    if (
      images.some(
        (image) => image.complete && image.naturalWidth === 0
      )
    ) {
      setPrintError(
        'The partner logo could not load. Check its image URL ' +
        'or remove it before printing.'
      );
      return;
    }

    window.print();
  }

  const missingRoute = !workspaceId || !proposalId;

  const waiting =
    loading ||
    Boolean(
      user &&
      !missingRoute &&
      loadedFor !== loadKey
    );

  const ready =
    !waiting &&
    user &&
    !missingRoute &&
    loadedFor === loadKey &&
    !error &&
    record;

  const rawLogoUrl = partnerProfile.logoUrl.trim();

  const logoUrlValid =
    !rawLogoUrl || /^https?:\/\//i.test(rawLogoUrl);

  const documentProfile = {
    ...partnerProfile,
    contactName: partnerProfile.contactName.trim(),
    phone: partnerProfile.phone.trim(),
    email: partnerProfile.email.trim(),
    address: partnerProfile.address.trim(),
    about: partnerProfile.about.trim(),
    logoUrl: logoUrlValid ? rawLogoUrl : '',
  };

  return (
    <div className="print-page">
      <div className="screen-only">
        <nav
          className="navigation"
          aria-label="Proposal preview navigation"
        >
          <Link href={`${base}/proposals/${proposalId}`}>
            ← Internal proposal
          </Link>

          <Link href={`${base}/proposals`}>
            All proposals
          </Link>
        </nav>

        <p className="eyebrow">SolarHues customer document</p>

        <h1>Proposal preview — pages 1 and 2</h1>

        <p className="intro">
          Cover page and company profiles. The remaining proposal
          pages will be added in the next steps.
        </p>

        {waiting && (
          <div className="panel" role="status">
            Preparing your proposal…
          </div>
        )}

        {!loading && !user && (
          <div className="panel">
            <h2>Sign in required</h2>
            <p>Use your installer account to prepare this document.</p>

            <Link href="/vendor-login">
              Installer login →
            </Link>
          </div>
        )}

        {!loading && user && missingRoute && (
          <div className="panel error" role="alert">
            Workspace or proposal ID is missing. Open the preview
            from an existing proposal.
          </div>
        )}

        {!waiting && user && error && (
          <div className="panel error" role="alert">
            <h2>Could not prepare proposal</h2>
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
          <>
            <div className="panel">
              <h2>Saved CRM information</h2>

              <div className="saved-grid">
                <div>
                  <span>Partner / company</span>
                  <strong>{record.company.company_name}</strong>
                </div>

                <div>
                  <span>Customer</span>
                  <strong>
                    {record.lead.customer_name || 'Not specified'}
                  </strong>
                </div>

                <div>
                  <span>Proposal number</span>
                  <strong>
                    {record.proposal.proposal_number ||
                      'Not specified'}
                  </strong>
                </div>

                <div>
                  <span>System capacity</span>
                  <strong>
                    {record.proposal.system_capacity_kwp == null
                      ? 'Not specified'
                      : `${record.proposal.system_capacity_kwp} kWp`}
                  </strong>
                </div>
              </div>

              <p className="hint">
                These values come from your saved CRM records.
                This screen does not edit them.
              </p>
            </div>

            <div className="panel">
              <h2>Page 2 — About SolarHues</h2>

              <p className="hint">
                Enter approved company wording. Do not add
                unverified installer, financing, insurance or
                performance claims.
              </p>

              <div className="field">
                <label htmlFor="solarhues-about">
                  SolarHues description
                </label>

                <textarea
                  id="solarhues-about"
                  rows={5}
                  maxLength={1000}
                  value={solarHuesAbout}
                  placeholder="Approved description of SolarHues"
                  onChange={(event) =>
                    updateSolarHuesAbout(event.target.value)
                  }
                />

                <span className="character-count">
                  {solarHuesAbout.length}/1000 characters
                </span>
              </div>
            </div>

            <div className="panel">
              <h2>Partner profile and branding</h2>

              <p className="hint">
                The partner name comes from the workspace.
                Add its description, optional logo, and contact
                details below.
              </p>

              <div className="editor-grid">
                {PROFILE_FIELDS.map(([field, title, type]) => (
                  <div className="field" key={field}>
                    <label htmlFor={`partner-${field}`}>
                      {title}
                    </label>

                    <input
                      id={`partner-${field}`}
                      type={type}
                      value={partnerProfile[field]}
                      maxLength={field === 'logoUrl' ? 2000 : 254}
                      placeholder={
                        field === 'logoUrl'
                          ? 'https://.../partner-logo.png'
                          : ''
                      }
                      onChange={(event) =>
                        updateProfile(field, event.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              {!logoUrlValid && (
                <p className="warning" role="alert">
                  Use a complete logo URL beginning with https://
                  or http://.
                </p>
              )}

              <p className="hint">
                Use a stable image URL for the logo. If no logo
                is supplied, the document shows the partner name
                without an empty logo box.
              </p>

              <div className="field spaced">
                <label htmlFor="partner-address">
                  Partner address
                </label>

                <textarea
                  id="partner-address"
                  rows={2}
                  maxLength={300}
                  value={partnerProfile.address}
                  onChange={(event) =>
                    updateProfile('address', event.target.value)
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="partner-about">
                  About {record.company.company_name}
                </label>

                <textarea
                  id="partner-about"
                  rows={5}
                  maxLength={1000}
                  value={partnerProfile.about}
                  placeholder="Partner background and services offered"
                  onChange={(event) =>
                    updateProfile('about', event.target.value)
                  }
                />

                <span className="character-count">
                  {partnerProfile.about.length}/1000 characters
                </span>
              </div>
            </div>

            <div className="panel">
              <h2>Review and print</h2>

              <p className="warning">
                The About text, logo URL and contact details entered
                here are temporary. They are not saved and will be
                lost when you refresh or leave this page.
              </p>

              <p className="hint">
                This preview contains only two opening pages, not
                the complete technical or commercial proposal.
                Do not send it as the full offer.
              </p>

              {record.proposal.status === 'draft' && (
                <p className="hint">
                  The proposal is a draft. Its Draft label remains
                  visible on the cover.
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

                <span>
                  I have reviewed the company descriptions,
                  branding and customer details.
                </span>
              </label>

              {printError && (
                <p className="warning" role="alert">
                  {printError}
                </p>
              )}

              <button
                type="button"
                disabled={!reviewed || !logoUrlValid}
                onClick={printDocument}
              >
                Print / Save pages 1 and 2 as PDF
              </button>

              <p className="hint">
                Choose A4 and Save as PDF. Set margins to None
                if your browser overrides the page settings.
                Disable browser headers and footers. Check that
                the preview contains two pages with no CRM controls.
              </p>
            </div>
          </>
        )}
      </div>

      {ready && (
        <div
          id="customer-proposal-document"
          className="document-wrapper"
        >
          {ready && (
  <div
    id="customer-proposal-document"
    className="document-wrapper"
  >
    <ProposalOpeningPages
      company={record.company}
      proposal={record.proposal}
      lead={record.lead}
      partnerProfile={documentProfile}
      solarHuesAbout={solarHuesAbout}
      totalPages={4}
    />

    <ProposalCapabilitiesPages
      company={record.company}
      proposal={record.proposal}
      serviceCoverage={{
        approvals: 'Not specified',
        siteAudit: 'Not specified',
        design: 'Not specified',
        agreement: 'Not specified',
        finance: 'Not specified',
        quality: 'Not specified',
        safety: 'Not specified',
        maintenance: 'Not specified',
        commissioning: 'Not specified',
      }}
      productRange={{
  modules: [
    'Confirmed module technology or product family',
    'Another confirmed module option',
  ],
  inverters: [
    'Confirmed inverter type or product family',
  ],
  structures: [
    'Flush mount',
    'Roof rail',
    'Short rail',
    'Elevated',
  ],
}}
      totalPages={4}
    />
  </div>
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
          font-family: Inter, -apple-system, BlinkMacSystemFont,
            'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
        }

        .screen-only {
          max-width: 1000px;
          margin: 0 auto;
        }

        .navigation {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 26px;
        }

        .print-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #6ee7b7;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0 0 10px;
          color: #f8fafc;
          font-size: 28px;
          line-height: 1.3;
        }

        h2 {
          margin: 0 0 14px;
          color: #f8fafc;
          font-size: 20px;
          line-height: 1.4;
        }

        .intro {
          margin: 0 0 24px;
          color: #cbd5e1;
          font-size: 14px;
        }

        .panel {
          margin: 20px 0;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: #0f172a;
        }

        .error {
          color: #fecaca;
          border-color: #b91c1c;
          overflow-wrap: anywhere;
        }

        .error h2 {
          color: #fecaca;
        }

        .hint {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .warning {
          color: #fde68a;
          font-size: 13px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .saved-grid,
        .editor-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .saved-grid > div {
          min-width: 0;
        }

        .saved-grid span {
          display: block;
          margin-bottom: 5px;
          color: #94a3b8;
          font-size: 12px;
        }

        .saved-grid strong {
          color: #f8fafc;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .field {
          display: grid;
          gap: 8px;
          min-width: 0;
        }

        .spaced {
          margin-top: 20px;
        }

        label {
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
        }

        input,
        textarea {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid #64748b;
          border-radius: 9px;
          background: #1e293b;
          color: #fff;
          font: inherit;
          font-size: 14px;
        }

        textarea {
          resize: vertical;
          line-height: 1.6;
        }

        input:focus,
        textarea:focus {
          outline: 2px solid #facc15;
          outline-offset: 2px;
        }

        .character-count {
          color: #94a3b8;
          font-size: 11px;
          text-align: right;
        }

        .review-check {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 22px 0;
          line-height: 1.6;
        }

        .review-check input {
          flex: 0 0 auto;
          width: 16px;
          height: 16px;
          margin-top: 3px;
          accent-color: #facc15;
        }

        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 18px;
          border: 0;
          border-radius: 9px;
          background: #facc15;
          color: #1e293b;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .document-wrapper {
          width: 100%;
          max-width: 210mm;
          margin: 32px auto 0;
          padding: 0;
          background: transparent;
        }

        @media screen and (max-width: 700px) {
          .print-page {
            padding: 24px 12px 48px;
          }

          .saved-grid,
          .editor-grid {
            grid-template-columns: 1fr;
          }

          .panel {
            padding: 18px;
          }

          h1 {
            font-size: 24px;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          :global(html),
          :global(body) {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          :global(body *) {
            visibility: hidden !important;
          }

          :global(#customer-proposal-document),
          :global(#customer-proposal-document *) {
            visibility: visible !important;
          }

          .screen-only {
            display: none !important;
          }

          .print-page {
            min-height: 0;
            margin: 0;
            padding: 0;
            background: #fff;
          }

          .document-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 210mm;
            max-width: none;
            margin: 0;
            padding: 0;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
