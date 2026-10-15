'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';
import Logo from '../../../../../components/Logo';

const TOTAL_PAGES = 12;
const CONTACT_EMAIL = 'hello@solarhues.com';

// Environmental conversion factors. Update these when new official data is published.
const GRID_EMISSION_KG_PER_KWH = 0.727; // CEA CO2 Baseline Database, FY 2023-24
const COAL_KG_PER_KWH = 0.55; // approximate coal burned per unit of grid electricity
const PETROL_CO2_KG_PER_LITRE = 2.31;
const CAR_KM_PER_LITRE = 15; // assumed petrol car efficiency
const TREE_CO2_KG_PER_YEAR = 22;

const WHY_ITEMS = [
  ['📋', 'Permissions and approvals'],
  ['📐', 'Site audit'],
  ['🧩', 'System design'],
  ['🤝', 'Agreement'],
  ['💳', 'Financial assistance'],
  ['⭐', 'Quality components'],
  ['🦺', 'Safety and insurance'],
  ['🔧', 'Annual maintenance coverage (optional)'],
  ['⚡', 'Plant commissioning'],
];

const BENEFITS = [
  'End-to-end solutions',
  'One-stop destination for all energy solution requirements',
  'Seamless, expert-managed process',
  'Custom design for your site',
  'Premium products',
  'Quality workmanship',
];

const RANGE_BLOCKS = [
  {
    title: 'Solar panels',
    key: 'module_type',
    items: [
      ['Mono PERC', 'Reliable, widely used rooftop panel technology.'],
      ['TOPCon', 'N-type cells with higher efficiency, subject to the selected make.'],
      ['Bifacial', 'Can add output where the installation allows light to reach the rear side.'],
    ],
  },
  {
    title: 'Inverters',
    key: 'inverter_type',
    items: [
      ['String', 'Common choice for a single, largely unshaded array.'],
      ['Micro', 'Panel-level conversion, useful on complex or partly shaded roofs.'],
      ['Hybrid', 'Supports battery storage now or in the future.'],
    ],
  },
  {
    title: 'Structures',
    key: 'structure_type',
    items: [
      ['Flush mount', 'Low-profile mounting where the roof condition permits.'],
      ['Roof rail', 'Rail-based mounting for supported roof types.'],
      ['Short rail', 'Short rails, commonly used on metal-sheet roofs.'],
      ['Elevated', 'Raised structure for clearance, orientation or roof use.'],
    ],
  },
];

const JOURNEY = [
  'Proposal accepted',
  'Site survey and final design',
  'Documents and utility application',
  'Material procurement and delivery',
  'Installation and quality checks',
  'Testing, commissioning and handover',
  'Metering and utility process',
  'Monitoring and support',
];

const DEFAULT_MILESTONES = [
  'Site survey and final design',
  'Documentation',
  'Utility application',
  'Procurement',
  'Installation',
  'Commissioning',
];

const SCOPE_SECTIONS = [
  {
    title: '1. Scope of services',
    items: [
      'SolarHues Authorised Partner Design, Engineering, Procurement, Supply and Construction of the Solar PV Plant as per the specifications agreed.',
      'Labour and civil foundation work related to Module Mounting Structure (MMS), installation and commissioning of the Solar PV Plant, including synchronisation with the grid supply where applicable.',
    ],
  },
  {
    title: '2. Customer obligations',
    items: [
      'Clear paperwork on site ownership, including roof rights, and a metered connection with no defaults or dues in the name of the site owner.',
      'Safe storage space for materials during installation and commissioning.',
      'A dedicated, shadow-free area, as highlighted and agreed at the time of survey and order finalisation, for the PV panels in the Array Layout Diagram.',
      'Water and electricity connections required for construction of the solar power plant.',
      'Synchronisation with a DG set, where required, is charged extra.',
      'Documentation support will be provided, but the net-metering cost is borne by the customer at actuals and is not part of the project cost unless stated in the proposal.',
      'Explicit go-ahead for drilling or chipping of the roof and walls as necessary for installation.',
      'Sufficient area on site for construction of the solar earthing system.',
      'Periodic cleaning of the solar PV modules after installation.',
      'A suitably rated 440 V, 50 Hz, 4-pole MCB, MCCB or ACB feeder in the electrical LT distribution panel or utility shaft for connecting the solar power plant, and an electrical shutdown of sufficient duration for connection to the existing LT panel.',
      'Any upgrade, conversion or change to the existing electrical system, such as voltages or distribution, needed to meet utility requirements is in the client scope.',
      'Any delay on the customer side, such as documents, payments or work front, extends the project timeline accordingly.',
      'Any change to the main transformer, such as a capacity or rating increase, and liaison with the DISCOM for transformer-related work, is outside this proposal.',
      'A proper stair or ladder up to the proposed rooftop for movement of people and materials.',
      'Additional charges may apply for changes to the electricity connection, such as load, name or phase adjustments.',
    ],
  },
  {
    title: '3. Deemed acceptance',
    items: [
      'Release of the advance payment by the customer is treated as release of a formal purchase order and acceptance of all terms and conditions in this proposal.',
    ],
  },
  {
    title: '4. Disputes and jurisdiction',
    items: [
      'Any legal dispute will be settled within the jurisdiction of the respective SolarHues Authorised Partner.',
    ],
  },
  {
    title: '5. Force majeure',
    items: ['Standard force majeure conditions apply to this offer and the resulting order.'],
  },
];

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function inr(value) {
  return `₹${Math.round(num(value)).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ArrayDiagram({ count }) {
  const total = Math.max(1, Math.min(count, 60));
  const cols = Math.min(total, 6);
  const rowsCount = Math.ceil(total / cols);
  const pw = 54;
  const ph = 32;
  const gap = 8;
  const width = cols * (pw + gap) + gap + 40;
  const height = rowsCount * (ph + gap + 6) + gap + 56;

  const panels = [];
  for (let i = 0; i < total; i += 1) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    panels.push(
      <g key={i}>
        <rect x={20 + gap + c * (pw + gap)} y={30 + gap + r * (ph + gap + 6)} width={pw} height={ph}
          rx="3" fill="#1e3a5f" stroke="#facc15" strokeWidth="1.2" />
        <text x={20 + gap + c * (pw + gap) + pw / 2} y={30 + gap + r * (ph + gap + 6) + ph / 2 + 3}
          textAnchor="middle" fontSize="9" fill="#fff">P{i + 1}</text>
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Indicative array layout">
      <rect x="4" y="4" width={width - 8} height={height - 8} rx="8" fill="#f8f9f1" stroke="#a8a29e" />
      <text x="20" y="22" fontSize="10" fill="#57534e">Roof (indicative) — panels face south</text>
      {panels}
      <text x={width / 2} y={height - 12} textAnchor="middle" fontSize="9" fill="#57534e">
        Keep walkways and edge clearance — not to scale
      </text>
    </svg>
  );
}

function Page({ n, meta, children }) {
  return (
    <section className="pv-pg">
      <div className="pv-body">{children}</div>
      <footer className="pv-foot">
        <span>Solar proposal · Issued {meta.issue}</span>
        <span>{CONTACT_EMAIL}</span>
        <span>{meta.number} · Page {n} of {TOTAL_PAGES}</span>
      </footer>
    </section>
  );
}

export default function ProposalPreviewPage() {
  const params = useParams();
  const proposalId = params.id;
  const { user, loading } = useAuth();

  const [draft, setDraft] = useState(null);
  const [ready, setReady] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !proposalId) return;
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from('partner_proposals')
        .select('*')
        .eq('id', proposalId)
        .maybeSingle();

      if (!active) return;
      if (error || !data) setNotFound(true);
      else setDraft(data);
      setReady(true);
    }

    load();
    return () => {
      active = false;
    };
  }, [user, proposalId]);

  const view = useMemo(() => {
    if (!draft) return null;
    const sd = draft.system_design || {};
    const partner = draft.partner_profile || {};
    const site = draft.customer_site || {};
    const warranty = draft.warranty_terms || {};
    const bom = Array.isArray(draft.bom_items) ? draft.bom_items : [];
    const timeline = draft.timeline || {};
    const photos = draft.layout_snapshot && Array.isArray(draft.layout_snapshot.photos)
      ? draft.layout_snapshot.photos
      : [];

    const annual = num(sd.annual_generation_kwh);
    const co2Kg = annual * GRID_EMISSION_KG_PER_KWH;
    const petrolLitres = co2Kg / PETROL_CO2_KG_PER_LITRE;

    return {
      sd, partner, site, warranty, bom, timeline, photos,
      annual,
      co2Tonnes: co2Kg / 1000,
      trees: co2Kg / TREE_CO2_KG_PER_YEAR,
      coalTonnes: (annual * COAL_KG_PER_KWH) / 1000,
      petrolLitres,
      km: petrolLitres * CAR_KM_PER_LITRE,
      meta: { issue: formatDate(draft.issue_date), number: draft.proposal_number || '' },
    };
  }, [draft]);

  const incomplete = view && (!view.sd.module_count || !view.bom.length);
  const { sd, partner, site, warranty, bom, timeline, photos, meta } = view || {};

  return (
    <div className="pv-root">
      <style>{`
        .pv-root{ min-height:100vh; background:#cbd5e1; font-family:Inter,-apple-system,sans-serif; color:#1c1917; }
        .pv-bar{ position:sticky; top:0; z-index:5; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:12px 24px; background:#1e293b; color:#fff; }
        .pv-bar a{ color:#cbd5e1; text-decoration:none; font-size:14px; font-weight:600; }
        .pv-btn{ padding:10px 16px; border:none; border-radius:9px; background:#facc15; color:#1e293b; font:700 14px Inter,sans-serif; cursor:pointer; }
        .pv-warn{ max-width:794px; margin:16px auto 0; padding:12px 16px; border-radius:10px; background:#fef3c7; color:#78350f; font-size:13px; line-height:1.5; }
        .pv-note{ max-width:794px; margin:40px auto; padding:20px; border-radius:12px; background:#fef3c7; color:#78350f; font-size:14px; line-height:1.6; }
        .pv-wrap{ padding:20px 0 60px; }
        .pv-pg{ position:relative; width:794px; max-width:100%; min-height:1123px; margin:0 auto 20px; background:#fff; box-shadow:0 4px 18px rgba(0,0,0,0.15); display:flex; flex-direction:column; box-sizing:border-box; }
        .pv-body{ flex:1; padding:48px 52px 24px; }
        .pv-foot{ display:flex; justify-content:space-between; gap:10px; padding:12px 52px; border-top:3px solid #facc15; background:#fafaf9; color:#57534e; font-size:10.5px; }
        .pv-h1{ margin:0 0 6px; font:800 30px "Space Grotesk",Inter,sans-serif; color:#4a3217; }
        .pv-h2{ margin:0 0 18px; font:800 24px "Space Grotesk",Inter,sans-serif; color:#4a3217; border-bottom:3px solid #facc15; padding-bottom:8px; }
        .pv-h3{ margin:18px 0 8px; font:700 15px "Space Grotesk",Inter,sans-serif; color:#4a3217; }
        .pv-p{ margin:0 0 10px; font-size:13px; line-height:1.65; color:#44403c; }
        .pv-cover{ text-align:center; }
        .pv-cover .pv-tag{ margin:34px 0 4px; color:#059669; font-size:12px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
        .pv-cover .pv-big{ margin:0 0 30px; font:800 44px "Space Grotesk",Inter,sans-serif; color:#4a3217; line-height:1.05; }
        .pv-box{ margin:18px auto; max-width:520px; padding:18px 20px; border:1px solid #e7e5e4; border-radius:14px; background:#fafaf9; text-align:left; }
        .pv-box b{ display:block; color:#78716c; font-size:10.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin-bottom:3px; }
        .pv-box span{ font-size:15px; font-weight:700; }
        .pv-partner-logo{ display:block; max-height:70px; max-width:200px; margin:8px auto 4px; object-fit:contain; }
        .pv-price{ margin:22px auto 0; max-width:520px; padding:18px; border-radius:14px; background:#4a3217; color:#fff; }
        .pv-price .pv-pv{ font:800 30px "Space Grotesk",Inter,sans-serif; color:#facc15; }
        .pv-grid3{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .pv-grid2{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .pv-tile{ padding:16px 12px; border:1px solid #e7e5e4; border-radius:14px; background:#fafaf9; text-align:center; }
        .pv-tile .pv-ico{ display:flex; align-items:center; justify-content:center; width:46px; height:46px; margin:0 auto 8px; border-radius:50%; background:#fef9c3; font-size:22px; }
        .pv-tile .pv-t{ font-size:12.5px; font-weight:700; color:#4a3217; line-height:1.35; }
        .pv-chip{ padding:12px 14px; border-radius:12px; background:#ecfdf5; color:#065f46; font-size:12.5px; font-weight:700; line-height:1.4; }
        .pv-block{ padding:16px; border:1px solid #e7e5e4; border-radius:14px; margin-bottom:14px; }
        .pv-block h3{ margin:0 0 10px; font:800 17px "Space Grotesk",Inter,sans-serif; color:#4a3217; }
        .pv-opt{ display:flex; gap:10px; padding:8px 10px; border-radius:10px; font-size:12.5px; line-height:1.45; }
        .pv-opt.sel{ background:#fef9c3; border:1px solid #facc15; }
        .pv-opt b{ min-width:110px; color:#4a3217; }
        .pv-tbl{ width:100%; border-collapse:collapse; font-size:12.5px; }
        .pv-tbl th, .pv-tbl td{ padding:9px 10px; border-bottom:1px solid #e7e5e4; text-align:left; vertical-align:top; }
        .pv-tbl th{ background:#fafaf9; color:#78716c; font-size:10.5px; letter-spacing:.06em; text-transform:uppercase; }
        .pv-tbl td:first-child{ font-weight:700; color:#4a3217; }
        .pv-env{ padding:18px; border-radius:16px; background:#ecfdf5; border:1px solid #a7f3d0; text-align:center; }
        .pv-env .pv-ei{ font-size:30px; }
        .pv-env .pv-ev{ margin:4px 0 2px; font:800 24px "Space Grotesk",Inter,sans-serif; color:#065f46; }
        .pv-env .pv-el{ color:#44403c; font-size:12px; font-weight:600; line-height:1.4; }
        .pv-small{ font-size:10.5px; line-height:1.55; color:#57534e; }
        .pv-scope li{ font-size:11px; line-height:1.55; margin-bottom:3px; color:#44403c; }
        .pv-scope h3{ margin:12px 0 6px; font-size:13px; }
        .pv-steps{ display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        .pv-step{ position:relative; padding:14px 10px; border-radius:12px; background:#fef9c3; text-align:center; font-size:11.5px; font-weight:700; color:#4a3217; line-height:1.35; }
        .pv-step i{ display:flex; align-items:center; justify-content:center; width:26px; height:26px; margin:0 auto 6px; border-radius:50%; background:#facc15; color:#4a3217; font-style:normal; font-size:12px; font-weight:800; }
        .pv-photos{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:16px; }
        .pv-photo{ display:flex; align-items:center; justify-content:center; height:150px; border:1px dashed #a8a29e; border-radius:12px; background:#fafaf9; color:#78716c; font-size:12px; text-align:center; padding:8px; overflow:hidden; }
        .pv-photo img{ width:100%; height:100%; object-fit:cover; }
        .pv-logo-wrap{ display:flex; justify-content:center; margin-bottom:6px; }
        @media print{
          @page{ size:A4; margin:0; }
          body{ background:#fff !important; }
          .pv-root{ background:#fff; }
          .pv-bar, .pv-warn, .pv-noprint{ display:none !important; }
          .pv-wrap{ padding:0; }
          .pv-pg{ box-shadow:none; margin:0; width:210mm; min-height:297mm; break-after:page; page-break-after:always; }
          *{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        }
      `}</style>

      <div className="pv-bar">
        <Link href={`/vendor/proposals/${proposalId}/commercials`}>← Back to bill of materials and price</Link>
        <button type="button" className="pv-btn" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      {(loading || (user && !ready)) && <div className="pv-note">Loading your proposal…</div>}
      {!loading && !user && (
        <div className="pv-note">
          Please <Link href="/vendor-login">sign in</Link> to view this proposal.
        </div>
      )}
      {!loading && user && ready && notFound && (
        <div className="pv-note">This proposal was not found, or you do not have access to it.</div>
      )}

      {!loading && user && ready && draft && view && (
        <>
          {incomplete && (
            <div className="pv-warn">
              This proposal is not complete yet. Save the system design and the bill of materials first,
              so every page shows real values.
            </div>
          )}
          <div className="pv-warn">
            Page 9 uses draft wording for acceptance and jurisdiction. Have a lawyer review it before
            sending any proposal to a customer. This notice does not print.
          </div>

          <div className="pv-wrap">
            {/* Page 1 - Cover */}
            <Page n={1} meta={meta}>
              <div className="pv-cover">
                <div className="pv-logo-wrap"><Logo height={46} /></div>
                <p className="pv-tag">Solar proposal</p>
                <h1 className="pv-big">Clean energy,<br />designed for your roof</h1>

                <div className="pv-box">
                  <b>Prepared for</b>
                  <span>{site.customer_name || '—'}</span>
                  <div className="pv-p" style={{ margin: '4px 0 0' }}>
                    {[site.locality, site.city, site.state].filter(Boolean).join(', ')}
                  </div>
                </div>

                <div className="pv-box" style={{ textAlign: 'center' }}>
                  <b>Prepared by</b>
                  {partner.logo_url && <img className="pv-partner-logo" src={partner.logo_url} alt="Partner logo" />}
                  <span>{partner.company_name || '—'}</span>
                  <div className="pv-p" style={{ margin: '4px 0 0' }}>SolarHues Authorised Partner</div>
                </div>

                <div className="pv-price">
                  <div style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    {sd.dc_capacity_kwp ? `${sd.dc_capacity_kwp} kWp rooftop solar system` : 'Rooftop solar system'}
                  </div>
                  <div className="pv-pv">{draft.total_amount_including_gst ? inr(draft.total_amount_including_gst) : '—'}</div>
                  <div style={{ fontSize: 12 }}>
                    {draft.total_amount
                      ? `${inr(draft.total_amount)} + GST ${inr(draft.gst_amount)} (${num(warranty.gst_rate)}%)`
                      : 'Price to be confirmed'}
                  </div>
                </div>

                <p className="pv-small" style={{ marginTop: 18 }}>
                  Proposal {meta.number} · Issued {meta.issue} · Valid until {formatDate(draft.valid_until)}
                </p>
              </div>
            </Page>

            {/* Page 2 - About */}
            <Page n={2} meta={meta}>
              <h2 className="pv-h2">About us</h2>
              <h3 className="pv-h3">About SolarHues</h3>
              <p className="pv-p">
                SolarHues helps customers compare qualified solar partners and manage their rooftop solar
                journey, from preliminary sizing and design to proposal review, installation milestones and
                customer support.
              </p>
              <p className="pv-p">
                Our aim is a simpler, more transparent way to go solar, with clear proposals, defined
                responsibilities and one place to follow your project.
              </p>

              <h3 className="pv-h3">About {partner.company_name || 'your partner'}</h3>
              <p className="pv-p" style={{ whiteSpace: 'pre-wrap' }}>
                {partner.about || 'Partner description not provided.'}
              </p>
              {partner.certifications && (
                <>
                  <h3 className="pv-h3">Credentials</h3>
                  <p className="pv-p" style={{ whiteSpace: 'pre-wrap' }}>{partner.certifications}</p>
                </>
              )}
              <h3 className="pv-h3">Your contact</h3>
              <p className="pv-p">
                {partner.contact_name}<br />{partner.phone}<br />{partner.email}
              </p>
            </Page>

            {/* Page 3 - Why choose us */}
            <Page n={3} meta={meta}>
              <h2 className="pv-h2">Why choose us</h2>
              <p className="pv-p">What we do for you, from first survey to a working plant.</p>
              <div className="pv-grid3" style={{ marginTop: 14 }}>
                {WHY_ITEMS.map(([icon, label]) => (
                  <div className="pv-tile" key={label}>
                    <div className="pv-ico">{icon}</div>
                    <div className="pv-t">{label}</div>
                  </div>
                ))}
              </div>
              <h3 className="pv-h3" style={{ marginTop: 26 }}>What you get</h3>
              <div className="pv-grid2">
                {BENEFITS.map((text) => (
                  <div className="pv-chip" key={text}>✓ {text}</div>
                ))}
              </div>
            </Page>

            {/* Page 4 - Range */}
            <Page n={4} meta={meta}>
              <h2 className="pv-h2">Our product range</h2>
              {RANGE_BLOCKS.map((block) => (
                <div className="pv-block" key={block.title}>
                  <h3>{block.title}</h3>
                  {block.items.map(([name, text]) => (
                    <div className={`pv-opt ${sd[block.key] === name ? 'sel' : ''}`} key={name}>
                      <b>{name}{sd[block.key] === name ? ' ★' : ''}</b>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              ))}
              <p className="pv-small">★ marks the option selected for your proposal.</p>
            </Page>

            {/* Page 5 - Sample layout */}
            <Page n={5} meta={meta}>
              <h2 className="pv-h2">Sample design and layout</h2>
              {sd.module_count ? <ArrayDiagram count={num(sd.module_count)} /> : (
                <p className="pv-p">The layout appears here once the system design is saved.</p>
              )}
              <p className="pv-small" style={{ marginTop: 8 }}>
                Indicative layout only, subject to the final site survey, structural review and shadow
                analysis. Orientation {sd.azimuth_deg ?? '—'}° and tilt {sd.tilt_deg ?? '—'}°.
              </p>
              <h3 className="pv-h3">Site and reference photos</h3>
              <div className="pv-photos">
                {[0, 1, 2].map((i) => (
                  <div className="pv-photo" key={i}>
                    {photos[i] ? <img src={photos[i]} alt={`Reference ${i + 1}`} /> : 'Photo to be added'}
                  </div>
                ))}
              </div>
              <p className="pv-small" style={{ marginTop: 8 }}>
                Reference images are representative installations unless stated otherwise.
              </p>
            </Page>

            {/* Page 6 - Proposed solution */}
            <Page n={6} meta={meta}>
              <h2 className="pv-h2">Proposed solution</h2>
              <table className="pv-tbl">
                <tbody>
                  <tr><td>System size</td><td>{sd.dc_capacity_kwp ? `${sd.dc_capacity_kwp} kWp` : '—'}</td></tr>
                  <tr><td>Inverter type</td><td>{sd.inverter_type || '—'}</td></tr>
                  <tr><td>Inverter rating</td><td>{sd.inverter_rating_kw ? `${sd.inverter_rating_kw} kW × ${sd.inverter_count}` : '—'}</td></tr>
                  <tr><td>Inverter make and model</td><td>{[sd.inverter_make, sd.inverter_model].filter(Boolean).join(' ') || '—'}</td></tr>
                  <tr><td>Solar panel type</td><td>{sd.module_type || '—'}</td></tr>
                  <tr><td>Solar panel wattage</td><td>{sd.module_wattage ? `${sd.module_wattage} W × ${sd.module_count} panels` : '—'}</td></tr>
                  <tr><td>Panel make and model</td><td>{[sd.module_make, sd.module_model].filter(Boolean).join(' ') || '—'}</td></tr>
                  <tr><td>Building type</td><td>{site.building_type || '—'}</td></tr>
                  <tr><td>Roof type</td><td>{site.roof_type || '—'}</td></tr>
                  <tr><td>Structure type</td><td>{sd.structure_type || '—'}</td></tr>
                  <tr><td>Orientation and tilt</td><td>{sd.azimuth_deg != null ? `${sd.azimuth_deg}° azimuth, ${sd.tilt_deg}° tilt` : '—'}</td></tr>
                  <tr><td>Indicative yearly generation</td><td>{sd.annual_generation_kwh ? `${num(sd.annual_generation_kwh).toLocaleString('en-IN')} kWh` : '—'}</td></tr>
                </tbody>
              </table>
              <p className="pv-small" style={{ marginTop: 10 }}>
                Generation is an estimate. Actual output depends on weather, shading, temperature and system
                condition.
              </p>
            </Page>

            {/* Page 7 - Environmental impact */}
            <Page n={7} meta={meta}>
              <h2 className="pv-h2">Your environmental impact</h2>
              <p className="pv-p">
                Based on about {view.annual.toLocaleString('en-IN')} kWh of clean electricity each year,
                your system helps avoid:
              </p>
              <div className="pv-grid3" style={{ marginTop: 14 }}>
                {[
                  ['🌫️', `${view.co2Tonnes.toFixed(1)} t`, 'CO₂ emissions avoided per year'],
                  ['🌳', `${Math.round(view.trees).toLocaleString('en-IN')}`, 'trees’ worth of CO₂ absorbed per year'],
                  ['⛏️', `${view.coalTonnes.toFixed(1)} t`, 'coal burned avoided per year'],
                  ['⛽', `${Math.round(view.petrolLitres).toLocaleString('en-IN')} L`, 'petrol consumption avoided per year'],
                  ['🚗', `${Math.round(view.km).toLocaleString('en-IN')} km`, 'equivalent car travel per year'],
                ].map(([icon, value, label]) => (
                  <div className="pv-env" key={label}>
                    <div className="pv-ei">{icon}</div>
                    <div className="pv-ev">{value}</div>
                    <div className="pv-el">{label}</div>
                  </div>
                ))}
              </div>
              <p className="pv-small" style={{ marginTop: 18 }}>
                Illustrative estimates using a grid emission factor of {GRID_EMISSION_KG_PER_KWH} kg CO₂ per
                kWh, {COAL_KG_PER_KWH} kg of coal per kWh, {PETROL_CO2_KG_PER_LITRE} kg CO₂ per litre of
                petrol, a car doing {CAR_KM_PER_LITRE} km per litre, and {TREE_CO2_KG_PER_YEAR} kg of CO₂
                absorbed per tree each year. Actual results vary with generation and the grid mix.
              </p>
            </Page>

            {/* Page 8 - Warranty */}
            <Page n={8} meta={meta}>
              <h2 className="pv-h2">Warranty and services</h2>
              <table className="pv-tbl">
                <thead><tr><th>Coverage</th><th>Period</th></tr></thead>
                <tbody>
                  <tr><td>Solar panel (workmanship)</td><td>{warranty.module_workmanship_years ?? '—'} years</td></tr>
                  <tr><td>Solar panel (linear output)</td><td>{warranty.module_linear_output_years ?? '—'} years</td></tr>
                  <tr><td>Structure design life</td><td>{warranty.structure_design_life_years ?? '—'} years</td></tr>
                  <tr><td>Inverter</td><td>{warranty.inverter_years ?? '—'} years</td></tr>
                  <tr><td>Cables</td><td>{warranty.cables_years ?? '—'} years</td></tr>
                  <tr><td>Switchgear</td><td>{warranty.switchgear_years ?? '—'} years</td></tr>
                  <tr><td>Installation workmanship</td><td>{warranty.installation_workmanship_years ?? '—'} years</td></tr>
                  <tr>
                    <td>Annual maintenance coverage</td>
                    <td>
                      {warranty.amc_status || '—'}
                      {warranty.amc_status === 'Optional' && warranty.amc_price != null
                        ? ` — ${inr(warranty.amc_price)} per year` : ''}
                      {warranty.amc_description ? <div className="pv-small">{warranty.amc_description}</div> : null}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="pv-small" style={{ marginTop: 10 }}>
                Warranty terms are as provided by the respective manufacturers and the partner. Warranty
                documents are handed over at commissioning.
              </p>
            </Page>

            {/* Page 9 - Scope */}
            <Page n={9} meta={meta}>
              <h2 className="pv-h2">Scope of service</h2>
              <div className="pv-scope">
                {SCOPE_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <h3 className="pv-h3">{section.title}</h3>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {section.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              {warranty.price_notes && (
                <>
                  <h3 className="pv-h3">Project-specific notes</h3>
                  <p className="pv-small" style={{ whiteSpace: 'pre-wrap' }}>{warranty.price_notes}</p>
                </>
              )}
            </Page>

            {/* Page 10 - BOM */}
            <Page n={10} meta={meta}>
              <h2 className="pv-h2">Balance of system</h2>
              <table className="pv-tbl">
                <thead>
                  <tr><th>Component</th><th>Description</th><th>Make</th><th>Qty</th></tr>
                </thead>
                <tbody>
                  {bom.length === 0 && <tr><td colSpan="4">Bill of materials not yet saved.</td></tr>}
                  {bom.map((row, index) => (
                    <tr key={`${row.component}-${index}`}>
                      <td>{row.component}</td>
                      <td>{row.description || '—'}</td>
                      <td>{row.make || '—'}</td>
                      <td>{row.qty} {row.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Page>

            {/* Page 11 - Journey and timelines */}
            <Page n={11} meta={meta}>
              <h2 className="pv-h2">Your solar journey</h2>
              <div className="pv-steps">
                {JOURNEY.map((label, i) => (
                  <div className="pv-step" key={label}><i>{i + 1}</i>{label}</div>
                ))}
              </div>

              <h3 className="pv-h3" style={{ marginTop: 28 }}>Project delivery timeline</h3>
              <table className="pv-tbl">
                <thead><tr><th>Stage</th><th>Target duration</th></tr></thead>
                <tbody>
                  {(Array.isArray(timeline.milestones) && timeline.milestones.length
                    ? timeline.milestones
                    : DEFAULT_MILESTONES.map((name) => ({ name, duration: 'As agreed at order' }))
                  ).map((m) => (
                    <tr key={m.name}><td>{m.name}</td><td>{m.duration}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="pv-small" style={{ marginTop: 8 }}>
                Timelines start after the agreed payment, complete documents, site readiness and any
                required approvals.
              </p>

              <h3 className="pv-h3">Order cancellation</h3>
              <p className="pv-p" style={{ whiteSpace: 'pre-wrap' }}>
                {timeline.cancellation_terms
                  || 'Cancellation charges, if any, will be stated in the order confirmation.'}
              </p>
            </Page>

            {/* Page 12 - Closing */}
            <Page n={12} meta={meta}>
              <div className="pv-cover" style={{ paddingTop: 60 }}>
                <div className="pv-logo-wrap"><Logo height={52} /></div>
                <p className="pv-tag">Thank you</p>
                <h1 className="pv-big" style={{ fontSize: 34 }}>Your partner for a simpler<br />solar journey</h1>

                <div className="pv-box" style={{ textAlign: 'center' }}>
                  <b>Prepared by</b>
                  {partner.logo_url && <img className="pv-partner-logo" src={partner.logo_url} alt="Partner logo" />}
                  <span>{partner.company_name || '—'}</span>
                  <div className="pv-p" style={{ margin: '6px 0 0' }}>
                    {partner.contact_name}<br />{partner.phone}<br />{partner.email}
                  </div>
                </div>

                <p className="pv-p" style={{ marginTop: 22 }}>
                  solarhues.com · {CONTACT_EMAIL}
                </p>
                <p className="pv-small">
                  Proposal {meta.number} · Issued {meta.issue} · Valid until {formatDate(draft.valid_until)}
                </p>
              </div>
            </Page>
          </div>
        </>
      )}
    </div>
  );
}
