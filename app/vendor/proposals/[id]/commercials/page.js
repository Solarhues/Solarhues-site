'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';
import Logo from '../../../../../components/Logo';

const STANDARD_ROWS = [
  'Walkways',
  'Module mounting structure',
  'DC cable',
  'AC cable',
  'ACDB',
  'DCDB',
  'Connectors',
  'Lightning arrester',
  'Earthing pit',
  'Earthing strip',
  'Cable conduits',
  'Monitoring solution',
];

const WARRANTY_FIELDS = [
  ['module_workmanship_years', 'Solar panel (workmanship), years'],
  ['module_linear_output_years', 'Solar panel (linear output), years'],
  ['structure_design_life_years', 'Structure design life, years'],
  ['inverter_years', 'Inverter, years'],
  ['cables_years', 'Cables, years'],
  ['switchgear_years', 'Switchgear, years'],
  ['installation_workmanship_years', 'Installation workmanship, years'],
];

let rowCounter = 0;
function newId() {
  rowCounter += 1;
  return `row-${Date.now()}-${rowCounter}`;
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function inr(value) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function buildDefaultRows(sd) {
  const rows = [
    {
      id: newId(),
      locked: true,
      component: 'Modules',
      description: `${sd.module_model || ''} (${sd.module_wattage || ''} W ${sd.module_type || ''})`.trim(),
      make: sd.module_make || '',
      qty: String(sd.module_count || ''),
      unit: 'Nos.',
    },
    {
      id: newId(),
      locked: true,
      component: 'Inverter',
      description: `${sd.inverter_model || ''} (${sd.inverter_rating_kw || ''} kW ${sd.inverter_type || ''})`.trim(),
      make: sd.inverter_make || '',
      qty: String(sd.inverter_count || '1'),
      unit: 'No.',
    },
  ];

  STANDARD_ROWS.forEach((name) => {
    rows.push({
      id: newId(),
      locked: false,
      component: name,
      description: name === 'Module mounting structure' ? sd.structure_type || '' : 'Standard',
      make: '',
      qty: name === 'Walkways' ? '' : '1',
      unit: name === 'Walkways' ? 'm' : 'Lot',
    });
  });

  return rows;
}

export default function CommercialsPage() {
  const params = useParams();
  const proposalId = params.id;
  const { user, loading } = useAuth();

  const [draft, setDraft] = useState(null);
  const [ready, setReady] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [rows, setRows] = useState([]);
  const [price, setPrice] = useState({ base: '', gst_rate: '', notes: '' });
  const [warranty, setWarranty] = useState({
    module_workmanship_years: '',
    module_linear_output_years: '',
    structure_design_life_years: '',
    inverter_years: '',
    cables_years: '',
    switchgear_years: '',
    installation_workmanship_years: '',
    amc_status: 'Optional',
    amc_description: '',
    amc_price: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !proposalId) return;
    let active = true;

    async function load() {
      const { data, error: loadError } = await supabase
        .from('partner_proposals')
        .select('*')
        .eq('id', proposalId)
        .maybeSingle();

      if (!active) return;

      if (loadError || !data) {
        setNotFound(true);
        setReady(true);
        return;
      }

      setDraft(data);

      const sd = data.system_design || {};
      if (Array.isArray(data.bom_items) && data.bom_items.length > 0) {
        setRows(data.bom_items.map((r) => ({ ...r, id: r.id || newId() })));
      } else if (sd.module_count) {
        setRows(buildDefaultRows(sd));
      }

      setPrice({
        base: data.total_amount != null ? String(data.total_amount) : '',
        gst_rate:
          data.warranty_terms && data.warranty_terms.gst_rate != null
            ? String(data.warranty_terms.gst_rate)
            : '',
        notes: data.warranty_terms && data.warranty_terms.price_notes ? data.warranty_terms.price_notes : '',
      });

      if (data.warranty_terms) {
        setWarranty((prev) => {
          const next = { ...prev };
          Object.keys(prev).forEach((key) => {
            const saved = data.warranty_terms[key];
            if (saved !== undefined && saved !== null) next[key] = String(saved);
          });
          return next;
        });
      }

      setReady(true);
    }

    load();
    return () => {
      active = false;
    };
  }, [user, proposalId]);

  const sd = draft && draft.system_design ? draft.system_design : {};
  const designSaved = Boolean(sd.module_count);
  const locked = draft && draft.status !== 'draft';

  const totals = useMemo(() => {
    const base = num(price.base);
    const gst = (base * num(price.gst_rate)) / 100;
    const total = base + gst;
    const kwp = num(sd.dc_capacity_kwp);
    return { base, gst, total, perKwp: kwp > 0 ? base / kwp : 0 };
  }, [price, sd]);

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: newId(), locked: false, component: '', description: '', make: '', qty: '1', unit: 'Lot' },
    ]);
  }

  function updateWarranty(field, value) {
    setWarranty((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (rows.length === 0) return 'The bill of materials is empty.';

    for (const row of rows) {
      if (!row.component.trim()) return 'Every bill of materials row needs a component name.';
      if (!(num(row.qty) > 0)) return `Please enter a quantity for "${row.component}".`;
      if (!row.unit.trim()) return `Please enter a unit for "${row.component}".`;
    }

    const modules = rows.find((r) => r.component === 'Modules');
    const inverter = rows.find((r) => r.component === 'Inverter');
    if (!modules || num(modules.qty) !== num(sd.module_count)) {
      return `Module quantity must match the saved design (${sd.module_count} panels).`;
    }
    if (!inverter || num(inverter.qty) !== num(sd.inverter_count)) {
      return `Inverter quantity must match the saved design (${sd.inverter_count}).`;
    }

    if (!(num(price.base) > 0)) return 'Please enter the project price before GST.';
    if (price.gst_rate === '' || num(price.gst_rate) < 0 || num(price.gst_rate) > 40) {
      return 'Please enter the GST rate as a percentage between 0 and 40.';
    }

    for (const [key, label] of WARRANTY_FIELDS) {
      const value = warranty[key];
      if (value === '' || num(value) < 0 || num(value) > 50) {
        return `Please enter a valid value for "${label}" (0 to 50).`;
      }
    }

    if (num(warranty.module_linear_output_years) < num(warranty.module_workmanship_years)) {
      return 'Linear output warranty should not be shorter than the panel workmanship warranty.';
    }

    if (warranty.amc_status !== 'Not included' && !warranty.amc_description.trim()) {
      return 'Please describe what the maintenance coverage includes.';
    }
    if (warranty.amc_status === 'Optional' && warranty.amc_price !== '' && num(warranty.amc_price) < 0) {
      return 'Maintenance price cannot be negative.';
    }

    return '';
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);

    const gst = Math.round(totals.gst * 100) / 100;
    const base = Math.round(totals.base * 100) / 100;

    const warrantyTerms = {
      ...(draft.warranty_terms || {}),
      ...Object.fromEntries(WARRANTY_FIELDS.map(([key]) => [key, num(warranty[key])])),
      amc_status: warranty.amc_status,
      amc_description: warranty.amc_status === 'Not included' ? '' : warranty.amc_description.trim(),
      amc_price: warranty.amc_price === '' ? null : num(warranty.amc_price),
      gst_rate: num(price.gst_rate),
      price_notes: price.notes.trim(),
    };

    const { error: updateError } = await supabase
      .from('partner_proposals')
      .update({
        bom_items: rows.map(({ id, locked, ...rest }) => ({ ...rest, locked: Boolean(locked) })),
        warranty_terms: warrantyTerms,
        total_amount: base,
        gst_amount: gst,
        total_amount_including_gst: Math.round((base + gst) * 100) / 100,
      })
      .eq('id', proposalId);

    if (updateError) {
      setError(`Could not save: ${updateError.message}`);
      setSaving(false);
      return;
    }

    setMessage('Bill of materials, price and warranties saved.');
    setSaving(false);
  }

  return (
    <div className="cm-page">
      <style>{`
        .cm-page{ min-height:100vh; background:#1e293b; color:#fff; font-family:Inter,-apple-system,sans-serif; }
        .cm-header{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding:14px 32px; border-bottom:1px solid rgba(255,255,255,0.08); }
        .cm-link{ color:#cbd5e1; text-decoration:none; font-size:14px; font-weight:600; }
        .cm-main{ max-width:960px; margin:0 auto; padding:40px 20px 80px; }
        .cm-eyebrow{ margin:0 0 8px; color:#6ee7b7; font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
        .cm-title{ margin:0 0 6px; font:700 30px "Space Grotesk",Inter,sans-serif; }
        .cm-sub{ margin:0 0 22px; color:#94a3b8; font-size:14px; line-height:1.6; }
        .cm-chips{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:22px; }
        .cm-chip{ padding:6px 12px; border-radius:999px; background:rgba(5,150,105,0.18); color:#6ee7b7; font-size:12px; font-weight:700; }
        .cm-card{ margin-bottom:20px; padding:24px; border:1px solid rgba(255,255,255,0.08); border-radius:14px; background:rgba(255,255,255,0.03); }
        .cm-card h2{ margin:0 0 4px; font:700 18px "Space Grotesk",Inter,sans-serif; }
        .cm-hint{ margin:0 0 18px; color:#94a3b8; font-size:13px; line-height:1.5; }
        .cm-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media (max-width:640px){ .cm-grid{ grid-template-columns:1fr; } .cm-header{ padding:12px 20px; } }
        .cm-field{ display:flex; flex-direction:column; }
        .cm-field.full{ grid-column:1 / -1; }
        .cm-label{ margin-bottom:6px; color:#94a3b8; font-size:11.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
        .cm-input, .cm-select, .cm-textarea{ width:100%; padding:11px 12px; border:1px solid rgba(255,255,255,0.18); border-radius:10px; background:rgba(255,255,255,0.06); color:#fff; font:600 14px Inter,sans-serif; }
        .cm-textarea{ min-height:80px; resize:vertical; line-height:1.5; }
        .cm-select option{ color:#1e293b; }
        .cm-input:focus, .cm-select:focus, .cm-textarea:focus{ outline:2px solid #facc15; outline-offset:1px; border-color:transparent; }
        .cm-input:disabled{ opacity:.7; }
        .cm-table-wrap{ overflow-x:auto; }
        .cm-table{ width:100%; min-width:760px; border-collapse:separate; border-spacing:0 8px; }
        .cm-table th{ text-align:left; color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; padding:0 6px 4px; }
        .cm-table td{ padding:0 6px 0 0; vertical-align:middle; }
        .cm-table td:last-child{ width:36px; }
        .cm-remove{ border:none; background:rgba(239,68,68,0.15); color:#fca5a5; width:30px; height:30px; border-radius:8px; cursor:pointer; font-size:16px; }
        .cm-add{ margin-top:6px; padding:10px 14px; border:1px dashed rgba(255,255,255,0.3); border-radius:10px; background:transparent; color:#cbd5e1; font:600 13px Inter,sans-serif; cursor:pointer; }
        .cm-totals{ margin-top:16px; padding:16px; border-radius:12px; background:rgba(5,150,105,0.1); border:1px solid rgba(5,150,105,0.3); }
        .cm-total-row{ display:flex; justify-content:space-between; font-size:14px; color:#cbd5e1; padding:3px 0; }
        .cm-total-row.big{ margin-top:6px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.12); font-size:20px; font-weight:800; color:#fff; }
        .cm-btn{ padding:14px 22px; border:none; border-radius:10px; background:#facc15; color:#1e293b; font:700 14.5px Inter,sans-serif; cursor:pointer; }
        .cm-btn:disabled{ opacity:.6; cursor:not-allowed; }
        .cm-error{ margin-bottom:16px; padding:10px 12px; border-radius:8px; background:rgba(239,68,68,0.12); color:#fca5a5; font-size:13px; font-weight:600; }
        .cm-ok{ margin-bottom:16px; padding:10px 12px; border-radius:8px; background:rgba(5,150,105,0.15); color:#6ee7b7; font-size:13px; font-weight:600; }
        .cm-note{ padding:20px; border:1px solid rgba(250,204,21,0.3); border-radius:12px; background:rgba(250,204,21,0.08); color:#fde68a; font-size:14px; line-height:1.6; }
      `}</style>

      <header className="cm-header">
        <Logo height={34} />
        <Link className="cm-link" href={`/vendor/proposals/${proposalId}/design`}>← System design</Link>
      </header>

      <main className="cm-main">
        <p className="cm-eyebrow">Proposal builder</p>
        <h1 className="cm-title">Bill of materials, price and warranties</h1>
        <p className="cm-sub">
          Review the equipment list, enter the project price, and record the warranty terms from your
          manufacturers.
        </p>

        {(loading || (user && !ready)) && <div className="cm-note">Loading your proposal…</div>}

        {!loading && !user && (
          <div className="cm-note">
            Please <Link href="/vendor-login" style={{ color: '#facc15' }}>sign in</Link> to continue.
          </div>
        )}

        {!loading && user && ready && notFound && (
          <div className="cm-note">This proposal was not found, or you do not have access to it.</div>
        )}

        {!loading && user && ready && draft && !designSaved && (
          <div className="cm-note">
            Please save the system design first.{' '}
            <Link href={`/vendor/proposals/${proposalId}/design`} style={{ color: '#facc15' }}>
              Go to system design
            </Link>
            .
          </div>
        )}

        {!loading && user && ready && draft && designSaved && (
          <form onSubmit={save} noValidate>
            <div className="cm-chips">
              <span className="cm-chip">Proposal {draft.proposal_number}</span>
              <span className="cm-chip">{sd.dc_capacity_kwp} kWp</span>
              <span className="cm-chip">Status: {draft.status}</span>
            </div>
<p style={{ margin: '0 0 18px' }}>
  <Link
    href={`/vendor/proposals/${proposalId}/preview`}
    style={{ color: '#facc15', fontWeight: 700, textDecoration: 'none' }}
  >
    Next: preview the proposal →
  </Link>
</p>

            {locked && (
              <div className="cm-note" style={{ marginBottom: 20 }}>
                This proposal is no longer a draft, so it cannot be edited here.
              </div>
            )}

            {error && <div className="cm-error" role="alert">{error}</div>}
            {message && <div className="cm-ok" role="status">{message}</div>}

            <fieldset disabled={locked || saving} style={{ border: 0, padding: 0, margin: 0 }}>
              <section className="cm-card">
                <h2>Bill of materials</h2>
                <p className="cm-hint">
                  Modules and inverter come from your saved design and must keep the same quantities. Edit
                  descriptions and makes, and add or remove the other rows as needed.
                </p>

                <div className="cm-table-wrap">
                  <table className="cm-table">
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Description / model</th>
                        <th>Make</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <input className="cm-input" aria-label="Component" value={row.component}
                              disabled={row.locked}
                              onChange={(e) => updateRow(row.id, 'component', e.target.value)} />
                          </td>
                          <td>
                            <input className="cm-input" aria-label="Description" value={row.description}
                              onChange={(e) => updateRow(row.id, 'description', e.target.value)} />
                          </td>
                          <td>
                            <input className="cm-input" aria-label="Make" value={row.make}
                              onChange={(e) => updateRow(row.id, 'make', e.target.value)} />
                          </td>
                          <td style={{ width: 90 }}>
                            <input className="cm-input" aria-label="Quantity" type="number" min="0" step="any"
                              value={row.qty} onChange={(e) => updateRow(row.id, 'qty', e.target.value)} />
                          </td>
                          <td style={{ width: 90 }}>
                            <input className="cm-input" aria-label="Unit" value={row.unit}
                              onChange={(e) => updateRow(row.id, 'unit', e.target.value)} />
                          </td>
                          <td>
                            {!row.locked && (
                              <button type="button" className="cm-remove" aria-label={`Remove ${row.component}`}
                                onClick={() => removeRow(row.id)}>×</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="cm-add" onClick={addRow}>+ Add a row</button>
              </section>

              <section className="cm-card">
                <h2>Price</h2>
                <p className="cm-hint">
                  Enter the total project price before GST. Confirm the correct GST rate for this project
                  with your accountant.
                </p>
                <div className="cm-grid">
                  <div className="cm-field">
                    <label className="cm-label" htmlFor="cm-base">Project price before GST (₹)</label>
                    <input id="cm-base" className="cm-input" type="number" min="1" step="any"
                      value={price.base} onChange={(e) => setPrice((p) => ({ ...p, base: e.target.value }))} />
                  </div>
                  <div className="cm-field">
                    <label className="cm-label" htmlFor="cm-gst">GST rate (%)</label>
                    <input id="cm-gst" className="cm-input" type="number" min="0" max="40" step="any"
                      value={price.gst_rate}
                      onChange={(e) => setPrice((p) => ({ ...p, gst_rate: e.target.value }))} />
                  </div>
                  <div className="cm-field full">
                    <label className="cm-label" htmlFor="cm-notes">What the price includes or excludes (optional)</label>
                    <textarea id="cm-notes" className="cm-textarea" value={price.notes}
                      placeholder="For example: net-metering charges excluded, civil work included…"
                      onChange={(e) => setPrice((p) => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>

                <div className="cm-totals">
                  <div className="cm-total-row"><span>Price before GST</span><span>{inr(totals.base)}</span></div>
                  <div className="cm-total-row"><span>GST ({num(price.gst_rate)}%)</span><span>{inr(totals.gst)}</span></div>
                  <div className="cm-total-row big"><span>Total</span><span>{inr(totals.total)}</span></div>
                  {totals.perKwp > 0 && (
                    <div className="cm-total-row" style={{ marginTop: 8 }}>
                      <span>Price per kWp (before GST)</span><span>{inr(totals.perKwp)}</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="cm-card">
                <h2>Warranty and services</h2>
                <p className="cm-hint">
                  Enter the years stated in your manufacturers' warranty documents. These print on the
                  proposal exactly as entered.
                </p>
                <div className="cm-grid">
                  {WARRANTY_FIELDS.map(([key, label]) => (
                    <div className="cm-field" key={key}>
                      <label className="cm-label" htmlFor={`cm-${key}`}>{label}</label>
                      <input id={`cm-${key}`} className="cm-input" type="number" min="0" max="50" step="any"
                        value={warranty[key]} onChange={(e) => updateWarranty(key, e.target.value)} />
                    </div>
                  ))}
                </div>

                <div className="cm-grid" style={{ marginTop: 18 }}>
                  <div className="cm-field">
                    <label className="cm-label" htmlFor="cm-amc">Annual maintenance coverage</label>
                    <select id="cm-amc" className="cm-select" value={warranty.amc_status}
                      onChange={(e) => updateWarranty('amc_status', e.target.value)}>
                      <option value="Included">Included</option>
                      <option value="Optional">Optional</option>
                      <option value="Not included">Not included</option>
                    </select>
                  </div>
                  {warranty.amc_status === 'Optional' && (
                    <div className="cm-field">
                      <label className="cm-label" htmlFor="cm-amcp">Maintenance price per year (₹, optional)</label>
                      <input id="cm-amcp" className="cm-input" type="number" min="0" step="any"
                        value={warranty.amc_price} onChange={(e) => updateWarranty('amc_price', e.target.value)} />
                    </div>
                  )}
                  {warranty.amc_status !== 'Not included' && (
                    <div className="cm-field full">
                      <label className="cm-label" htmlFor="cm-amcd">What the maintenance includes</label>
                      <textarea id="cm-amcd" className="cm-textarea" value={warranty.amc_description}
                        placeholder="Number of visits, cleaning, inspection, response time…"
                        onChange={(e) => updateWarranty('amc_description', e.target.value)} />
                    </div>
                  )}
                </div>
              </section>
            </fieldset>

            {!locked && (
              <button type="submit" className="cm-btn" disabled={saving}>
                {saving ? 'Saving…' : 'Save bill of materials, price and warranties'}
              </button>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
