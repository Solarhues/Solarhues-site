'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabase';
import { useAuth } from '../../../../../../providers';
import ProposalOpeningPages from '../../../../../../../components/ProposalOpeningPages';
import ProposalCapabilitiesPages from '../../../../../../../components/ProposalCapabilitiesPages';
import ProposalDesignPages from '../../../../../../../components/ProposalDesignPages';

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

const SERVICE_FIELDS = [
  ['approvals', 'Permissions & approvals'],
  ['siteAudit', 'Site audit'],
  ['design', 'System design'],
  ['agreement', 'Agreement & documentation'],
  ['finance', 'Financial assistance'],
  ['quality', 'Product quality'],
  ['safety', 'Safety & insurance'],
  ['maintenance', 'Annual maintenance'],
  ['commissioning', 'Plant commissioning'],
];

const COVERAGE_OPTIONS = [
  'Not specified',
  'Included',
  'Optional',
  'Not included',
];

const EMPTY_COVERAGE = {
  approvals: 'Not specified',
  siteAudit: 'Not specified',
  design: 'Not specified',
  agreement: 'Not specified',
  finance: 'Not specified',
  quality: 'Not specified',
  safety: 'Not specified',
  maintenance: 'Not specified',
  commissioning: 'Not specified',
};

const EMPTY_PRODUCT_TEXT = {
  modules: '',
  inverters: '',
  structures: '',
};

const EMPTY_DESIGN = {
  roofType: '',
  mountingStructure: '',
  arrayConfiguration: '',
  monthlyGeneration: '',
  annualGeneration: '',
};

function linesToOptions(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseEquipment(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, specification, quantity] = line
        .split('|')
        .map((part) => part.trim());

      return {
        name,
        specification,
        quantity,
      };
    });
}

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

  const [serviceCoverage, setServiceCoverage] = useState({
    ...EMPTY_COVERAGE,
  });

  const [productText, setProductText] = useState({
    ...EMPTY_PRODUCT_TEXT,
  });

  const [systemDesign, setSystemDesign] = useState({
    ...EMPTY_DESIGN,
  });

  const [scopeText, setScopeText] = useState('');

  const [equipmentText, setEquipmentText] = useState('');

  const [reviewed, setReviewed] = useState(false);
  const [printError, setPrintError] = useState('');

  useEffect(() => {
    let active = true;

    setRecord(null);
    setLoadedFor('');
    setError('');

    setPartnerProfile({ ...EMPTY_PROFILE });
    setSolarHuesAbout('');
    setServiceCoverage({ ...EMPTY_COVERAGE });
    setProductText({ ...EMPTY_PRODUCT_TEXT });
    setSystemDesign({ ...EMPTY_DESIGN });
    setScopeText('');
    setEquipmentText('');

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
        if (active) {
          setLoadedFor(loadKey);
        }
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
      '- Pages 1 to 6';

    return () => {
      document.title = previousTitle;
    };
  }, [record, loadedFor, loadKey]);

  function clearReview() {
    setReviewed(false);
    setPrintError('');
  }

  function updateProfile(field, value) {
    clearReview();

    setPartnerProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateSolarHuesAbout(value) {
    clearReview();
    setSolarHuesAbout(value);
  }

  function updateCoverage(field, value) {
    clearReview();

    setServiceCoverage((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateProductText(field, value) {
    clearReview();

    setProductText((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateSystemDesign(field, value) {
    clearReview();

    setSystemDesign((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateScopeText(value) {
    clearReview();
    setScopeText(value);
  }

  function updateEquipmentText(value) {
    clearReview();
    setEquipmentText(value);
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
    contactName: partnerProfile.contactName.trim(),
    phone: partnerProfile.phone.trim(),
    email: partnerProfile.email.trim(),
    address: partnerProfile.address.trim(),
    about: partnerProfile.about.trim(),
    logoUrl: logoUrlValid ? rawLogoUrl : '',
  };

  const productRange = {
    modules: linesToOptions(productText.modules),
    inverters: linesToOptions(productText.inverters),
    structures: linesToOptions(productText.structures),
  };

  const scopeItems = linesToOptions(scopeText);

  const equipmentItems = parseEquipment(equipmentText);

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

        <h1>Proposal preview — pages 1 to 6</h1>

        <p className="intro">
          Cover, company profiles, service capabilities, product
          range, system design, scope of work and equipment list.
        </p>

        {waiting && (
          <div className="panel" role="status">
            Preparing your proposal…
          </div>
        )}

        {!loading && !user && (
          <div className="panel">
            <h2>Sign in required</h2>

            <p>
              Use your installer account to prepare this document.
            </p>

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
            <section className="panel">
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
            </section>

            <section className="panel">
              <h2>Page 2 — About SolarHues</h2>

              <p className="hint">
                Enter approved company wording. Do not add
                unverified authorisation, financing, insurance
                or performance claims.
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
            </section>

            <section className="panel">
              <h2>Partner profile and branding</h2>

              <p className="hint">
                The partner name comes from the workspace.
                Add the description, optional logo, and contact
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
                If no logo is supplied, the document shows the
                partner name without an empty logo box.
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
            </section>

            <section className="panel">
              <h2>Page 3 — Service coverage</h2>

              <p className="hint">
                Select the coverage actually offered in this
                proposal. A service is not included merely because
                it appears in the capabilities page.
              </p>

              <div className="editor-grid">
                {SERVICE_FIELDS.map(([field, title]) => (
                  <div className="field" key={field}>
                    <label htmlFor={`coverage-${field}`}>
                      {title}
                    </label>

                    <select
                      id={`coverage-${field}`}
                      value={serviceCoverage[field]}
                      onChange={(event) =>
                        updateCoverage(field, event.target.value)
                      }
                    >
                      {COVERAGE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <p className="hint">
                Insurance, finance assistance and annual maintenance
                must be confirmed separately. Do not select Included
                unless the offered scope supports it.
              </p>
            </section>

            <section className="panel">
              <h2>Page 4 — Partner product range</h2>

              <p className="hint">
                Enter one product option per line. These are the
                partner’s available options, not the equipment
                automatically included in this customer’s offer.
              </p>

              <div className="field spaced">
                <label htmlFor="range-modules">
                  Solar module options
                </label>

                <textarea
                  id="range-modules"
                  rows={4}
                  maxLength={600}
                  value={productText.modules}
                  placeholder="Enter one confirmed module option per line"
                  onChange={(event) =>
                    updateProductText('modules', event.target.value)
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="range-inverters">
                  Inverter options
                </label>

                <textarea
                  id="range-inverters"
                  rows={4}
                  maxLength={600}
                  value={productText.inverters}
                  placeholder="Enter one confirmed inverter option per line"
                  onChange={(event) =>
                    updateProductText('inverters', event.target.value)
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="range-structures">
                  Mounting structure options
                </label>

                <textarea
                  id="range-structures"
                  rows={4}
                  maxLength={600}
                  value={productText.structures}
                  placeholder={
                    'Enter only options offered by this partner, ' +
                    'one per line'
                  }
                  onChange={(event) =>
                    updateProductText('structures', event.target.value)
                  }
                />
              </div>

              <p className="hint">
                Leave a category blank if its range is not yet
                confirmed.
              </p>
            </section>

            <section className="panel">
              <h2>Pages 5 and 6 — Design, scope and equipment</h2>

              <p className="hint">
                Enter only site-verified or installer-confirmed
                details. Generation figures are estimates and must
                not be presented as guaranteed output.
              </p>

              <div className="editor-grid">
                <div className="field">
                  <label htmlFor="design-roof">
                    Roof type
                  </label>

                  <input
                    id="design-roof"
                    value={systemDesign.roofType}
                    maxLength={80}
                    placeholder="RCC, tin sheet, elevated, etc."
                    onChange={(event) =>
                      updateSystemDesign(
                        'roofType',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="design-mounting">
                    Mounting structure
                  </label>

                  <input
                    id="design-mounting"
                    value={systemDesign.mountingStructure}
                    maxLength={120}
                    placeholder="Flush mount, elevated structure, etc."
                    onChange={(event) =>
                      updateSystemDesign(
                        'mountingStructure',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="design-array">
                    Array configuration
                  </label>

                  <input
                    id="design-array"
                    value={systemDesign.arrayConfiguration}
                    maxLength={160}
                    placeholder="For example: 2 strings, south-facing"
                    onChange={(event) =>
                      updateSystemDesign(
                        'arrayConfiguration',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="design-monthly">
                    Estimated monthly generation — units
                  </label>

                  <input
                    id="design-monthly"
                    type="number"
                    min="0"
                    value={systemDesign.monthlyGeneration}
                    onChange={(event) =>
                      updateSystemDesign(
                        'monthlyGeneration',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="design-annual">
                    Estimated annual generation — units
                  </label>

                  <input
                    id="design-annual"
                    type="number"
                    min="0"
                    value={systemDesign.annualGeneration}
                    onChange={(event) =>
                      updateSystemDesign(
                        'annualGeneration',
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="field spaced">
                <label htmlFor="scope-items">
                  Scope of work — one item per line
                </label>

                <textarea
                  id="scope-items"
                  rows={6}
                  maxLength={1200}
                  value={scopeText}
                  placeholder={
                    'Site survey\nSystem design\nSupply and installation\n' +
                    'DISCOM coordination\nCommissioning'
                  }
                  onChange={(event) =>
                    updateScopeText(event.target.value)
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="equipment-items">
                  Equipment / BOM — one item per line
                </label>

                <textarea
                  id="equipment-items"
                  rows={8}
                  maxLength={2000}
                  value={equipmentText}
                  placeholder={
                    'Solar module | 540 Wp mono PERC | 10\n' +
                    'Inverter | 5 kW string inverter | 1\n' +
                    'Mounting structure | Galvanised iron | 1 lot'
                  }
                  onChange={(event) =>
                    updateEquipmentText(event.target.value)
                  }
                />

                <span className="hint">
                  Use this format for each line:
                  Item name | Specification or model | Quantity
                </span>
              </div>
            </section>

            <section className="panel">
              <h2>Review and print</h2>

              <p className="warning">
                The descriptions, logo URL, contact details,
                service selections, product ranges, design details,
                scope and equipment entered here are temporary.
                They are not saved and will be lost when you
                refresh or leave this page.
              </p>

              <p className="hint">
                This preview contains only the first six pages.
                It is not yet the complete technical or commercial
                proposal. Do not send it as the full offer.
              </p>

              {record.proposal.status === 'draft' && (
                <p className="hint">
                  This proposal is a draft. Its Draft label remains
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
                  I have reviewed the customer details, company
                  descriptions, branding, service coverage, product
                  range, system design, scope and equipment list.
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
                Print / Save pages 1 to 6 as PDF
              </button>

              <p className="hint">
                Choose A4 and Save as PDF. Set margins to None if
                your browser overrides the page settings. Disable
                browser headers and footers. Review every page
                before sharing.
              </p>
            </section>
          </>
        )}
      </div>

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
            totalPages={6}
          />

          <ProposalCapabilitiesPages
            company={record.company}
            proposal={record.proposal}
            serviceCoverage={serviceCoverage}
            productRange={productRange}
            totalPages={6}
          />

          <ProposalDesignPages
            company={record.company}
            proposal={record.proposal}
            lead={record.lead}
            systemDesign={systemDesign}
            scopeItems={scopeItems}
            equipmentItems={equipmentItems}
            totalPages={6}
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
        select,
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
        select:focus,
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
