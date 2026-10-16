'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabase';
import { useAuth } from '../../../../../../providers';
import ProposalOpeningPages from '../../../../../../../components/ProposalOpeningPages';
import ProposalCapabilitiesPages from '../../../../../../../components/ProposalCapabilitiesPages';
import ProposalDesignPages from '../../../../../../../components/ProposalDesignPages';
import ProposalCommercialPages from '../../../../../../../components/ProposalCommercialPages';
import ProposalTimelineImpactPages from '../../../../../../../components/ProposalTimelineImpactPages';
import ProposalSiteResponsibilityPages from '../../../../../../../components/ProposalSiteResponsibilityPages';
import ProposalSafetyAcceptancePages from '../../../../../../../components/ProposalSafetyAcceptancePages';

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

const EMPTY_COMMERCIAL = {
  basicAmount: '',
  gstAmount: '',
  totalIncludingGst: '',
};

const EMPTY_ENVIRONMENTAL = {
  co2SavedKg: '',
  treeEquivalent: '',
};

const EMPTY_SAVINGS = {
  annualSavings: '',
  paybackYears: '',
};

const EMPTY_SITE_LAYOUT = {
  roofType: '',
  availableRoofArea: '',
  moduleArea: '',
  inverterLocation: '',
  cableRoute: '',
  earthingLocation: '',
  layoutNotes: '',
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

function parsePayments(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [milestone, percentage, amount] = line
        .split('|')
        .map((part) => part.trim());

      return {
        milestone,
        percentage,
        amount,
      };
    });
}

function parseTimeline(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [stage, duration, details] = line
        .split('|')
        .map((part) => part.trim());

      return {
        stage,
        duration,
        details,
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

  const [commercial, setCommercial] = useState({
    ...EMPTY_COMMERCIAL,
  });

  const [paymentText, setPaymentText] = useState('');

  const [warrantyText, setWarrantyText] = useState('');

  const [nextStepsText, setNextStepsText] = useState('');

  const [timelineText, setTimelineText] = useState('');

  const [environmental, setEnvironmental] = useState({
    ...EMPTY_ENVIRONMENTAL,
  });

  const [savings, setSavings] = useState({
    ...EMPTY_SAVINGS,
  });

  const [siteLayout, setSiteLayout] = useState({
    ...EMPTY_SITE_LAYOUT,
  });

  const [responsibilitiesText, setResponsibilitiesText] =
    useState('');

  const [documentsText, setDocumentsText] = useState('');

  const [safetyText, setSafetyText] = useState('');

  const [qualityText, setQualityText] = useState('');

  const [complianceText, setComplianceText] = useState('');

  const [acceptanceNotes, setAcceptanceNotes] = useState('');

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
    setCommercial({ ...EMPTY_COMMERCIAL });
    setPaymentText('');
    setWarrantyText('');
    setNextStepsText('');
    setTimelineText('');
    setEnvironmental({ ...EMPTY_ENVIRONMENTAL });
    setSavings({ ...EMPTY_SAVINGS });
    setSiteLayout({ ...EMPTY_SITE_LAYOUT });
    setResponsibilitiesText('');
    setDocumentsText('');
    setSafetyText('');
    setQualityText('');
    setComplianceText('');
    setAcceptanceNotes('');

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
      '- Pages 1 to 14';

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

  function updateCommercial(field, value) {
    clearReview();

    setCommercial((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updatePaymentText(value) {
    clearReview();
    setPaymentText(value);
  }

  function updateWarrantyText(value) {
    clearReview();
    setWarrantyText(value);
  }

  function updateNextStepsText(value) {
    clearReview();
    setNextStepsText(value);
  }

  function updateTimelineText(value) {
    clearReview();
    setTimelineText(value);
  }

  function updateEnvironmental(field, value) {
    clearReview();

    setEnvironmental((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateSavings(field, value) {
    clearReview();

    setSavings((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateSiteLayout(field, value) {
    clearReview();

    setSiteLayout((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateResponsibilitiesText(value) {
    clearReview();
    setResponsibilitiesText(value);
  }

  function updateDocumentsText(value) {
    clearReview();
    setDocumentsText(value);
  }

  function updateSafetyText(value) {
    clearReview();
    setSafetyText(value);
  }

  function updateQualityText(value) {
    clearReview();
    setQualityText(value);
  }

  function updateComplianceText(value) {
    clearReview();
    setComplianceText(value);
  }

  function updateAcceptanceNotes(value) {
    clearReview();
    setAcceptanceNotes(value);
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

  const paymentSchedule = parsePayments(paymentText);

  const warrantyItems = linesToOptions(warrantyText);

  const nextSteps = linesToOptions(nextStepsText);

  const timelineItems = parseTimeline(timelineText);

  const customerResponsibilities = linesToOptions(
    responsibilitiesText
  );

  const documentsRequired = linesToOptions(documentsText);

  const safetyItems = linesToOptions(safetyText);

  const qualityItems = linesToOptions(qualityText);

  const complianceItems = linesToOptions(complianceText);

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

        <h1>Proposal preview — pages 1 to 14</h1>

        <p className="intro">
          Cover, company profiles, service capabilities, product
          range, system design, scope, equipment, commercial
          terms, warranties, timeline, environmental impact, site
          layout, responsibilities, safety and acceptance.
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
              <h2>Pages 7 and 8 — Commercial terms</h2>

              <p className="hint">
                Enter only amounts and terms that the installer has
                confirmed in writing. Do not present indicative
                figures as final payable amounts.
              </p>

              <div className="editor-grid">
                <div className="field">
                  <label htmlFor="commercial-basic">
                    Basic proposal value — ₹
                  </label>

                  <input
                    id="commercial-basic"
                    type="number"
                    min="0"
                    value={commercial.basicAmount}
                    onChange={(event) =>
                      updateCommercial(
                        'basicAmount',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="commercial-gst">
                    GST amount — ₹
                  </label>

                  <input
                    id="commercial-gst"
                    type="number"
                    min="0"
                    value={commercial.gstAmount}
                    onChange={(event) =>
                      updateCommercial(
                        'gstAmount',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="commercial-total">
                    Total including GST — ₹
                  </label>

                  <input
                    id="commercial-total"
                    type="number"
                    min="0"
                    value={commercial.totalIncludingGst}
                    onChange={(event) =>
                      updateCommercial(
                        'totalIncludingGst',
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="field spaced">
                <label htmlFor="payment-schedule">
                  Payment schedule — one milestone per line
                </label>

                <textarea
                  id="payment-schedule"
                  rows={5}
                  maxLength={1000}
                  value={paymentText}
                  placeholder={
                    'Advance on agreement | 25% | 50000\n' +
                    'Material dispatch | 50% | 100000\n' +
                    'Commissioning | 25% | 50000'
                  }
                  onChange={(event) =>
                    updatePaymentText(event.target.value)
                  }
                />

                <span className="hint">
                  Use this format:
                  Milestone | Percentage | Amount
                </span>
              </div>

              <div className="field spaced">
                <label htmlFor="warranty-terms">
                  Warranty summary — one item per line
                </label>

                <textarea
                  id="warranty-terms"
                  rows={5}
                  maxLength={1000}
                  value={warrantyText}
                  placeholder={
                    'Solar modules: manufacturer warranty as applicable\n' +
                    'Inverter: standard manufacturer warranty\n' +
                    'Installation workmanship: as stated in agreement'
                  }
                  onChange={(event) =>
                    updateWarrantyText(event.target.value)
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="next-steps">
                  Next steps — one step per line
                </label>

                <textarea
                  id="next-steps"
                  rows={5}
                  maxLength={1000}
                  value={nextStepsText}
                  placeholder={
                    'Confirm proposal and sign agreement\n' +
                    'Complete site survey\n' +
                    'Submit DISCOM application\n' +
                    'Schedule installation'
                  }
                  onChange={(event) =>
                    updateNextStepsText(event.target.value)
                  }
                />
              </div>
            </section>

            <section className="panel">
              <h2>Pages 9 and 10 — Timeline and impact</h2>

              <p className="hint">
                Enter only realistic, site-specific or
                installer-confirmed estimates. Do not present
                generation, savings, payback or environmental
                figures as guarantees.
              </p>

              <div className="field spaced">
                <label htmlFor="timeline-items">
                  Project timeline — one milestone per line
                </label>

                <textarea
                  id="timeline-items"
                  rows={7}
                  maxLength={1500}
                  value={timelineText}
                  placeholder={
                    'Agreement and advance | 1-2 weeks | Sign agreement and complete documentation\n' +
                    'DISCOM application | 2-4 weeks | Submit application and follow approvals\n' +
                    'Installation | 3-5 days | Install modules, inverter and structure\n' +
                    'Commissioning | 1-2 days | Testing, inspection and handover'
                  }
                  onChange={(event) =>
                    updateTimelineText(event.target.value)
                  }
                />

                <span className="hint">
                  Use this format:
                  Milestone | Expected duration | Details
                </span>
              </div>

              <div className="editor-grid spaced">
                <div className="field">
                  <label htmlFor="impact-co2">
                    Estimated annual CO2 avoided — kg
                  </label>

                  <input
                    id="impact-co2"
                    type="number"
                    min="0"
                    value={environmental.co2SavedKg}
                    onChange={(event) =>
                      updateEnvironmental(
                        'co2SavedKg',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="impact-trees">
                    Equivalent trees per year
                  </label>

                  <input
                    id="impact-trees"
                    type="number"
                    min="0"
                    value={environmental.treeEquivalent}
                    onChange={(event) =>
                      updateEnvironmental(
                        'treeEquivalent',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="savings-annual">
                    Estimated annual bill savings — ₹
                  </label>

                  <input
                    id="savings-annual"
                    type="number"
                    min="0"
                    value={savings.annualSavings}
                    onChange={(event) =>
                      updateSavings(
                        'annualSavings',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="savings-payback">
                    Estimated payback period — years
                  </label>

                  <input
                    id="savings-payback"
                    type="number"
                    min="0"
                    step="0.1"
                    value={savings.paybackYears}
                    onChange={(event) =>
                      updateSavings(
                        'paybackYears',
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <p className="hint">
                These values should come from a verified calculation
                or saved solar estimate. The proposal database
                includes timeline and environmental-impact fields,
                while solar estimates include CO2 avoided, tree
                equivalent and payback period.
              </p>
            </section>

            <section className="panel">
              <h2>Pages 11 and 12 — Site and responsibilities</h2>

              <p className="hint">
                Enter only site-verified details. The layout is
                indicative until the physical survey, structural
                assessment and DISCOM requirements are complete.
              </p>

              <div className="editor-grid">
                <div className="field">
                  <label htmlFor="layout-roof">
                    Roof type
                  </label>

                  <input
                    id="layout-roof"
                    value={siteLayout.roofType}
                    maxLength={80}
                    placeholder="RCC, tin sheet, elevated, etc."
                    onChange={(event) =>
                      updateSiteLayout(
                        'roofType',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="layout-area">
                    Available roof area — sq ft
                  </label>

                  <input
                    id="layout-area"
                    type="number"
                    min="0"
                    value={siteLayout.availableRoofArea}
                    onChange={(event) =>
                      updateSiteLayout(
                        'availableRoofArea',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="layout-module-area">
                    Module area
                  </label>

                  <input
                    id="layout-module-area"
                    value={siteLayout.moduleArea}
                    maxLength={120}
                    placeholder="South-facing roof, approximately 600 sq ft"
                    onChange={(event) =>
                      updateSiteLayout(
                        'moduleArea',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="layout-inverter">
                    Inverter location
                  </label>

                  <input
                    id="layout-inverter"
                    value={siteLayout.inverterLocation}
                    maxLength={160}
                    placeholder="Near main DB, shaded indoor wall"
                    onChange={(event) =>
                      updateSiteLayout(
                        'inverterLocation',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="layout-cable">
                    Cable route
                  </label>

                  <input
                    id="layout-cable"
                    value={siteLayout.cableRoute}
                    maxLength={200}
                    placeholder="Roof to inverter through existing conduit"
                    onChange={(event) =>
                      updateSiteLayout(
                        'cableRoute',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="layout-earthing">
                    Earthing location
                  </label>

                  <input
                    id="layout-earthing"
                    value={siteLayout.earthingLocation}
                    maxLength={160}
                    placeholder="Near existing earthing pit"
                    onChange={(event) =>
                      updateSiteLayout(
                        'earthingLocation',
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="field spaced">
                <label htmlFor="layout-notes">
                  Layout notes
                </label>

                <textarea
                  id="layout-notes"
                  rows={5}
                  maxLength={1000}
                  value={siteLayout.layoutNotes}
                  placeholder="Shading, access, safety, structure or installation notes"
                  onChange={(event) =>
                    updateSiteLayout(
                      'layoutNotes',
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="responsibilities-items">
                  Customer responsibilities — one item per line
                </label>

                <textarea
                  id="responsibilities-items"
                  rows={6}
                  maxLength={1200}
                  value={responsibilitiesText}
                  placeholder={
                    'Provide site access during survey and installation\n' +
                    'Provide electricity bill and ownership documents\n' +
                    'Coordinate DISCOM inspection where required'
                  }
                  onChange={(event) =>
                    updateResponsibilitiesText(event.target.value)
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="documents-items">
                  Documents typically required — one item per line
                </label>

                <textarea
                  id="documents-items"
                  rows={6}
                  maxLength={1200}
                  value={documentsText}
                  placeholder={
                    'Recent electricity bill\n' +
                    'Ownership or authorisation proof\n' +
                    'Consumer number and DISCOM details\n' +
                    'Bank details, if subsidy process requires them'
                  }
                  onChange={(event) =>
                    updateDocumentsText(event.target.value)
                  }
                />
              </div>

              <p className="hint">
                Do not request sensitive identity documents unless
                they are required for the specific DISCOM or subsidy
                process, and do not retain them longer than
                necessary.
              </p>
            </section>

            <section className="panel">
              <h2>Pages 13 and 14 — Safety and acceptance</h2>

              <p className="hint">
                Add only practices and commitments the installer
                will actually follow. Do not make unverified
                compliance, certification, insurance or performance
                claims.
              </p>

              <div className="field spaced">
                <label htmlFor="safety-items">
                  Safety practices — one item per line
                </label>

                <textarea
                  id="safety-items"
                  rows={5}
                  maxLength={1000}
                  value={safetyText}
                  placeholder={
                    'Trained installation team\n' +
                    'Personal protective equipment during rooftop work\n' +
                    'Electrical isolation before installation'
                  }
                  onChange={(event) =>
                    updateSafetyText(event.target.value)
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="quality-items">
                  Quality checks — one item per line
                </label>

                <textarea
                  id="quality-items"
                  rows={5}
                  maxLength={1000}
                  value={qualityText}
                  placeholder={
                    'Pre-installation site check\n' +
                    'Post-installation electrical testing\n' +
                    'Photo documentation of completed work'
                  }
                  onChange={(event) =>
                    updateQualityText(event.target.value)
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="compliance-items">
                  Compliance and approvals — one item per line
                </label>

                <textarea
                  id="compliance-items"
                  rows={5}
                  maxLength={1000}
                  value={complianceText}
                  placeholder={
                    'DISCOM application support\n' +
                    'Net-metering documentation support\n' +
                    'Compliance with applicable local requirements'
                  }
                  onChange={(event) =>
                    updateComplianceText(event.target.value)
                  }
                />
              </div>

              <div className="field spaced">
                <label htmlFor="acceptance-notes">
                  Acceptance notes — optional
                </label>

                <textarea
                  id="acceptance-notes"
                  rows={4}
                  maxLength={800}
                  value={acceptanceNotes}
                  placeholder="Any customer-specific acceptance instructions or notes"
                  onChange={(event) =>
                    updateAcceptanceNotes(event.target.value)
                  }
                />
              </div>

              <p className="hint">
                This acceptance page is a preview only. It must not
                be used to collect payments or execute a binding
                contract until the agreement and payment workflows
                are separately approved.
              </p>
            </section>

            <section className="panel">
              <h2>Review and print</h2>

              <p className="warning">
                The descriptions, logo URL, contact details,
                service selections, product ranges, design details,
                scope, equipment, commercial terms, warranties,
                next steps, timeline, environmental impact, savings,
                site layout, responsibilities, documents, safety,
                quality, compliance and acceptance notes entered
                here are temporary. They are not saved and will be
                lost when you refresh or leave this page.
              </p>

              <p className="hint">
                This preview contains only the first fourteen pages.
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
                  range, system design, scope, equipment list,
                  commercial terms, warranties, next steps,
                  timeline, environmental impact, savings, site
                  layout, responsibilities, documents, safety,
                  quality, compliance and acceptance notes.
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
                Print / Save pages 1 to 14 as PDF
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
            totalPages={14}
          />

          <ProposalCapabilitiesPages
            company={record.company}
            proposal={record.proposal}
            serviceCoverage={serviceCoverage}
            productRange={productRange}
            totalPages={14}
          />

          <ProposalDesignPages
            company={record.company}
            proposal={record.proposal}
            lead={record.lead}
            systemDesign={systemDesign}
            scopeItems={scopeItems}
            equipmentItems={equipmentItems}
            totalPages={14}
          />

          <ProposalCommercialPages
            company={record.company}
            proposal={record.proposal}
            lead={record.lead}
            commercial={commercial}
            paymentSchedule={paymentSchedule}
            warrantyItems={warrantyItems}
            nextSteps={nextSteps}
            totalPages={14}
          />

          <ProposalTimelineImpactPages
            company={record.company}
            proposal={record.proposal}
            lead={record.lead}
            timelineItems={timelineItems}
            environmental={environmental}
            savings={savings}
            totalPages={14}
          />

          <ProposalSiteResponsibilityPages
            company={record.company}
            proposal={record.proposal}
            lead={record.lead}
            siteLayout={siteLayout}
            customerResponsibilities={customerResponsibilities}
            documentsRequired={documentsRequired}
            totalPages={14}
          />

          <ProposalSafetyAcceptancePages
            company={record.company}
            proposal={record.proposal}
            lead={record.lead}
            safetyItems={safetyItems}
            qualityItems={qualityItems}
            complianceItems={complianceItems}
            acceptanceNotes={acceptanceNotes}
            totalPages={14}
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
