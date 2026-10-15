'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';
import Logo from '../../../../../components/Logo';

const INITIAL_FORM = {
  customer_name: '',
  phone: '',
  email: '',
  locality: '',
  city: '',
  state: '',
  pincode: '',
  building_type: 'Residential',
  roof_type: '',
  monthly_bill_inr: '',
  usable_roof_area_m2: '',
  tentative_capacity_kwp: '',
  lead_source: 'installer',
  next_follow_up_at: '',
  notes: '',
};

const CONTACT_FIELDS = [
  ['customer_name', 'Customer name *', 'text'],
  ['phone', 'Phone *', 'tel'],
  ['email', 'Email *', 'email'],
  ['locality', 'Locality', 'text'],
  ['city', 'City', 'text'],
  ['state', 'State', 'text'],
  ['pincode', 'Pincode', 'text'],
];

const NUMBER_FIELDS = [
  ['monthly_bill_inr', 'Monthly electricity bill (₹)'],
  ['usable_roof_area_m2', 'Usable roof area (m²)'],
  ['tentative_capacity_kwp', 'Tentative system capacity (kWp)'],
];

export default function AddLeadPage() {
  const { workspaceId } = useParams();
  const { user, loading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState('');

  const loadKey = `${user?.id || ''}:${workspaceId || ''}`;

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setCanWrite(false);
    setLoadedFor('');
    setAccessError('');
    setSavedId('');
    setForm({ ...INITIAL_FORM });

    if (!user?.id || !workspaceId) {
      return () => {
        active = false;
      };
    }

    const key = `${user.id}:${workspaceId}`;

    async function loadAccess() {
      try {
        const [workspaceResult, memberResult, profileResult] =
          await Promise.all([
            supabase
              .from('crm_workspaces')
              .select('id, company_name, status, access_expires_at')
              .eq('id', workspaceId)
              .maybeSingle(),

            supabase
              .from('crm_workspace_members')
              .select('member_role, is_active')
              .eq('workspace_id', workspaceId)
              .eq('user_id', user.id)
              .maybeSingle(),

            supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle(),
          ]);

        const queryError =
          workspaceResult.error ||
          memberResult.error ||
          profileResult.error;

        if (queryError) throw queryError;
        if (!active) return;

        const company = workspaceResult.data;
        const member = memberResult.data;
        const isAdmin = profileResult.data?.role === 'admin';

        const available =
          company &&
          company.status === 'active' &&
          (
            !company.access_expires_at ||
            new Date(company.access_expires_at).getTime() > Date.now()
          );

        if (!available) {
          throw new Error(
            'Workspace unavailable, suspended, expired, or inaccessible.'
          );
        }

        const memberCanWrite =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        setWorkspace(company);
        setCanWrite(Boolean(isAdmin || memberCanWrite));
      } catch (err) {
        if (active) {
          setAccessError(
            err.message || 'Could not check workspace access.'
          );
        }
      } finally {
        if (active) setLoadedFor(key);
      }
    }

    loadAccess();

    return () => {
      active = false;
    };
  }, [user?.id, workspaceId]);

  function update(field, value) {
  if (field === 'phone') {
    value = value.replace(/[^0-9]/g, '').slice(0, 15);
  }

  if (field === 'pincode') {
    value = value.replace(/[^0-9]/g, '').slice(0, 6);
  }

  setForm((previous) => ({ ...previous, [field]: value }));
}

  function validate() {
    if (!form.customer_name.trim()) {
      return 'Please enter the customer name.';
    }

    if (!/^[0-9]{8,15}$/.test(form.phone)) {
  return 'Phone must contain only digits, between 8 and 15 digits.';
}

const email = form.email.trim();

if (!email) {
  return 'Please enter the customer email address.';
}

if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)) {
  return 'Please enter an email in the format test@test.com.';
}

    if (
      !/^[+\d\s().-]+$/.test(form.phone.trim()) ||
      phoneDigits.length < 8 ||
      phoneDigits.length > 15
    ) {
      return 'Please enter a valid phone number.';
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      return 'Please enter a valid email address.';
    }

    if (
      form.pincode.trim() &&
      !/^[1-9][0-9]{5}$/.test(form.pincode.trim())
    ) {
      return 'Pincode must be 6 digits and cannot start with zero.';
    }

    for (const [field, label] of NUMBER_FIELDS) {
      if (form[field] === '') continue;

      const value = Number(form[field]);

      if (
        !Number.isFinite(value) ||
        (field === 'monthly_bill_inr' ? value < 0 : value <= 0)
      ) {
        return `Please check: ${label}.`;
      }
    }

    if (
      form.next_follow_up_at &&
      Number.isNaN(new Date(form.next_follow_up_at).getTime())
    ) {
      return 'Please enter a valid follow-up date and time.';
    }

    return '';
  }

  async function saveLead(event) {
    event.preventDefault();

    if (saving || savedId) return;

    setError('');

    if (!user || !workspace || !canWrite) {
      setError('Your account cannot add leads to this workspace.');
      return;
    }

    const problem = validate();

    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        workspace_id: workspace.id,
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        locality: form.locality.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        pincode: form.pincode.trim() || null,
        building_type: form.building_type,
        roof_type: form.roof_type || null,
        stage: 'new',
        lead_source: form.lead_source,
        notes: form.notes.trim() || null,
        next_follow_up_at: form.next_follow_up_at
          ? new Date(form.next_follow_up_at).toISOString()
          : null,
      };

      for (const [field] of NUMBER_FIELDS) {
        payload[field] =
          form[field] === '' ? null : Number(form[field]);
      }

      // The database supplies created_by and timestamps.
      const { data, error: insertError } = await supabase
        .from('crm_leads')
        .insert(payload)
        .select('id')
        .single();

      if (insertError) throw insertError;

      setSavedId(data.id);
    } catch (err) {
      setError(err.message || 'Could not save the lead.');
    } finally {
      setSaving(false);
    }
  }

  const waiting =
    loading || Boolean(user && loadedFor !== loadKey);

  return (
    <div className="lead-page">
      <header>
        <Logo height={34} />
        <Link href="/vendor/crm">← CRM dashboard</Link>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Add lead</h1>

        {waiting && <p role="status">Checking workspace access…</p>}

        {!loading && !user && (
          <div className="notice">
            Please <Link href="/vendor-login">sign in</Link> first.
          </div>
        )}

        {!waiting && user && accessError && (
          <div className="error" role="alert">{accessError}</div>
        )}

        {!waiting && user && workspace && !canWrite && (
          <div className="notice">
            Only workspace owners, sales staff and SolarHues admins
            can add leads.
          </div>
        )}

        {!waiting && user && workspace && canWrite && (
          <>
            <p className="subtitle">{workspace.company_name}</p>

            {savedId ? (
              <section className="success" role="status">
                <h2>Lead saved successfully</h2>
                <p>Sales stage: New</p>
                <p className="lead-id">Lead ID: {savedId}</p>

                <div className="actions">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...INITIAL_FORM });
                      setSavedId('');
                      setError('');
                    }}
                  >
                    Add another lead
                  </button>
                  <Link href="/vendor/crm">Back to dashboard</Link>
                </div>
              </section>
            ) : (
              <form onSubmit={saveLead} noValidate>
                {error && (
                  <div className="error" role="alert">{error}</div>
                )}

                <fieldset disabled={saving}>
                  <section>
                    <h2>Customer and location</h2>
                    <div className="grid">
                     <input
  id={`lead-${field}`}
  type={type}
  value={form[field]}
  required={
    field === 'customer_name' ||
    field === 'phone' ||
    field === 'email'
  }
  maxLength={
    field === 'pincode'
      ? 6
      : field === 'phone'
        ? 15
        : 200
  }
  inputMode={
    field === 'pincode' || field === 'phone'
      ? 'numeric'
      : field === 'email'
        ? 'email'
        : undefined
  }
  placeholder={
    field === 'email'
      ? 'test@test.com'
      : undefined
  }
  onChange={(event) => update(field, event.target.value)}
/>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2>Solar requirements</h2>
                    <div className="grid">
                      <div className="field">
                        <label htmlFor="lead-building">
                          Building type
                        </label>
                        <select
                          id="lead-building"
                          value={form.building_type}
                          onChange={(event) =>
                            update('building_type', event.target.value)
                          }
                        >
                          {[
                            'Residential',
                            'Commercial',
                            'Agricultural',
                            'Society',
                          ].map((value) => (
                            <option key={value}>{value}</option>
                          ))}
                        </select>
                      </div>

                      <div className="field">
                        <label htmlFor="lead-roof">Roof type</label>
                        <select
                          id="lead-roof"
                          value={form.roof_type}
                          onChange={(event) =>
                            update('roof_type', event.target.value)
                          }
                        >
                          <option value="">Not known yet</option>
                          <option value="RCC">RCC</option>
                          <option value="Tin shed">Tin shed</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {NUMBER_FIELDS.map(([field, label]) => (
                        <div className="field" key={field}>
                          <label htmlFor={`lead-${field}`}>
                            {label}
                          </label>
                          <input
                            id={`lead-${field}`}
                            type="number"
                            step="any"
                            min="0"
                            value={form[field]}
                            onChange={(event) =>
                              update(field, event.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <p className="hint">
                      Roof area is in square metres, not square feet.
                      Leave unknown values blank.
                    </p>
                  </section>

                  <section>
                    <h2>Source and follow-up</h2>
                    <div className="grid">
                      <div className="field">
                        <label htmlFor="lead-source">Lead source</label>
                        <select
                          id="lead-source"
                          value={form.lead_source}
                          onChange={(event) =>
                            update('lead_source', event.target.value)
                          }
                        >
                          {[
                            ['installer', 'Installer-generated'],
                            ['referral', 'Referral'],
                            ['website', 'Website'],
                            ['campaign', 'Campaign'],
                            ['other', 'Other'],
                          ].map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="field">
                        <label htmlFor="lead-followup">
                          Next follow-up — your device’s local time
                        </label>
                        <input
                          id="lead-followup"
                          type="datetime-local"
                          value={form.next_follow_up_at}
                          onChange={(event) =>
                            update(
                              'next_follow_up_at',
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="field notes">
                      <label htmlFor="lead-notes">Notes</label>
                      <textarea
                        id="lead-notes"
                        rows={4}
                        maxLength={10000}
                        value={form.notes}
                        onChange={(event) =>
                          update('notes', event.target.value)
                        }
                      />
                    </div>

                    <p className="hint">
                      Record only necessary customer information.
                      Do not put passwords, Aadhaar numbers or bank
                      credentials in notes.
                    </p>
                  </section>

                  <button type="submit">
                    {saving ? 'Saving…' : 'Save lead'}
                  </button>
                </fieldset>
              </form>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        .lead-page {
          min-height: 100vh;
          background: #1e293b;
          color: #f8fafc;
          font-family: Inter, -apple-system, sans-serif;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 14px 24px;
          border-bottom: 1px solid #334155;
        }
        .lead-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }
        main {
          max-width: 860px;
          margin: auto;
          padding: 32px 20px 72px;
        }
        h1 { margin: 0 0 8px; }
        h2 { margin: 0 0 18px; font-size: 19px; }
        .eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-size: 12px;
        }
        .subtitle, .hint { color: #94a3b8; }
        .hint { font-size: 12px; line-height: 1.6; }
        section, .notice, .error {
          margin: 20px 0;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        .error { color: #fca5a5; }
        .success { border-color: #059669; }
        .lead-id { overflow-wrap: anywhere; }
        fieldset {
          border: 0;
          padding: 0;
          margin: 0;
          min-width: 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .field { display: grid; gap: 7px; }
        label { font-size: 13px; color: #cbd5e1; }
        input, select, textarea {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid #64748b;
          border-radius: 9px;
          background: #0f172a;
          color: #fff;
          font: inherit;
        }
        input:focus, select:focus, textarea:focus {
          outline: 2px solid #facc15;
          outline-offset: 2px;
        }
        .notes { margin-top: 18px; }
        button {
          border: 0;
          border-radius: 9px;
          padding: 13px 20px;
          background: #facc15;
          color: #1e293b;
          font-weight: 700;
          cursor: pointer;
        }
        button:disabled { opacity: .6; cursor: wait; }
        .actions {
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
