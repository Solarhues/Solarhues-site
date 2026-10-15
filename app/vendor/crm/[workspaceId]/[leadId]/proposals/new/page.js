'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../../lib/supabase';
import { useAuth } from '../../../../../providers';
import Logo from '../../../../../../components/Logo';

const EMPTY_ITEM = {
  item_type: 'panel',
  description: '',
  quantity: '1',
  unit: 'unit',
  unit_price_inr: '',
};

export default function CreateProposalPage() {
  const { workspaceId, leadId } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [lead, setLead] = useState(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');

  const [proposalNumber, setProposalNumber] = useState('');
  const [systemCapacityKwp, setSystemCapacityKwp] = useState('');
  const [estimatedGeneration, setEstimatedGeneration] = useState('');
  const [estimatedSavings, setEstimatedSavings] = useState('');
  const [discount, setDiscount] = useState('');
  const [subsidy, setSubsidy] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([
    { ...EMPTY_ITEM },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadKey = `${user?.id || ''}:${workspaceId || ''}`;

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setLead(null);
    setCanWrite(false);
    setLoadedFor('');
    setAccessError('');

    if (!user?.id || !workspaceId || !leadId) {
      return () => {
        active = false;
      };
    }

    async function loadContext() {
      try {
        const [workspaceResult, memberResult, profileResult, leadResult] =
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

            supabase
              .from('crm_leads')
              .select(
                `
                id,
                workspace_id,
                customer_name,
                phone,
                email,
                city,
                state,
                building_type,
                roof_type,
                monthly_bill_inr,
                usable_roof_area_m2,
                tentative_capacity_kwp
              `
              )
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
        if (!active) return;

        const company = workspaceResult.data;
        const member = memberResult.data;
        const isAdmin = profileResult.data?.role === 'admin';
        const leadData = leadResult.data;

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

        if (!leadData) {
          throw new Error('Lead not found in this workspace.');
        }

        const memberCanWrite =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        setWorkspace(company);
        setLead(leadData);
        setCanWrite(Boolean(isAdmin || memberCanWrite));

        if (leadData.tentative_capacity_kwp) {
          setSystemCapacityKwp(
            String(leadData.tentative_capacity_kwp)
          );
        }

        const now = new Date();
        const proposalNumber = `SH-${now.getFullYear()}${String(
          now.getMonth() + 1
        ).padStart(2, '0')}-${Date.now()
          .toString()
          .slice(-6)}`;

        setProposalNumber(proposalNumber);
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
  }, [user?.id, workspaceId, leadId, loadKey]);

  function updateItem(index, field, value) {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function addItem() {
    setItems((previous) => [
      ...previous,
      { ...EMPTY_ITEM },
    ]);
  }

  function removeItem(index) {
    setItems((previous) =>
      previous.length === 1
        ? previous
        : previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  const calculatedSubtotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price_inr) || 0;

    return total + quantity * unitPrice;
  }, 0);

  const calculatedTotal = Math.max(
    0,
    calculatedSubtotal -
      (Number(discount) || 0) -
      (Number(subsidy) || 0)
  );

  function validate() {
    if (!proposalNumber.trim()) {
      return 'Please enter a proposal number.';
    }

    if (
      systemCapacityKwp !== '' &&
      (!Number.isFinite(Number(systemCapacityKwp)) ||
        Number(systemCapacityKwp) <= 0)
    ) {
      return 'System capacity must be a positive number.';
    }

    if (
      estimatedGeneration !== '' &&
      (!Number.isFinite(Number(estimatedGeneration)) ||
        Number(estimatedGeneration) < 0)
    ) {
      return 'Estimated monthly generation cannot be negative.';
    }

    if (
      estimatedSavings !== '' &&
      (!Number.isFinite(Number(estimatedSavings)) ||
        Number(estimatedSavings) < 0)
    ) {
      return 'Estimated monthly savings cannot be negative.';
    }

    if (items.length === 0) {
      return 'Add at least one proposal item.';
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];

      if (!item.description.trim()) {
        return `Please enter a description for item ${index + 1}.`;
      }

      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price_inr);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return `Quantity for item ${index + 1} must be greater than zero.`;
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return `Unit price for item ${index + 1} cannot be negative.`;
      }
    }

    if (
      discount !== '' &&
      (!Number.isFinite(Number(discount)) || Number(discount) < 0)
    ) {
      return 'Discount cannot be negative.';
    }

    if (
      subsidy !== '' &&
      (!Number.isFinite(Number(subsidy)) || Number(subsidy) < 0)
    ) {
      return 'Subsidy cannot be negative.';
    }

    if (calculatedTotal < 0) {
      return 'Discount and subsidy cannot exceed the subtotal.';
    }

    return '';
  }

  async function saveProposal(event) {
    event.preventDefault();

    if (saving) return;

    setError('');

    if (!user || !workspace || !lead || !canWrite) {
      setError('Your account cannot create proposals for this lead.');
      return;
    }

    const problem = validate();

    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);

    try {
      const subtotal = calculatedSubtotal;
      const total = calculatedTotal;

      const { data: proposal, error: proposalError } = await supabase
        .from('crm_proposals')
        .insert({
          workspace_id: workspace.id,
          lead_id: lead.id,
          proposal_number: proposalNumber.trim(),
          status: 'draft',
          system_capacity_kwp:
            systemCapacityKwp === ''
              ? null
              : Number(systemCapacityKwp),
          estimated_monthly_generation_kwh:
            estimatedGeneration === ''
              ? null
              : Number(estimatedGeneration),
          estimated_monthly_savings_inr:
            estimatedSavings === ''
              ? null
              : Number(estimatedSavings),
          subtotal_inr: subtotal,
          discount_inr: discount === '' ? 0 : Number(discount),
          subsidy_inr: subsidy === '' ? 0 : Number(subsidy),
          total_inr: total,
          notes: notes.trim() || null,
          valid_until: validUntil || null,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (proposalError) throw proposalError;

      const itemRows = items.map((item, index) => ({
        proposal_id: proposal.id,
        item_type: item.item_type,
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unit: item.unit.trim() || 'unit',
        unit_price_inr: Number(item.unit_price_inr),
        amount_inr:
          Number(item.quantity) * Number(item.unit_price_inr),
        display_order: index,
      }));

      const { error: itemsError } = await supabase
        .from('crm_proposal_items')
        .insert(itemRows);

      if (itemsError) throw itemsError;

      router.push(
        `/vendor/crm/${workspaceId}/${leadId}`
      );
    } catch (err) {
      setError(
        err.message || 'Could not create the proposal.'
      );
    } finally {
      setSaving(false);
    }
  }

  const waiting =
    loading || Boolean(user && loadedFor !== loadKey);

  return (
    <div className="proposal-page">
      <header>
        <Logo height={34} />
        <Link href={`/vendor/crm/${workspaceId}/${leadId}`}>
          ← Lead details
        </Link>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Create proposal</h1>

        {waiting && (
          <p role="status">Checking access…</p>
        )}

        {!loading && !user && (
          <div className="notice">
            Please <Link href="/vendor-login">sign in</Link> first.
          </div>
        )}

        {!waiting && user && accessError && (
          <div className="error" role="alert">
            {accessError}
          </div>
        )}

        {!waiting && user && workspace && lead && canWrite && (
          <>
            <p className="subtitle">
              {lead.customer_name}
              {lead.city ? `, ${lead.city}` : ''}
            </p>

            <form onSubmit={saveProposal} noValidate>
              {error && (
                <div className="error" role="alert">
                  {error}
                </div>
              )}

              <fieldset disabled={saving}>
                <section>
                  <h2>Proposal details</h2>

                  <div className="grid">
                    <div className="field">
                      <label htmlFor="proposal_number">
                        Proposal number *
                      </label>
                      <input
                        id="proposal_number"
                        value={proposalNumber}
                        onChange={(event) =>
                          setProposalNumber(event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="valid_until">
                        Valid until
                      </label>
                      <input
                        id="valid_until"
                        type="date"
                        value={validUntil}
                        onChange={(event) =>
                          setValidUntil(event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="capacity">
                        System capacity (kWp)
                      </label>
                      <input
                        id="capacity"
                        type="number"
                        min="0"
                        step="any"
                        value={systemCapacityKwp}
                        onChange={(event) =>
                          setSystemCapacityKwp(
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="generation">
                        Estimated monthly generation (kWh)
                      </label>
                      <input
                        id="generation"
                        type="number"
                        min="0"
                        step="any"
                        value={estimatedGeneration}
                        onChange={(event) =>
                          setEstimatedGeneration(
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="savings">
                        Estimated monthly savings (₹)
                      </label>
                      <input
                        id="savings"
                        type="number"
                        min="0"
                        step="any"
                        value={estimatedSavings}
                        onChange={(event) =>
                          setEstimatedSavings(
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h2>Proposal items</h2>

                  {items.map((item, index) => (
                    <div className="item" key={index}>
                      <div className="grid">
                        <div className="field">
                          <label>
                            Item {index + 1} type
                          </label>
                          <select
                            value={item.item_type}
                            onChange={(event) =>
                              updateItem(
                                index,
                                'item_type',
                                event.target.value
                              )
                            }
                          >
                            <option value="panel">Panel</option>
                            <option value="inverter">
                              Inverter
                            </option>
                            <option value="mounting">
                              Mounting
                            </option>
                            <option value="installation">
                              Installation
                            </option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="field">
                          <label>Description *</label>
                          <input
                            value={item.description}
                            placeholder="e.g. 545W mono PERC panel"
                            onChange={(event) =>
                              updateItem(
                                index,
                                'description',
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <div className="field">
                          <label>Quantity *</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(
                                index,
                                'quantity',
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <div className="field">
                          <label>Unit</label>
                          <input
                            value={item.unit}
                            placeholder="units, kW, set"
                            onChange={(event) =>
                              updateItem(
                                index,
                                'unit',
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <div className="field">
                          <label>Unit price (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unit_price_inr}
                            onChange={(event) =>
                              updateItem(
                                index,
                                'unit_price_inr',
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          className="remove"
                          onClick={() => removeItem(index)}
                        >
                          Remove item
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="secondary"
                    onClick={addItem}
                  >
                    + Add another item
                  </button>
                </section>

                <section>
                  <h2>Pricing</h2>

                  <div className="grid">
                    <div className="field">
                      <label>Subtotal (₹)</label>
                      <input
                        value={calculatedSubtotal.toFixed(2)}
                        readOnly
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="discount">
                        Discount (₹)
                      </label>
                      <input
                        id="discount"
                        type="number"
                        min="0"
                        step="any"
                        value={discount}
                        onChange={(event) =>
                          setDiscount(event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="subsidy">
                        Subsidy (₹)
                      </label>
                      <input
                        id="subsidy"
                        type="number"
                        min="0"
                        step="any"
                        value={subsidy}
                        onChange={(event) =>
                          setSubsidy(event.target.value)
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Total payable (₹)</label>
                      <input
                        value={calculatedTotal.toFixed(2)}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="field notes">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      rows={4}
                      maxLength={10000}
                      value={notes}
                      onChange={(event) =>
                        setNotes(event.target.value)
                      }
                    />
                  </div>
                </section>

                <button type="submit">
                  {saving
                    ? 'Creating proposal…'
                    : 'Create proposal'}
                </button>
              </fieldset>
            </form>
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
        .proposal-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }
        main {
          max-width: 920px;
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
        .subtitle { color: #94a3b8; }
        section, .notice, .error {
          margin: 20px 0;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        .error { color: #fca5a5; }
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
        input[readonly] {
          color: #94a3b8;
        }
        .item {
          padding: 18px;
          border: 1px solid #475569;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .notes { margin-top: 18px; }
        button {
          border: 0;
          border-radius: 9px;
          padding: 12px 18px;
          background: #facc15;
          color: #1e293b;
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
          opacity: .6;
          cursor: wait;
        }
        fieldset { border: 0; padding: 0; margin: 0; }
        @media (max-width: 640px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
