'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';
import Logo from '../../../../../components/Logo';

const EMPTY_FORM = {
  module_type: '',
  module_make: '',
  module_model: '',
  module_wattage: '',
  module_length_mm: '',
  module_width_mm: '',
  module_count: '',
  inverter_type: '',
  inverter_make: '',
  inverter_model: '',
  inverter_rating_kw: '',
  inverter_count: '1',
  structure_type: '',
  azimuth_deg: '180',
  tilt_deg: '22',
  shading_loss_percent: '0',
  yield_kwh_per_kwp: '1450',
};

const SQM_PER_KW = 9.29; // planning rule: about 100 sq. ft of clear roof per kW

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function SystemDesignPage() {
  const params = useParams();
  const proposalId = params.id;
  const { user, loading } = useAuth();

  const [draft, setDraft] = useState(null);
  const [catalog, setCatalog] = useState({ module: [], inverter: [], structure: [] });
  const [form, setForm] = useState(EMPTY_FORM);
  const [ready, setReady] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !proposalId) return;
    let active = true;

    async function load() {
      const [draftRes, catalogRes] = await Promise.all([
        supabase.from('partner_proposals').select('*').eq('id', proposalId).maybeSingle(),
        supabase
          .from('equipment_catalog')
          .select('category, manufacturer, model_number, description')
          .in('category', ['module', 'inverter', 'structure'])
          .eq('is_active', true)
          .order('description'),
      ]);

      if (!active) return;

      if (draftRes.error || !draftRes.data) {
        setNotFound(true);
        setReady(true);
        return;
      }

      const grouped = { module: [], inverter: [], structure: [] };
      (catalogRes.data || []).forEach((item) => {
        if (grouped[item.category]) grouped[item.category].push(item);
      });

      setCatalog(grouped);
      setDraft(draftRes.data);

      const saved = draftRes.data.system_design || {};
      const merged = { ...EMPTY_FORM };
      Object.keys(EMPTY_FORM).forEach((key) => {
        if (saved[key] !== undefined && saved[key] !== null) merged[key] = String(saved[key]);
      });
      setForm(merged);
      setReady(true);
    }

    load();
    return () => {
      active = false;
    };
  }, [user, proposalId]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const calc = useMemo(() => {
    const wattage = num(form.module_wattage);
    const count = num(form.module_count);
    const invKw = num(form.inverter_rating_kw) * num(form.inverter_count);
    const kwp = (wattage * count) / 1000;
    const moduleAreaM2 = (count * num(form.module_length_mm) * num(form.module_width_mm)) / 1e6;
    const roofNeededM2 = kwp * SQM_PER_KW;
    const dcAc = invKw > 0 ? kwp / invKw : 0;
    const annual = kwp * num(form.yield_kwh_per_kwp) * (1 - num(form.shading_loss_percent) / 100);
    const usable = draft && draft.customer_site ? num(draft.customer_site.usable_roof_area_m2) : 0;

    const warnings = [];
    if (kwp > 0 && invKw > 0 && dcAc > 1.5) {
      warnings.push('DC to AC ratio is above 1.5. The inverter may clip output on sunny days.');
    }
    if (kwp > 0 && invKw > 0 && dcAc < 0.8) {
      warnings.push('The inverter is much larger than the panel array. Check the inverter rating.');
    }
    if (usable > 0 && roofNeededM2 > usable) {
      warnings.push(
        `Planning estimate needs about ${roofNeededM2.toFixed(1)} m² of clear roof, but only ${usable} m² was entered.`
      );
    }
    if (usable > 0 && moduleAreaM2 > usable) {
      warnings.push('The panels alone are larger than the usable roof area.');
    }

    return { kwp, moduleAreaM2, roofNeededM2, dcAc, annual, invKw, usable, warnings };
  }, [form, draft]);

  function validate() {
    if (!form.module_type) return 'Please choose a panel technology.';
    if (!form.module_make.trim() || !form.module_model.trim()) return 'Please enter the panel make and model.';
    const wattage = num(form.module_wattage);
    if (!(wattage >= 100 && wattage <= 800)) return 'Panel wattage should be between 100 W and 800 W.';
    const count = num(form.module_count);
    if (!Number.isInteger(count) || count < 1) return 'Number of panels must be a whole number of 1 or more.';
    if (!(num(form.module_length_mm) > 0) || !(num(form.module_width_mm) > 0)) {
      return 'Please enter the panel length and width in millimetres.';
    }
    if (!form.inverter_type) return 'Please choose an inverter type.';
    if (!form.inverter_make.trim() || !form.inverter_model.trim()) return 'Please enter the inverter make and model.';
    if (!(num(form.inverter_rating_kw) > 0)) return 'Please enter the inverter rating in kW.';
    const invCount = num(form.inverter_count);
    if (!Number.isInteger(invCount) || invCount < 1) return 'Number of inverters must be a whole number of 1 or more.';
    if (!form.structure_type) return 'Please choose a structure type.';
    const az = num(form.azimuth_deg);
    if (az < 0 || az > 360) return 'Azimuth must be between 0 and 360 degrees.';
    const tilt = num(form.tilt_deg);
    if (tilt < 0 || tilt > 90) return 'Tilt must be between 0 and 90 degrees.';
    const shade = num(form.shading_loss_percent);
    if (shade < 0 || shade > 60) return 'Shading loss must be between 0% and 60%.';
    if (!(num(form.yield_kwh_per_kwp) > 0)) return 'Please enter an expected yield in kWh per kWp per year.';
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

    const systemDesign = {
      ...form,
      module_wattage: num(form.module_wattage),
      module_count: num(form.module_count),
      module_length_mm: num(form.module_length_mm),
      module_width_mm: num(form.module_width_mm),
      inverter_rating_kw: num(form.inverter_rating_kw),
      inverter_count: num(form.inverter_count),
      azimuth_deg: num(form.azimuth_deg),
      tilt_deg: num(form.tilt_deg),
      shading_loss_percent: num(form.shading_loss_percent),
      yield_kwh_per_kwp: num(form.yield_kwh_per_kwp),
      dc_capacity_kwp: Math.round(calc.kwp * 100) / 100,
      inverter_total_kw: Math.round(calc.invKw * 100) / 100,
      dc_ac_ratio: Math.round(calc.dcAc * 100) / 100,
      module_area_m2: Math.round(calc.moduleAreaM2 * 10) / 10,
      roof_area_needed_m2: Math.round(calc.roofNeededM2 * 10) / 10,
      annual_generation_kwh: Math.round(calc.annual),
      saved_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('partner_proposals')
      .update({ system_design: systemDesign })
      .eq('id', proposalId);

    if (updateError) {
      setError(`Could not save the design: ${updateError.message}`);
      setSaving(false);
      return;
    }

    setMessage('System design saved to the draft.');
    setSaving(false);
  }

  const site = draft && draft.customer_site ? draft.customer_site : {};
  const locked = draft && draft.status !== 'draft';

  function renderOptions(list) {
    return list.map((item) => (
      <option key={`${item.category}-${item.model_number}`} value={item.model_number}>
        {item.description}
      </option>
    ));
  }

  return (
    <div className="sd-page">
      <style>{`
        .sd-page{ min-height:100vh; background:#1e293b; color:#fff; font-family:Inter,-apple-system,sans-serif; }
        .sd-header{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding:14px 32px; border-bottom:1px solid rgba(255,255,255,0.08); }
        .sd-header a.sd-link{ color:#cbd5e1; text-decoration:none; font-size:14px; font-weight:600; }
        .sd-main{ max-width:860px; margin:0 auto; padding:40px 20px 80px; }
        .sd-eyebrow{ margin:0 0 8px; color:#6ee7b7; font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
        .sd-title{ margin:0 0 6px; font:700 30px "Space Grotesk",Inter,sans-serif; }
        .sd-sub{ margin:0 0 22px; color:#94a3b8; font-size:14px; line-height:1.6; }
        .sd-chips{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:22px; }
        .sd-chip{ padding:6px 12px; border-radius:999px; background:rgba(5,150,105,0.18); color:#6ee7b7; font-size:12px; font-weight:700; }
        .sd-card{ margin-bottom:20px; padding:24px; border:1px solid rgba(255,255,255,0.08); border-radius:14px; background:rgba(255,255,255,0.03); }
        .sd-card h2{ margin:0 0 4px; font:700 18px "Space Grotesk",Inter,sans-serif; }
        .sd-hint{ margin:0 0 18px; color:#94a3b8; font-size:13px; line-height:1.5; }
        .sd-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media (max-width:640px){ .sd-grid{ grid-template-columns:1fr; } .sd-header{ padding:12px 20px; } }
        .sd-field{ display:flex; flex-direction:column; }
        .sd-field.full{ grid-column:1 / -1; }
        .sd-label{ margin-bottom:6px; color:#94a3b8; font-size:11.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
        .sd-input, .sd-select{ width:100%; padding:12px 13px; border:1px solid rgba(255,255,255,0.18); border-radius:10px; background:rgba(255,255,255,0.06); color:#fff; font:600 14px Inter,sans-serif; }
        .sd-select option{ color:#1e293b; }
        .sd-input:focus, .sd-select:focus{ outline:2px solid #facc15; outline-offset:1px; border-color:transparent; }
        .sd-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media (max-width:640px){ .sd-stats{ grid-template-columns:1fr 1fr; } }
        .sd-stat{ padding:14px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; background:rgba(5,150,105,0.1); }
        .sd-stat-label{ color:#6ee7b7; font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; }
        .sd-stat-value{ margin-top:6px; font:800 20px "Space Grotesk",Inter,sans-serif; }
        .sd-stat-value span{ color:#94a3b8; font-size:12px; font-weight:600; }
        .sd-warn{ margin-top:14px; padding:10px 12px; border-radius:8px; background:rgba(250,204,21,0.1); color:#fde68a; font-size:13px; font-weight:600; line-height:1.5; }
        .sd-btn{ padding:14px 22px; border:none; border-radius:10px; background:#facc15; color:#1e293b; font:700 14.5px Inter,sans-serif; cursor:pointer; }
        .sd-btn:disabled{ opacity:.6; cursor:not-allowed; }
        .sd-error{ margin-bottom:16px; padding:10px 12px; border-radius:8px; background:rgba(239,68,68,0.12); color:#fca5a5; font-size:13px; font-weight:600; }
        .sd-ok{ margin-bottom:16px; padding:10px 12px; border-radius:8px; background:rgba(5,150,105,0.15); color:#6ee7b7; font-size:13px; font-weight:600; }
        .sd-note{ padding:20px; border:1px solid rgba(250,204,21,0.3); border-radius:12px; background:rgba(250,204,21,0.08); color:#fde68a; font-size:14px; line-height:1.6; }
        .sd-site{ display:grid; grid-template-columns:1fr 1fr; gap:8px 18px; font-size:13px; color:#cbd5e1; }
        .sd-site b{ color:#94a3b8; font-weight:600; }
      `}</style>

      <header className="sd-header">
        <Logo height={34} />
        <Link className="sd-link" href="/vendor/proposals/new">← Partner details</Link>
      </header>

      <main className="sd-main">
        <p className="sd-eyebrow">Proposal builder</p>
        <h1 className="sd-title">System design</h1>
        <p className="sd-sub">
          Choose the equipment and confirm the layout inputs. Capacity and yield update as you type.
        </p>

        {(loading || (user && !ready)) && <div className="sd-note">Loading your proposal…</div>}

        {!loading && !user && (
          <div className="sd-note">
            Please <Link href="/vendor-login" style={{ color: '#facc15' }}>sign in</Link> to continue.
          </div>
        )}

        {!loading && user && ready && notFound && (
          <div className="sd-note">
            This proposal was not found, or you do not have access to it.{' '}
            <Link href="/vendor/proposals/new" style={{ color: '#facc15' }}>Start a new draft</Link>.
          </div>
        )}

        {!loading && user && ready && draft && (
          <form onSubmit={save} noValidate>
            <div className="sd-chips">
              <span className="sd-chip">Proposal {draft.proposal_number}</span>
              <span className="sd-chip">Status: {draft.status}</span>
            </div>
         <p style={{ margin: '0 0 18px' }}>
  <Link
    href={`/vendor/proposals/${proposalId}/commercials`}
    style={{ color: '#facc15', fontWeight: 700, textDecoration: 'none' }}
  >
    Next: bill of materials, price and warranties →
  </Link>
</p>

            {locked && (
              <div className="sd-note" style={{ marginBottom: 20 }}>
                This proposal is no longer a draft, so the design cannot be edited here.
              </div>
            )}

            {error && <div className="sd-error" role="alert">{error}</div>}
            {message && <div className="sd-ok" role="status">{message}</div>}

            <section className="sd-card">
              <h2>Site summary</h2>
              <p className="sd-hint">From the partner and site details step.</p>
              <div className="sd-site">
                <span><b>Customer: </b>{site.customer_name || '—'}</span>
                <span><b>Location: </b>{[site.locality, site.city, site.state].filter(Boolean).join(', ') || '—'}</span>
                <span><b>Building type: </b>{site.building_type || '—'}</span>
                <span><b>Roof type: </b>{site.roof_type || '—'}</span>
                <span><b>Usable roof area: </b>{site.usable_roof_area_m2 ? `${site.usable_roof_area_m2} m²` : '—'}</span>
                <span><b>Coordinates: </b>{site.latitude && site.longitude ? `${site.latitude}, ${site.longitude}` : '—'}</span>
              </div>
            </section>

            <fieldset disabled={locked || saving} style={{ border: 0, padding: 0, margin: 0 }}>
              <section className="sd-card">
                <h2>Solar panels</h2>
                <p className="sd-hint">Use the exact make, model and datasheet values of the panel you will supply.</p>
                <div className="sd-grid">
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-mtype">Panel technology</label>
                    <select id="sd-mtype" className="sd-select" value={form.module_type}
                      onChange={(e) => update('module_type', e.target.value)}>
                      <option value="">Select…</option>
                      {renderOptions(catalog.module)}
                    </select>
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-mmake">Make</label>
                    <input id="sd-mmake" className="sd-input" value={form.module_make}
                      onChange={(e) => update('module_make', e.target.value)} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-mmodel">Model</label>
                    <input id="sd-mmodel" className="sd-input" value={form.module_model}
                      onChange={(e) => update('module_model', e.target.value)} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-mw">Wattage per panel (W)</label>
                    <input id="sd-mw" className="sd-input" type="number" min="100" max="800" step="any"
                      placeholder="e.g. 550" value={form.module_wattage}
                      onChange={(e) => update('module_wattage', e.target.value)} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-ml">Length (mm)</label>
                    <input id="sd-ml" className="sd-input" type="number" min="1" step="any"
                      placeholder="e.g. 2278" value={form.module_length_mm}
                      onChange={(e) => update('module_length_mm', e.target.value)} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-mwd">Width (mm)</label>
                    <input id="sd-mwd" className="sd-input" type="number" min="1" step="any"
                      placeholder="e.g. 1134" value={form.module_width_mm}
                      onChange={(e) => update('module_width_mm', e.target.value)} />
                  </div>
                  <div className="sd-field full">
                    <label className="sd-label" htmlFor="sd-mc">Number of panels</label>
                    <input id="sd-mc" className="sd-input" type="number" min="1" step="1"
                      placeholder="e.g. 12" value={form.module_count}
                      onChange={(e) => update('module_count', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="sd-card">
                <h2>Inverter</h2>
                <div className="sd-grid" style={{ marginTop: 14 }}>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-itype">Inverter type</label>
                    <select id="sd-itype" className="sd-select" value={form.inverter_type}
                      onChange={(e) => update('inverter_type', e.target.value)}>
                      <option value="">Select…</option>
                      {renderOptions(catalog.inverter)}
                    </select>
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-imake">Make</label>
                    <input id="sd-imake" className="sd-input" value={form.inverter_make}
                      onChange={(e) => update('inverter_make', e.target.value)} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-imodel">Model</label>
                    <input id="sd-imodel" className="sd-input" value={form.inverter_model}
                      onChange={(e) => update('inverter_model', e.target.value)} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-ikw">Rating per inverter (kW)</label>
                    <input id="sd-ikw" className="sd-input" type="number" min="0.1" step="any"
                      placeholder="e.g. 6" value={form.inverter_rating_kw}
                      onChange={(e) => update('inverter_rating_kw', e.target.value)} />
                  </div>
                  <div className="sd-field full">
                    <label className="sd-label" htmlFor="sd-ic">Number of inverters</label>
                    <input id="sd-ic" className="sd-input" type="number" min="1" step="1"
                      value={form.inverter_count}
                      onChange={(e) => update('inverter_count', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="sd-card">
                <h2>Structure and orientation</h2>
                <div className="sd-grid" style={{ marginTop: 14 }}>
                  <div className="sd-field full">
                    <label className="sd-label" htmlFor="sd-struct">Structure type</label>
                    <select id="sd-struct" className="sd-select" value={form.structure_type}
                      onChange={(e) => update('structure_type', e.target.value)}>
                      <option value="">Select…</option>
                      {renderOptions(catalog.structure)}
                    </select>
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-az">Azimuth (°, 180 = south)</label>
                    <input id="sd-az" className="sd-input" type="number" min="0" max="360" step="any"
                      value={form.azimuth_deg} onChange={(e) => update('azimuth_deg', e.target.value)} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-tilt">Tilt (°)</label>
                    <input id="sd-tilt" className="sd-input" type="number" min="0" max="90" step="any"
                      value={form.tilt_deg} onChange={(e) => update('tilt_deg', e.target.value)} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-shade">Estimated shading loss (%)</label>
                    <input id="sd-shade" className="sd-input" type="number" min="0" max="60" step="any"
                      value={form.shading_loss_percent}
                      onChange={(e) => update('shading_loss_percent', e.target.value)} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label" htmlFor="sd-yield">Expected yield (kWh per kWp per year)</label>
                    <input id="sd-yield" className="sd-input" type="number" min="1" step="any"
                      value={form.yield_kwh_per_kwp}
                      onChange={(e) => update('yield_kwh_per_kwp', e.target.value)} />
                  </div>
                </div>
                <p className="sd-hint" style={{ marginTop: 14, marginBottom: 0 }}>
                  The yield is a planning assumption you can edit. A later step can replace it with a
                  location-based calculation.
                </p>
              </section>
            </fieldset>

            <section className="sd-card">
              <h2>Calculated summary</h2>
              <p className="sd-hint">Updates automatically from your entries.</p>
              <div className="sd-stats">
                <div className="sd-stat">
                  <div className="sd-stat-label">DC capacity</div>
                  <div className="sd-stat-value">{calc.kwp.toFixed(2)} <span>kWp</span></div>
                </div>
                <div className="sd-stat">
                  <div className="sd-stat-label">Inverter total</div>
                  <div className="sd-stat-value">{calc.invKw.toFixed(1)} <span>kW</span></div>
                </div>
                <div className="sd-stat">
                  <div className="sd-stat-label">DC / AC ratio</div>
                  <div className="sd-stat-value">{calc.dcAc.toFixed(2)}</div>
                </div>
                <div className="sd-stat">
                  <div className="sd-stat-label">Panel area</div>
                  <div className="sd-stat-value">{calc.moduleAreaM2.toFixed(1)} <span>m²</span></div>
                </div>
                <div className="sd-stat">
                  <div className="sd-stat-label">Roof needed (planning)</div>
                  <div className="sd-stat-value">{calc.roofNeededM2.toFixed(1)} <span>m²</span></div>
                </div>
                <div className="sd-stat">
                  <div className="sd-stat-label">Indicative yearly output</div>
                  <div className="sd-stat-value">{Math.round(calc.annual).toLocaleString('en-IN')} <span>kWh</span></div>
                </div>
              </div>
              {calc.warnings.map((text) => (
                <div className="sd-warn" key={text}>{text}</div>
              ))}
            </section>

            {!locked && (
              <button type="submit" className="sd-btn" disabled={saving}>
                {saving ? 'Saving…' : 'Save system design'}
              </button>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
