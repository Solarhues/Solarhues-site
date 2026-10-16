'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';
import Logo from '../../../../../components/Logo';

const STAGES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['site_visit', 'Site visit'],
  ['proposal_sent', 'Proposal sent'],
  ['won', 'Won'],
  ['lost', 'Lost'],
];

const LEAD_SOURCES = [
  ['installer', 'Installer-generated'],
  ['referral', 'Referral'],
  ['website', 'Website'],
  ['campaign', 'Campaign'],
  ['other', 'Other'],
];

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return '—';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDueDate(value) {
  if (!value) return 'Not set';

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toLocalDateTimeInput(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const pad = (number) => String(number).padStart(2, '0');

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}`
  );
}

function stageLabel(value) {
  return STAGES.find(([key]) => key === value)?.[1] || value || '—';
}

function numericInputValue(value) {
  return value === null || value === undefined ? '' : String(value);
}

export default function LeadDetailsPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const leadId = params?.leadId;

  const { user, loading } = useAuth();
  const userId = user?.id;

  const [workspace, setWorkspace] = useState(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');

  const [lead, setLead] = useState(null);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadLoadedFor, setLeadLoadedFor] = useState('');
  const [leadError, setLeadError] = useState('');

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const [related, setRelated] = useState({
    key: '',
    loading: false,
    proposalError: '',
    paymentError: '',
    proposals: [],
    payments: [],
  });

  const [relatedRetry, setRelatedRetry] = useState(0);
  const [accessRetry, setAccessRetry] = useState(0);

  const loadKey = `${userId || ''}:${workspaceId || ''}`;
  const recordKey = `${loadKey}:${leadId || ''}`;
  const base = `/vendor/crm/${workspaceId}`;

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setCanWrite(false);
    setLoadedFor('');
    setAccessError('');

    if (loading || !userId || !workspaceId) {
      return () => {
        active = false;
      };
    }

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
              .eq('user_id', userId)
              .maybeSingle(),

            supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .maybeSingle(),
          ]);

        const queryError =
          workspaceResult.error ||
          memberResult.error ||
          profileResult.error;

        if (queryError) throw queryError;

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

        if (!active) return;

        setWorkspace(company);
        setCanWrite(Boolean(isAdmin || memberCanWrite));
      } catch (err) {
        if (active) {
          setAccessError(
            err.message || 'Could not check workspace access.'
          );
        }
      } finally {
        if (active) setLoadedFor(loadKey);
      }
    }

    loadAccess();

    return () => {
      active = false;
    };
  }, [userId, workspaceId, loading, loadKey, accessRetry]);

  useEffect(() => {
    let active = true;

    setLead(null);
    setForm(null);
    setLeadLoading(false);
    setLeadLoadedFor('');
    setLeadError('');
    setSaveError('');
    setSaved(false);

    if (
      loading ||
      !userId ||
      !workspaceId ||
      !leadId ||
      loadedFor !== loadKey ||
      accessError ||
      !canWrite
    ) {
      return () => {
        active = false;
      };
    }

    async function loadLead() {
      setLeadLoading(true);

      try {
        const { data, error: leadQueryError } = await supabase
          .from('crm_leads')
          .select('*')
          .eq('id', leadId)
          .eq('workspace_id', workspaceId)
          .maybeSingle();

        if (leadQueryError) throw leadQueryError;

        if (!data) {
          throw new Error('Lead not found in this workspace.');
        }

        if (!active) return;

        setLead(data);
        setForm({
          customer_name: data.customer_name || '',
          phone: data.phone || '',
          email: data.email || '',
          locality: data.locality || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          building_type: data.building_type || 'Residential',
          roof_type: data.roof_type || '',
          monthly_bill_inr: numericInputValue(data.monthly_bill_inr),
          usable_roof_area_m2: numericInputValue(
            data.usable_roof_area_m2
          ),
          tentative_capacity_kwp: numericInputValue(
            data.tentative_capacity_kwp
          ),
          stage: data.stage || 'new',
          lead_source: data.lead_source || 'installer',
          next_follow_up_at: toLocalDateTimeInput(
            data.next_follow_up_at
          ),
          notes: data.notes || '',
        });
      } catch (err) {
        if (active) {
          setLeadError(err.message || 'Could not load this lead.');
        }
      } finally {
        if (active) {
          setLeadLoading(false);
          setLeadLoadedFor(recordKey);
        }
      }
    }

    loadLead();

    return () => {
      active = false;
    };
  }, [
    userId,
    loading,
    workspaceId,
    leadId,
    canWrite,
    loadedFor,
    loadKey,
    recordKey,
    accessError,
  ]);

  useEffect(() => {
    let active = true;

    if (
      !userId ||
      !workspaceId ||
      !leadId ||
      loadedFor !== loadKey ||
      accessError ||
      !canWrite ||
      leadLoadedFor !== recordKey ||
      !lead
    ) {
      return () => {
        active = false;
      };
    }

    setRelated({
      key: recordKey,
      loading: true,
      proposalError: '',
      paymentError: '',
      proposals: [],
      payments: [],
    });

    async function loadRelatedRecords() {
      try {
        const [proposalsResult, paymentsResult] = await Promise.all([
          supabase
            .from('crm_proposals')
            .select(`
              id,
              proposal_number,
              status,
              system_capacity_kwp,
              total_inr,
              created_at
            `)
            .eq('workspace_id', workspaceId)
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false }),

          supabase
            .from('crm_payment_requests')
            .select(`
              id,
              request_number,
              purpose,
              status,
              amount_inr,
              paid_amount_inr,
              due_date,
              created_at
            `)
            .eq('workspace_id', workspaceId)
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false }),
        ]);

        if (!active) return;

        setRelated({
          key: recordKey,
          loading: false,
          proposalError: proposalsResult.error?.message || '',
          paymentError: paymentsResult.error?.message || '',
          proposals: proposalsResult.error
            ? []
            : proposalsResult.data || [],
          payments: paymentsResult.error
            ? []
            : paymentsResult.data || [],
        });
      } catch (err) {
        if (!active) return;

        const message =
          err.message || 'Could not load related records.';

        setRelated({
          key: recordKey,
          loading: false,
          proposalError: message,
          paymentError: message,
          proposals: [],
          payments: [],
        });
      }
    }

    loadRelatedRecords();

    return () => {
      active = false;
    };
  }, [
    userId,
    workspaceId,
    leadId,
    loadedFor,
    loadKey,
    accessError,
    canWrite,
    leadLoadedFor,
    recordKey,
    lead,
    relatedRetry,
  ]);

  function update(field, value) {
    setSaved(false);
    setSaveError('');

    if (field === 'phone') {
      value = value.replace(/[^0-9]/g, '').slice(0, 15);
    }

    if (field === 'pincode') {
      value = value.replace(/[^0-9]/g, '').slice(0, 6);
    }

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function validate() {
    if (!form) return 'Lead form is not available.';

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
      form.pincode.trim() &&
      !/^[1-9][0-9]{5}$/.test(form.pincode.trim())
    ) {
      return 'Pincode must be 6 digits and cannot start with zero.';
    }

    const numericChecks = [
      ['monthly_bill_inr', 'monthly electricity bill', true],
      ['usable_roof_area_m2', 'usable roof area', false],
      ['tentative_capacity_kwp', 'system capacity', false],
    ];

    for (const [field, label, allowsZero] of numericChecks) {
      if (form[field] === '') continue;

      const value = Number(form[field]);

      if (
        !Number.isFinite(value) ||
        (allowsZero ? value < 0 : value <= 0)
      ) {
        return `Please enter a valid ${label}.`;
      }
    }

    if (!STAGES.some(([value]) => value === form.stage)) {
      return 'Please select a valid sales stage.';
    }

    if (
      !LEAD_SOURCES.some(([value]) => value === form.lead_source)
    ) {
      return 'Please select a valid lead source.';
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

    if (saving) return;

    setSaveError('');
    setSaved(false);

    if (
      !user ||
      !workspace ||
      !canWrite ||
      !lead ||
      leadLoadedFor !== recordKey
    ) {
      setSaveError('Your account cannot edit this lead.');
      return;
    }

    const problem = validate();

    if (problem) {
      setSaveError(problem);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        phone: form.phone,
        email: form.email.trim(),
        locality: form.locality.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        pincode: form.pincode.trim() || null,
        building_type: form.building_type,
        roof_type: form.roof_type || null,
        monthly_bill_inr:
          form.monthly_bill_inr === ''
            ? null
            : Number(form.monthly_bill_inr),
        usable_roof_area_m2:
          form.usable_roof_area_m2 === ''
            ? null
            : Number(form.usable_roof_area_m2),
        tentative_capacity_kwp:
          form.tentative_capacity_kwp === ''
            ? null
            : Number(form.tentative_capacity_kwp),
        stage: form.stage,
        lead_source: form.lead_source,
        notes: form.notes.trim() || null,
        next_follow_up_at: form.next_follow_up_at
          ? new Date(form.next_follow_up_at).toISOString()
          : null,
      };

      const { data, error: updateError } = await supabase
        .from('crm_leads')
        .update(payload)
        .eq('id', lead.id)
        .eq('workspace_id', workspace.id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      setLead(data);
      setSaved(true);
    } catch (err) {
      setSaveError(
        err.message || 'Could not save changes to this lead.'
      );
    } finally {
      setSaving(false);
    }
  }

  const waiting =
    loading || Boolean(user && loadedFor !== loadKey);

  const waitingForLead =
    leadLoading || leadLoadedFor !== recordKey;

  const relatedLoading =
    related.key !== recordKey || related.loading;

  const showLead =
    !waiting &&
    user &&
    !accessError &&
    workspace &&
    canWrite &&
    !waitingForLead &&
    !leadError &&
    lead &&
    form;

  return (
    <div className="lead-details-page">
      <header>
        <Logo height={34} />

        <nav aria-label="Lead navigation">
          <Link href={`${base}/overview`}>Overview</Link>
          <Link href={base}>← Leads list</Link>
        </nav>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Lead details</h1>

        {waiting && (
          <p role="status">Checking workspace access…</p>
        )}

        {!loading && !user && (
          <div className="notice">
            Please <Link href="/vendor-login">sign in</Link> first.
          </div>
        )}

        {!waiting && user && accessError && (
          <div className="error" role="alert">
            <p>{accessError}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => setAccessRetry((value) => value + 1)}
            >
              Retry access check
            </button>
          </div>
        )}

        {!waiting &&
          user &&
          !accessError &&
          workspace &&
          !canWrite && (
            <div className="notice">
              Only workspace owners, sales staff and SolarHues admins
              can view or edit leads on this page.
            </div>
          )}

        {!waiting &&
          user &&
          !accessError &&
          workspace &&
          canWrite && (
            <>
              <p className="subtitle">{workspace.company_name}</p>

              {waitingForLead && (
                <p role="status">Loading lead…</p>
              )}

              {!waitingForLead && leadError && (
                <div className="error" role="alert">
                  {leadError}
                </div>
              )}
            </>
          )}

        {showLead && (
          <>
            <div className="customer-heading">
              <div>
                <h2>{lead.customer_name || 'Unnamed customer'}</h2>
                <p className="hint">
                  Saved stage: {stageLabel(lead.stage)}
                </p>
              </div>

              {lead.phone && (
                <a
                  href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                  className="secondary-link"
                >
                  Call customer
                </a>
              )}
            </div>

            <form onSubmit={saveLead} noValidate>
              {saveError && (
                <div className="error" role="alert">
                  {saveError}
                </div>
              )}

              {saved && (
                <div className="success" role="status">
                  Lead updated successfully.
                </div>
              )}

              <fieldset disabled={saving}>
                <section>
                  <h2>Sales stage</h2>

                  <div className="stage-bar">
                    {STAGES.map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={form.stage === value}
                        className={
                          form.stage === value ? 'active' : ''
                        }
                        onClick={() => update('stage', value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <p className="hint">
                    Selected stage: {stageLabel(form.stage)}.
                    Click Save changes to apply.
                  </p>
                </section>

                <section>
                  <h2>Customer and location</h2>

                  <div className="grid">
                    <div className="field">
                      <label htmlFor="customer_name">
                        Customer name *
                      </label>
                      <input
                        id="customer_name"
                        value={form.customer_name}
                        onChange={(event) =>
                          update('customer_name', event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="phone">Phone *</label>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={15}
                        value={form.phone}
                        onChange={(event) =>
                          update('phone', event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="email">Email *</label>
                      <input
                        id="email"
                        type="email"
                        inputMode="email"
                        placeholder="test@test.com"
                        value={form.email}
                        onChange={(event) =>
                          update('email', event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="locality">Locality</label>
                      <input
                        id="locality"
                        value={form.locality}
                        onChange={(event) =>
                          update('locality', event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        value={form.city}
                        onChange={(event) =>
                          update('city', event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="state">State</label>
                      <input
                        id="state"
                        value={form.state}
                        onChange={(event) =>
                          update('state', event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="pincode">Pincode</label>
                      <input
                        id="pincode"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(event) =>
                          update('pincode', event.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h2>Solar requirements</h2>

                  <div className="grid">
                    <div className="field">
                      <label htmlFor="building_type">
                        Building type
                      </label>
                      <select
                        id="building_type"
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
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="roof_type">Roof type</label>
                      <select
                        id="roof_type"
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

                    <div className="field">
                      <label htmlFor="monthly_bill_inr">
                        Monthly electricity bill (₹)
                      </label>
                      <input
                        id="monthly_bill_inr"
                        type="number"
                        min="0"
                        step="any"
                        value={form.monthly_bill_inr}
                        onChange={(event) =>
                          update(
                            'monthly_bill_inr',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="usable_roof_area_m2">
                        Usable roof area (m²)
                      </label>
                      <input
                        id="usable_roof_area_m2"
                        type="number"
                        min="0"
                        step="any"
                        value={form.usable_roof_area_m2}
                        onChange={(event) =>
                          update(
                            'usable_roof_area_m2',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="tentative_capacity_kwp">
                        Tentative system capacity (kWp)
                      </label>
                      <input
                        id="tentative_capacity_kwp"
                        type="number"
                        min="0"
                        step="any"
                        value={form.tentative_capacity_kwp}
                        onChange={(event) =>
                          update(
                            'tentative_capacity_kwp',
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h2>Follow-up</h2>

                  <div className="grid">
                    <div className="field">
                      <label htmlFor="lead_source">Lead source</label>
                      <select
                        id="lead_source"
                        value={form.lead_source}
                        onChange={(event) =>
                          update('lead_source', event.target.value)
                        }
                      >
                        {LEAD_SOURCES.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="next_follow_up_at">
                        Next follow-up — local time
                      </label>
                      <input
                        id="next_follow_up_at"
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

                  <p className="hint">
                    Time is shown in this device’s local timezone.
                    Clear the field to remove the scheduled follow-up.
                  </p>

                  <div className="field notes">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      rows={5}
                      maxLength={10000}
                      value={form.notes}
                      onChange={(event) =>
                        update('notes', event.target.value)
                      }
                    />
                  </div>
                </section>

                <button type="submit">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </fieldset>
            </form>

            <section>
              <div className="section-heading">
                <h2>Proposals</h2>

                <Link
                  href={`${base}/${leadId}/proposals/new`}
                  className="action-link"
                >
                  + Create proposal
                </Link>
              </div>

              {relatedLoading ? (
                <p className="hint" role="status">
                  Loading proposals…
                </p>
              ) : related.proposalError ? (
                <div className="related-error" role="alert">
                  <p>Proposals: {related.proposalError}</p>
                  <button
                    type="button"
                    className="retry-button"
                    onClick={() =>
                      setRelatedRetry((value) => value + 1)
                    }
                  >
                    Retry
                  </button>
                </div>
              ) : related.proposals.length === 0 ? (
                <p className="hint">
                  No proposals created for this lead yet.
                </p>
              ) : (
                <>
                  <p className="hint">
                    {related.proposals.length} proposal
                    {related.proposals.length === 1 ? '' : 's'}
                  </p>

                  <div className="related-list">
                    {related.proposals.map((proposal) => (
                      <Link
                        key={proposal.id}
                        href={`${base}/proposals/${proposal.id}`}
                        className="related-row"
                      >
                        <div>
                          <strong>
                            {proposal.proposal_number ||
                              'Untitled proposal'}
                          </strong>

                          <p className="related-description">
                            {proposal.status || 'Draft'}
                            {proposal.system_capacity_kwp != null
                              ? ` · ${proposal.system_capacity_kwp} kWp`
                              : ''}
                          </p>

                          <p className="related-description">
                            Created: {formatDate(proposal.created_at)}
                          </p>
                        </div>

                        <span className="related-amount">
                          {formatMoney(proposal.total_inr)} →
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section>
              <div className="section-heading">
                <h2>Payment requests</h2>

                <Link
                  href={`${base}/${leadId}/payments/new`}
                  className="action-link"
                >
                  + Create payment request
                </Link>
              </div>

              {relatedLoading ? (
                <p className="hint" role="status">
                  Loading payment requests…
                </p>
              ) : related.paymentError ? (
                <div className="related-error" role="alert">
                  <p>Payments: {related.paymentError}</p>
                  <button
                    type="button"
                    className="retry-button"
                    onClick={() =>
                      setRelatedRetry((value) => value + 1)
                    }
                  >
                    Retry
                  </button>
                </div>
              ) : related.payments.length === 0 ? (
                <p className="hint">
                  No payment requests recorded for this lead yet.
                </p>
              ) : (
                <>
                  <p className="hint">
                    {related.payments.length} payment request
                    {related.payments.length === 1 ? '' : 's'}
                  </p>

                  <div className="related-list">
                    {related.payments.map((payment) => (
                      <article
                        key={payment.id}
                        className="related-row"
                      >
                        <div>
                          <strong>
                            {payment.request_number ||
                              'Payment request'}
                          </strong>

                          <p className="related-description">
                            {payment.purpose ||
                              'Purpose not specified'}{' '}
                            · {payment.status || 'Status not set'}
                          </p>

                          <p className="related-description">
                            Due: {formatDueDate(payment.due_date)}
                          </p>

                          <p className="related-description">
                            Recorded paid amount:{' '}
                            {formatMoney(payment.paid_amount_inr)}
                          </p>
                        </div>

                        <span className="related-amount">
                          {formatMoney(payment.amount_inr)}
                        </span>
                      </article>
                    ))}
                  </div>
                </>
              )}

              <p className="hint">
                These are recorded payment requests. This page does
                not collect or transfer money.
              </p>
            </section>

            <section className="meta-section">
              <h2>Record details</h2>
              <p>Created: {formatDate(lead.created_at)}</p>
              <p>Last updated: {formatDate(lead.updated_at)}</p>
              <p>
                Saved follow-up: {formatDate(lead.next_follow_up_at)}
              </p>
              <p className="record-id">Lead ID: {lead.id}</p>
            </section>
          </>
        )}
      </main>

      <style jsx>{`
        .lead-details-page {
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

        nav {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }

        .lead-details-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }

        main {
          max-width: 900px;
          margin: auto;
          padding: 32px 20px 72px;
        }

        h1 {
          margin: 0 0 8px;
        }

        h2 {
          margin: 0 0 18px;
          font-size: 19px;
          overflow-wrap: anywhere;
        }

        .eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 12px;
        }

        .subtitle,
        .hint {
          color: #94a3b8;
        }

        .hint {
          font-size: 12px;
          line-height: 1.6;
        }

        .customer-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 24px;
        }

        .customer-heading h2 {
          margin-bottom: 6px;
          font-size: 24px;
        }

        section,
        .notice,
        .error,
        .success {
          margin: 20px 0;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
        }

        .error,
        .related-error {
          color: #fca5a5;
          overflow-wrap: anywhere;
        }

        .success {
          border-color: #059669;
          color: #6ee7b7;
        }

        .stage-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .stage-bar button {
          border: 1px solid #64748b;
          background: #0f172a;
          color: #cbd5e1;
          padding: 9px 13px;
          border-radius: 999px;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
        }

        .stage-bar button.active {
          background: #facc15;
          border-color: #facc15;
          color: #1e293b;
          font-weight: 700;
        }

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

        .field {
          display: grid;
          gap: 7px;
        }

        label {
          font-size: 13px;
          color: #cbd5e1;
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
          background: #0f172a;
          color: #fff;
          font: inherit;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: 2px solid #facc15;
          outline-offset: 2px;
        }

        .notes {
          margin-top: 18px;
        }

        .meta-section p {
          margin: 5px 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .record-id {
          overflow-wrap: anywhere;
        }

        button[type='submit'],
        .retry-button {
          border: 0;
          border-radius: 9px;
          padding: 13px 20px;
          background: #facc15;
          color: #1e293b;
          font-weight: 700;
          cursor: pointer;
        }

        button[type='submit']:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .section-heading h2 {
          margin: 0;
        }

        .lead-details-page :global(a.action-link) {
          display: inline-flex;
          padding: 12px 16px;
          border-radius: 9px;
          background: #facc15;
          color: #1e293b;
          font-weight: 700;
        }

        .lead-details-page :global(a.secondary-link) {
          display: inline-flex;
          padding: 11px 16px;
          border: 1px solid #64748b;
          border-radius: 9px;
          background: #0f172a;
          color: #f8fafc;
          font-weight: 600;
        }

        .related-list {
          display: grid;
          gap: 12px;
          margin-top: 20px;
        }

        .lead-details-page :global(a.related-row),
        article.related-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 14px;
          padding: 16px;
          border: 1px solid #475569;
          border-radius: 10px;
          background: #0f172a;
          color: #f8fafc;
        }

        .lead-details-page :global(a.related-row:hover) {
          border-color: #facc15;
        }

        .related-description {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .related-amount {
          color: #facc15;
          font-weight: 700;
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .grid {
            grid-template-columns: 1fr;
          }

          section {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
}
