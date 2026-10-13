'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../providers';
import Logo from '../../../../components/Logo';

const BUILDING_TYPES = ['Residential', 'Commercial', 'Agricultural', 'Society'];
const ROOF_TYPES = ['RCC', 'Tin shed'];

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

export default function NewProposalPage() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState(null);
  const [roleLoaded, setRoleLoaded] = useState(false);

  const [draftId, setDraftId] = useState(null);
  const [proposalNumber, setProposalNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const today = new Date();
  const defaultValid = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [issueDate, setIssueDate] = useState(toDateInput(today));
  const [validUntil, setValidUntil] = useState(toDateInput(defaultValid));

  const [partner, setPartner] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    about: '',
    certifications: '',
    logo_url: '',
  });

  const [site, setSite] = useState({
    customer_name: '',
    locality: '',
    city: '',
    state: '',
    building_type: 'Residential',
    roof_type: 'RCC',
    latitude: '',
    longitude: '',
    usable_roof_area_m2: '',
  });

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (!user) {
        setRoleLoaded(true);
        return;
      }

      const { data, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!active) return;

      if (roleError) {
        console.error('Could not load profile role:', roleError);
      }

      setRole(data ? data.role : null);
      setRoleLoaded(true);
    }

    loadRole();

    return () => {
      active = false;
    };
  }, [user]);

  function updatePartner(field, value) {
    setPartner((prev) => ({ ...prev, [field]: value }));
  }

  function updateSite(field, value) {
    setSite((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file || !user) return;

    setError('');

    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Logo must be a PNG, JPG or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be smaller than 2 MB.');
      return;
    }

    setUploading(true);

    const extension = file.name.split('.').pop().toLowerCase();
    const path = `${user.id}/logo-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('partner-assets')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setError(`Logo upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('partner-assets').getPublicUrl(path);
    updatePartner('logo_url', data.publicUrl);
    setUploading(false);
  }

  function validate() {
    if (!partner.company_name.trim()) return 'Please enter the partner company name.';
    if (!partner.contact_name.trim()) return 'Please enter a contact person.';
    if (!/^[0-9+\-\s]{8,15}$/.test(partner.phone.trim())) return 'Please enter a valid phone number.';
    if (!/^\S+@\S+\.\S+$/.test(partner.email.trim())) return 'Please enter a valid contact email.';
    if (!site.customer_name.trim()) return 'Please enter the customer name.';
    if (!site.city.trim() || !site.state.trim()) return 'Please enter the site city and state.';

    const lat = site.latitude === '' ? null : Number(site.latitude);
    const lng = site.longitude === '' ? null : Number(site.longitude);
    if (lat !== null && (Number.isNaN(lat) || lat < -90 || lat > 90)) return 'Latitude must be between -90 and 90.';
    if (lng !== null && (Number.isNaN(lng) || lng < -180 || lng > 180)) return 'Longitude must be between -180 and 180.';

    const area = site.usable_roof_area_m2 === '' ? null : Number(site.usable_roof_area_m2);
    if (area !== null && !(area > 0)) return 'Usable roof area must be a positive number.';

    if (validUntil < issueDate) return 'Valid-until date cannot be before the issue date.';
    return '';
  }

  async function saveDraft(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);

    const customerSite = {
      ...site,
      latitude: site.latitude === '' ? null : Number(site.latitude),
      longitude: site.longitude === '' ? null : Number(site.longitude),
      usable_roof_area_m2:
        site.usable_roof_area_m2 === '' ? null : Number(site.usable_roof_area_m2),
    };

    const payload = {
      issue_date: issueDate,
      valid_until: validUntil,
      partner_profile: partner,
      customer_site: customerSite,
    };

    if (!draftId) {
      const { data, error: insertError } = await supabase
        .from('partner_proposals')
        .insert({ ...payload, created_by: user.id })
        .select('id, proposal_number')
        .single();

      if (insertError) {
        setError(`Could not save draft: ${insertError.message}`);
        setSaving(false);
        return;
      }

      setDraftId(data.id);
      setProposalNumber(data.proposal_number);
      setMessage(`Draft ${data.proposal_number} saved.`);
    } else {
      const { error: updateError } = await supabase
        .from('partner_proposals')
        .update(payload)
        .eq('id', draftId);

      if (updateError) {
        setError(`Could not update draft: ${updateError.message}`);
        setSaving(false);
        return;
      }

      setMessage(`Draft ${proposalNumber} updated.`);
    }

    setSaving(false);
  }

  const allowed = role === 'vendor' || role === 'admin';

  return (
    <div className="pp-page">
      <style>{`
        .pp-page{ min-height:100vh; background:#1e293b; color:#fff; font-family:Inter,-apple-system,sans-serif; }
        .pp-header{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding:14px 32px; border-bottom:1px solid rgba(255,255,255,0.08); }
        .pp-nav a{ color:#cbd5e1; text-decoration:none; font-size:14px; font-weight:600; }
        .pp-nav a:hover{ color:#facc15; }
        .pp-main{ max-width:820px; margin:0 auto; padding:40px 20px 80px; }
        .pp-eyebrow{ margin:0 0 8px; color:#6ee7b7; font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
        .pp-title{ margin:0 0 6px; font:700 30px "Space Grotesk",Inter,sans-serif; }
        .pp-sub{ margin:0 0 28px; color:#94a3b8; font-size:14px; line-height:1.6; }
        .pp-card{ margin-bottom:20px; padding:24px; border:1px solid rgba(255,255,255,0.08); border-radius:14px; background:rgba(255,255,255,0.03); }
        .pp-card h2{ margin:0 0 4px; font:700 18px "Space Grotesk",Inter,sans-serif; }
        .pp-card .pp-hint{ margin:0 0 18px; color:#94a3b8; font-size:13px; }
        .pp-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media (max-width:640px){ .pp-grid{ grid-template-columns:1fr; } .pp-header{ padding:12px 20px; } }
        .pp-field{ display:flex; flex-direction:column; }
        .pp-field.full{ grid-column:1 / -1; }
        .pp-label{ margin-bottom:6px; color:#94a3b8; font-size:11.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
        .pp-input, .pp-textarea, .pp-select{ width:100%; padding:12px 13px; border:1px solid rgba(255,255,255,0.18); border-radius:10px; background:rgba(255,255,255,0.06); color:#fff; font:600 14px Inter,sans-serif; }
        .pp-textarea{ min-height:96px; resize:vertical; line-height:1.5; }
        .pp-select option{ color:#1e293b; }
        .pp-input:focus, .pp-textarea:focus, .pp-select:focus{ outline:2px solid #facc15; outline-offset:1px; border-color:transparent; }
        .pp-logo-row{ display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
        .pp-logo-preview{ display:flex; align-items:center; justify-content:center; width:120px; height:72px; border-radius:10px; background:#fff; overflow:hidden; }
        .pp-logo-preview img{ max-width:100%; max-height:100%; object-fit:contain; }
        .pp-logo-empty{ color:#64748b; font-size:12px; text-align:center; padding:6px; }
        .pp-btn{ padding:14px 22px; border:none; border-radius:10px; background:#facc15; color:#1e293b; font:700 14.5px Inter,sans-serif; cursor:pointer; }
        .pp-btn:disabled{ opacity:.6; cursor:not-allowed; }
        .pp-error{ margin-bottom:16px; padding:10px 12px; border-radius:8px; background:rgba(239,68,68,0.12); color:#fca5a5; font-size:13px; font-weight:600; }
        .pp-ok{ margin-bottom:16px; padding:10px 12px; border-radius:8px; background:rgba(5,150,105,0.15); color:#6ee7b7; font-size:13px; font-weight:600; }
        .pp-note{ padding:20px; border:1px solid rgba(250,204,21,0.3); border-radius:12px; background:rgba(250,204,21,0.08); color:#fde68a; font-size:14px; line-height:1.6; }
        .pp-meta{ display:flex; gap:12px; flex-wrap:wrap; margin-bottom:22px; }
        .pp-chip{ padding:6px 12px; border-radius:999px; background:rgba(5,150,105,0.18); color:#6ee7b7; font-size:12px; font-weight:700; }
      `}</style>

      <header className="pp-header">
        <Logo height={34} />
        <nav className="pp-nav">
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <main className="pp-main">
        <p className="pp-eyebrow">New proposal</p>
        <h1 className="pp-title">Partner and site details</h1>
        <p className="pp-sub">
          Step 1 of the proposal builder. Your company details and the customer site
          appear on the cover and closing pages of the proposal.
        </p>

        {(loading || !roleLoaded) && <div className="pp-note">Loading your account…</div>}

        {!loading && roleLoaded && !user && (
          <div className="pp-note">
            Please <Link href="/vendor-login" style={{ color: '#facc15' }}>sign in as a partner</Link> to
            create a proposal.
          </div>
        )}

        {!loading && roleLoaded && user && !allowed && (
          <div className="pp-note">
            This page is only available to approved SolarHues partners. Your account does not
            have a partner role yet.
          </div>
        )}

        {!loading && roleLoaded && user && allowed && (
          <form onSubmit={saveDraft} noValidate>
            {proposalNumber && (
              <div className="pp-meta">
                <span className="pp-chip">Proposal {proposalNumber}</span>
                <span className="pp-chip">Status: Draft</span>
              </div>
            )}

            {error && <div className="pp-error" role="alert">{error}</div>}
            {message && <div className="pp-ok" role="status">{message}</div>}

            <section className="pp-card">
              <h2>Partner company</h2>
              <p className="pp-hint">Shown on the cover, About page and closing page.</p>

              <div className="pp-logo-row" style={{ marginBottom: 18 }}>
                <div className="pp-logo-preview">
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt="Partner logo preview" />
                  ) : (
                    <span className="pp-logo-empty">No logo</span>
                  )}
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-logo">Company logo (optional)</label>
                  <input
                    id="pp-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                  <span className="pp-hint" style={{ margin: '6px 0 0' }}>
                    {uploading ? 'Uploading…' : 'PNG, JPG or WebP, up to 2 MB.'}
                  </span>
                </div>
              </div>

              <div className="pp-grid">
                <div className="pp-field full">
                  <label className="pp-label" htmlFor="pp-company">Company name</label>
                  <input id="pp-company" className="pp-input" value={partner.company_name}
                    onChange={(e) => updatePartner('company_name', e.target.value)} />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-contact">Contact person</label>
                  <input id="pp-contact" className="pp-input" value={partner.contact_name}
                    onChange={(e) => updatePartner('contact_name', e.target.value)} />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-phone">Phone</label>
                  <input id="pp-phone" className="pp-input" inputMode="tel" value={partner.phone}
                    onChange={(e) => updatePartner('phone', e.target.value)} />
                </div>
                <div className="pp-field full">
                  <label className="pp-label" htmlFor="pp-email">Contact email</label>
                  <input id="pp-email" className="pp-input" type="email" value={partner.email}
                    onChange={(e) => updatePartner('email', e.target.value)} />
                </div>
                <div className="pp-field full">
                  <label className="pp-label" htmlFor="pp-about">About your company</label>
                  <textarea id="pp-about" className="pp-textarea" value={partner.about}
                    placeholder="Years of experience, areas served, types of projects…"
                    onChange={(e) => updatePartner('about', e.target.value)} />
                </div>
                <div className="pp-field full">
                  <label className="pp-label" htmlFor="pp-cert">Credentials (optional)</label>
                  <textarea id="pp-cert" className="pp-textarea" value={partner.certifications}
                    placeholder="Licences, OEM authorisations, registrations you can provide proof for…"
                    onChange={(e) => updatePartner('certifications', e.target.value)} />
                </div>
              </div>
            </section>

            <section className="pp-card">
              <h2>Customer and site</h2>
              <p className="pp-hint">Use the locality only; the full address is not needed on the proposal.</p>

              <div className="pp-grid">
                <div className="pp-field full">
                  <label className="pp-label" htmlFor="pp-cname">Customer name</label>
                  <input id="pp-cname" className="pp-input" value={site.customer_name}
                    onChange={(e) => updateSite('customer_name', e.target.value)} />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-locality">Locality</label>
                  <input id="pp-locality" className="pp-input" value={site.locality}
                    onChange={(e) => updateSite('locality', e.target.value)} />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-city">City</label>
                  <input id="pp-city" className="pp-input" value={site.city}
                    onChange={(e) => updateSite('city', e.target.value)} />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-state">State</label>
                  <input id="pp-state" className="pp-input" value={site.state}
                    onChange={(e) => updateSite('state', e.target.value)} />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-area">Usable roof area (m²)</label>
                  <input id="pp-area" className="pp-input" type="number" min="1" step="any"
                    value={site.usable_roof_area_m2}
                    onChange={(e) => updateSite('usable_roof_area_m2', e.target.value)} />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-btype">Building type</label>
                  <select id="pp-btype" className="pp-select" value={site.building_type}
                    onChange={(e) => updateSite('building_type', e.target.value)}>
                    {BUILDING_TYPES.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-rtype">Roof type</label>
                  <select id="pp-rtype" className="pp-select" value={site.roof_type}
                    onChange={(e) => updateSite('roof_type', e.target.value)}>
                    {ROOF_TYPES.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-lat">Latitude (optional)</label>
                  <input id="pp-lat" className="pp-input" type="number" step="any"
                    placeholder="e.g. 28.4216553" value={site.latitude}
                    onChange={(e) => updateSite('latitude', e.target.value)} />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-lng">Longitude (optional)</label>
                  <input id="pp-lng" className="pp-input" type="number" step="any"
                    placeholder="e.g. 77.0789537" value={site.longitude}
                    onChange={(e) => updateSite('longitude', e.target.value)} />
                </div>
              </div>
            </section>

            <section className="pp-card">
              <h2>Dates</h2>
              <p className="pp-hint">Both dates print on every page footer and the cover.</p>
              <div className="pp-grid">
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-issue">Issue date</label>
                  <input id="pp-issue" className="pp-input" type="date" value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)} />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-valid">Valid until</label>
                  <input id="pp-valid" className="pp-input" type="date" value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)} />
                </div>
              </div>
            </section>

            <button type="submit" className="pp-btn" disabled={saving || uploading}>
              {saving ? 'Saving…' : draftId ? 'Update draft' : 'Save draft'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
