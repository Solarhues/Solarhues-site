'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabase';
import { useAuth } from '../../../../../../providers';
import Logo from '../../../../../../../components/Logo';

const ITEM_TYPES = [
  ['panel', 'Panel'],
  ['inverter', 'Inverter'],
  ['mounting', 'Mounting'],
  ['installation', 'Installation'],
  ['other', 'Other'],
];

const EMPTY_FORM = {
  proposal_number: '',
  system_capacity_kwp: '',
  estimated_monthly_generation_kwh: '',
  estimated_monthly_savings_inr: '',
  discount_inr: '',
  subsidy_inr: '',
  valid_until: '',
  notes: '',
};

const DETAIL_FIELDS = [
  ['proposal_number', 'Proposal number *', 'text'],
  ['valid_until', 'Valid until', 'date'],
  ['system_capacity_kwp', 'System capacity (kWp)', 'number'],
  [
    'estimated_monthly_generation_kwh',
    'Estimated monthly generation (kWh)',
    'number',
  ],
  [
    'estimated_monthly_savings_inr',
    'Estimated monthly savings (₹)',
    'number',
  ],
];

function newItem(key) {
  return {
    key,
    item_type: 'panel',
    description: '',
    quantity: '1',
    unit: 'unit',
    unit_price_inr: '',
  };
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function numericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function itemAmount(item) {
  return roundMoney(
    numericValue(item.quantity) *
      roundMoney(numericValue(item.unit_price_inr))
  );
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return '—';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function generateProposalNumber() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `SH-${now.getFullYear()}${month}-${suffix}`;
}

export default function CreateProposalPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const leadId = params?.leadId;

  const router = useRouter();
  const { user, loading } = useAuth();
  const userId = user?.id;

  const loadKey = `${userId || ''}:${workspaceId || ''}:${leadId || ''}`;
  const base = `/vendor/crm/${workspaceId}`;

  const [workspace, setWorkspace] = useState(null);
  const [lead, setLead] = useState(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');
  const [contextRetry, setContextRetry] = useState(0);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [items, setItems] = useState([newItem(0)]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdProposalId, setCreatedProposalId] = useState(null);

  const nextItemKey = useRef(1);
  const saveLock = useRef(false);

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setLead(null);
    setCanWrite(false);
    setLoadedFor('');
    setAccessError('');
    setError('');
    setCreatedProposalId(null);
    setForm({ ...EMPTY_FORM });
    setItems([newItem(0)]);
    nextItemKey.current = 1;

    if (loading || !userId || !workspaceId || !leadId) {
      return () => {
        active = false;
      };
    }

    async function loadContext() {
      try {
        const [
          workspaceResult,
          memberResult,
          profileResult,
          leadResult,
        ] = await Promise.all([
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

          supabase
            .from('crm_leads')
            .select(`
              id,
              workspace_id,
              customer_name,
              city,
              tentative_capacity_kwp
            `)
            .eq('id', leadId)
            .eq('workspace_id', workspaceId)
            .maybeSingle(),
        ]);

        const queryError =
          workspaceResult.error ||
          memberResult.error ||
          profileResult.error ||
          leadResult.error;

        if (queryError) throw queryError;

        const company = workspaceResult.data;
        const member = memberResult.data;
        const leadData = leadResult.data;
        const isAdmin = profileResult.data?.role === 'admin';

        const available =
          company &&
          company.status === 'active' &&
          (
            !company.access_expires_at ||
            new Date(company.access_expires_at).getTime() >
              Date.now()
          );

        if (!available) {
          throw new Error(
            'Workspace unavailable, suspended, expired, or inaccessible.'
          );
        }

        if (!leadData) {
          throw new Error('Lead not found in this workspace.');
        }

        const memberCanWrite =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        const number = generateProposalNumber();

        if (!active) return;

        setWorkspace(company);
        setLead(leadData);
        setCanWrite(Boolean(isAdmin || memberCanWrite));

        setForm({
          ...EMPTY_FORM,
          proposal_number: number,
          system_capacity_kwp:
            leadData.tentative_capacity_kwp == null
              ? ''
              : String(leadData.tentative_capacity_kwp),
        });
      } catch (err) {
        if (active) {
          setAccessError(
            err.message || 'Could not load proposal context.'
          );
        }
      } finally {
        if (active) setLoadedFor(loadKey);
      }
    }

    loadContext();

    return () => {
      active = false;
    };
  }, [
    userId,
    loading,
    workspaceId,
    leadId,
    loadKey,
    contextRetry,
  ]);

  function updateForm(field, value) {
    setError('');
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateItem(key, field, value) {
    setError('');
    setItems((previous) =>
      previous.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    if (items.length >= 100) return;

    const key = nextItemKey.current;
    nextItemKey.current += 1;

    setError('');
    setItems((previous) => [...previous, newItem(key)]);
  }

  function removeItem(key) {
    setError('');
    setItems((previous) =>
      previous.length <= 1
        ? previous
        : previous.filter((item) => item.key !== key)
    );
  }

  const subtotal = roundMoney(
    items.reduce((total, item) => total + itemAmount(item), 0)
  );

  const discount = roundMoney(numericValue(form.discount_inr));
  const subsidy = roundMoney(numericValue(form.subsidy_inr));
  const total = roundMoney(subtotal - discount - subsidy);

  function validate() {
    if (!form.proposal_number.trim()) {
      return 'Please enter a proposal number.';
    }

    const numberChecks = [
      ['system_capacity_kwp', 'System capacity', true],
      [
        'estimated_monthly_generation_kwh',
        'Estimated monthly generation',
        false,
      ],
      [
        'estimated_monthly_savings_inr',
        'Estimated monthly savings',
        false,
      ],
      ['discount_inr', 'Discount', false],
      ['subsidy_inr', 'Subsidy', false],
    ];

    for (const [field, label, positiveOnly] of numberChecks) {
      const raw = form[field].trim();

      if (raw === '') continue;

      const value = Number(raw);

      if (
        !Number.isFinite(value) ||
        (positiveOnly ? value <= 0 : value < 0)
      ) {
        return `${label} must be a valid ${
          positiveOnly ? 'positive' : 'nonnegative'
        } number.`;
      }
    }

    if (
      form.valid_until &&
      !/^\d{4}-\d{2}-\d{2}$/.test(form.valid_until)
    ) {
      return 'Please enter a valid expiry date.';
    }

    if (items.length < 1 || items.length > 100) {
      return 'A proposal must contain between 1 and 100 items.';
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const label = `Item ${index + 1}`;

      if (!ITEM_TYPES.some(([value]) => value === item.item_type)) {
        return `${label}: please select a valid item type.`;
      }

      if (!item.description.trim()) {
        return `${label}: please enter a description.`;
      }

      if (
        !item.quantity.trim() ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return `${label}: quantity must be greater than zero.`;
      }

      if (!item.unit_price_inr.trim()) {
        return `${label}: enter a unit price. Enter 0 only if intentional.`;
      }

      if (
        !Number.isFinite(Number(item.unit_price_inr)) ||
        Number(item.unit_price_inr) < 0
      ) {
        return `${label}: unit price must be nonnegative.`;
      }

      if (!Number.isFinite(itemAmount(item))) {
        return `${label}: the calculated amount is too large.`;
      }
    }

    if (!Number.isFinite(subtotal) || !Number.isFinite(total)) {
      return 'The calculated proposal amount is invalid.';
    }

    if (total < 0) {
      return 'Discount and subsidy cannot exceed the subtotal.';
    }

    return '';
  }

  async function saveProposal(event) {
    event.preventDefault();

    if (saveLock.current || createdProposalId) return;

    setError('');

    if (
      !userId ||
      !workspace ||
      !lead ||
      !canWrite ||
      loadedFor !== loadKey
    ) {
      setError('Your account cannot create proposals for this lead.');
      return;
    }

    const problem = validate();

    if (problem) {
      setError(problem);
      return;
    }

    saveLock.current = true;
    setSaving(true);

    try {
      const { data: proposalId, error: rpcError } =
        await supabase.rpc('crm_create_proposal_with_items', {
          p_workspace_id: workspace.id,
          p_lead_id: lead.id,
          p_proposal: {
            proposal_number: form.proposal_number.trim(),
            system_capacity_kwp:
              form.system_capacity_kwp.trim() || null,
            estimated_monthly_generation_kwh:
              form.estimated_monthly_generation_kwh.trim() || null,
            estimated_monthly_savings_inr:
              form.estimated_monthly_savings_inr.trim() || null,
            discount_inr: form.discount_inr.trim() || '0',
            subsidy_inr: form.subsidy_inr.trim() || '0',
            valid_until: form.valid_until || null,
            notes: form.notes.trim() || null,
          },
          p_items: items.map((item) => ({
            item_type: item.item_type,
            description: item.description.trim(),
            quantity: item.quantity.trim(),
            unit: item.unit.trim() || 'unit',
            unit_price_inr: item.unit_price_inr.trim(),
          })),
        });

      if (rpcError) throw rpcError;

      if (!proposalId || typeof proposalId !== 'string') {
        throw new Error(
          'The save returned no proposal ID. Check the proposal list before trying again.'
        );
      }

      setCreatedProposalId(proposalId);

      router.push(`${base}/proposals/${proposalId}`);
    } catch (err) {
      if (err.code === '23505') {
        setError(
          'That proposal number already exists in this workspace. ' +
          'Check the proposal list first: an earlier save may have succeeded. ' +
          'Use another number only if you intend to create a separate proposal.'
        );
      } else {
        setError(
          `${err.message || 'Could not create the proposal.'} ` +
          'If the connection was interrupted, check the proposal list ' +
          'for this proposal number before submitting again.'
        );
      }
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }

  const waiting =
    loading ||
    Boolean(
      user && workspaceId && leadId && loadedFor !== loadKey
    );

  const ready =
    !waiting &&
    user &&
    loadedFor === loadKey &&
    !accessError &&
    workspace &&
    lead &&
    canWrite;

  return (
    <div className="proposal-page">
      <header>
        <Logo height={34} />

        <nav aria-label="Proposal navigation">
          <Link href={`${base}/proposals`}>All proposals</Link>
          <Link href={`${base}/${leadId}`}>← Lead details</Link>
        </nav>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Create proposal</h1>

        {waiting && <p role="status">Checking access…</p>}

        {!loading && !user && (
          <div className="notice">
            Please <Link href="/vendor-login">sign in</Link> first.
          </div>
        )}

        {!loading && user && (!workspaceId || !leadId) && (
          <div className="error" role="alert">
            Workspace or lead ID is missing. Open the proposal form
            from a lead’s detail page.
          </div>
        )}

        {!waiting && user && accessError && (
          <div className="error" role="alert">
            <p>{accessError}</p>
            <button
              type="button"
              onClick={() => setContextRetry((value) => value + 1)}
            >
              Retry access check
            </button>
          </div>
        )}

        {!waiting &&
          user &&
          !accessError &&
          workspace &&
          lead &&
          !canWrite && (
            <div className="notice">
              Only workspace owners, sales staff and SolarHues admins
              can create proposals on this page.
            </div>
          )}

        {ready && (
          <>
            <p className="subtitle">
              {workspace.company_name} · {lead.customer_name}
              {lead.city ? `, ${lead.city}` : ''}
            </p>

            {createdProposalId ? (
              <div className="success" role="status">
                <h2>Proposal created successfully</h2>
                <p>The proposal and its items have been saved.</p>
                <Link
                  href={`${base}/proposals/${createdProposalId}`}
                >
                  Open proposal →
                </Link>
              </div>
            ) : (
              <form onSubmit={saveProposal} noValidate>
                {error && (
                  <div className="error" role="alert">
                    <p>{error}</p>
                    <Link href={`${base}/proposals`}>
                      Check proposal list →
                    </Link>
                  </div>
                )}

                <fieldset disabled={saving}>
                  <section>
                    <h2>Proposal details</h2>

                    <div className="grid">
                      {DETAIL_FIELDS.map(([field, label, type]) => (
                        <div className="field" key={field}>
                          <label htmlFor={field}>{label}</label>
                          <input
                            id={field}
                            type={type}
                            {...(type === 'number'
                              ? { min: '0', step: 'any' }
                              : {})}
                            value={form[field]}
                            onChange={(event) =>
                              updateForm(field, event.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2>Proposal items</h2>

                    <p className="hint">
                      Enter each component or service separately.
                      Blank unit prices are not accepted.
                    </p>

                    {items.map((item, index) => (
                      <div className="item" key={item.key}>
                        <h3>Item {index + 1}</h3>

                        <div className="grid">
                          <div className="field">
                            <label htmlFor={`type-${item.key}`}>
                              Item type
                            </label>
                            <select
                              id={`type-${item.key}`}
                              value={item.item_type}
                              onChange={(event) =>
                                updateItem(
                                  item.key,
                                  'item_type',
                                  event.target.value
                                )
                              }
                            >
                              {ITEM_TYPES.map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="field">
                            <label htmlFor={`description-${item.key}`}>
                              Description *
                            </label>
                            <input
                              id={`description-${item.key}`}
                              value={item.description}
                              placeholder="Component or service details"
                              onChange={(event) =>
                                updateItem(
                                  item.key,
                                  'description',
                                  event.target.value
                                )
                              }
                            />
                          </div>

                          <div className="field">
                            <label htmlFor={`quantity-${item.key}`}>
                              Quantity *
                            </label>
                            <input
                              id={`quantity-${item.key}`}
                              type="number"
                              min="0"
                              step="any"
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(
                                  item.key,
                                  'quantity',
                                  event.target.value
                                )
                              }
                            />
                          </div>

                          <div className="field">
                            <label htmlFor={`unit-${item.key}`}>
                              Unit
                            </label>
                            <input
                              id={`unit-${item.key}`}
                              value={item.unit}
                              placeholder="units, kW, set"
                              onChange={(event) =>
                                updateItem(
                                  item.key,
                                  'unit',
                                  event.target.value
                                )
                              }
                            />
                          </div>

                          <div className="field">
                            <label htmlFor={`price-${item.key}`}>
                              Unit price (₹) *
                            </label>
                            <input
                              id={`price-${item.key}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price_inr}
                              onChange={(event) =>
                                updateItem(
                                  item.key,
                                  'unit_price_inr',
                                  event.target.value
                                )
                              }
                            />
                          </div>

                          <div className="field">
                            <label htmlFor={`amount-${item.key}`}>
                              Item amount (₹)
                            </label>
                            <input
                              id={`amount-${item.key}`}
                              value={formatMoney(itemAmount(item))}
                              readOnly
                            />
                          </div>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            className="remove"
                            onClick={() => removeItem(item.key)}
                          >
                            Remove item
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="secondary"
                      disabled={items.length >= 100}
                      onClick={addItem}
                    >
                      + Add another item
                    </button>

                    <p className="hint">
                      {items.length} of 100 items
                    </p>
                  </section>

                  <section>
                    <h2>Pricing</h2>

                    <div className="grid">
                      <div className="field">
                        <label htmlFor="subtotal">Subtotal</label>
                        <input
                          id="subtotal"
                          value={formatMoney(subtotal)}
                          readOnly
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="discount_inr">
                          Discount (₹)
                        </label>
                        <input
                          id="discount_inr"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.discount_inr}
                          onChange={(event) =>
                            updateForm(
                              'discount_inr',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="subsidy_inr">
                          Subsidy deduction (₹)
                        </label>
                        <input
                          id="subsidy_inr"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.subsidy_inr}
                          onChange={(event) =>
                            updateForm(
                              'subsidy_inr',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="total">
                          Total after deductions
                        </label>
                        <input
                          id="total"
                          className={total < 0 ? 'invalid-total' : ''}
                          value={formatMoney(total)}
                          readOnly
                        />
                      </div>
                    </div>

                    {total < 0 && (
                      <p className="validation-warning" role="alert">
                        Discount and subsidy exceed the subtotal.
                        Reduce the deductions before saving.
                      </p>
                    )}

                    <p className="hint">
                      Current calculation: subtotal − discount − subsidy.
                      Entering a subsidy does not verify eligibility,
                      approval or receipt.
                    </p>

                    <p className="hint">
                      Amounts shown are a preview. The database
                      recalculates and saves the final amounts,
                      rounding unit prices and line amounts to two
                      decimal places.
                    </p>

                    <div className="field notes">
                      <label htmlFor="notes">Notes</label>
                      <textarea
                        id="notes"
                        rows={4}
                        maxLength={10000}
                        value={form.notes}
                        onChange={(event) =>
                          updateForm('notes', event.target.value)
                        }
                      />
                    </div>
                  </section>

                  <div className="submit-actions">
                    <button type="submit">
                      {saving
                        ? 'Creating proposal…'
                        : 'Create draft proposal'}
                    </button>

                    {!saving && (
                      <Link href={`${base}/${leadId}`}>
                        Cancel
                      </Link>
                    )}
                  </div>

                  <p className="hint">
                    The proposal is saved as a draft. Creating it does
                    not send it to the customer.
                  </p>
                </fieldset>
              </form>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        .proposal-page {
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

        .proposal-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }

        main {
          max-width: 920px;
          margin: auto;
          padding: 32px 20px 72px;
        }

        h1 {
          margin: 0 0 8px;
        }

        h2 {
          margin: 0 0 18px;
          font-size: 19px;
        }

        h3 {
          margin: 0 0 16px;
          font-size: 16px;
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
          line-height: 1.6;
        }

        .hint {
          font-size: 12px;
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
          overflow-wrap: anywhere;
        }

        .error,
        .validation-warning {
          color: #fca5a5;
        }

        .success {
          color: #6ee7b7;
          border-color: #059669;
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

        input[readonly] {
          color: #cbd5e1;
        }

        input.invalid-total {
          color: #fca5a5;
          border-color: #ef4444;
        }

        .item {
          padding: 18px;
          border: 1px solid #475569;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .notes {
          margin-top: 18px;
        }

        button {
          border: 0;
          border-radius: 9px;
          padding: 12px 18px;
          background: #facc15;
          color: #1e293b;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .secondary {
          background: #334155;
          color: #fff;
        }

        .remove {
          margin-top: 12px;
          background: #7f1d1d;
          color: #fff;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
        }

        fieldset {
          border: 0;
          padding: 0;
          margin: 0;
          min-width: 0;
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
