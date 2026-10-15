'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../providers';
import Logo from '../../../../../components/Logo';

const STATUSES = [
  ['pending', 'Pending'],
  ['paid', 'Paid'],
  ['overdue', 'Overdue'],
  ['cancelled', 'Cancelled'],
];

const PURPOSES = {
  advance: 'Advance payment',
  material: 'Material payment',
  installation: 'Installation payment',
  final: 'Final payment',
  other: 'Other payment',
};

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isOverdue(payment) {
  if (!payment.due_date) return false;
  if (payment.status !== 'pending') return false;

  const due = new Date(payment.due_date);
  const now = new Date();

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return due < endOfToday;
}

export default function PaymentsPage() {
  const { workspaceId } = useParams();
  const { user, loading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [canRead, setCanRead] = useState(false);
  const [loadedFor, setLoadedFor] = useState('');
  const [accessError, setAccessError] = useState('');

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadKey = `${user?.id || ''}:${workspaceId || ''}`;

  useEffect(() => {
    let active = true;

    setWorkspace(null);
    setCanRead(false);
    setLoadedFor('');
    setAccessError('');
    setPayments([]);

    if (!user?.id || !workspaceId) {
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

        const memberCanRead =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        setWorkspace(company);
        setCanRead(Boolean(isAdmin || memberCanRead));
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
  }, [user?.id, workspaceId, loadKey]);

  useEffect(() => {
    let active = true;

    setPayments([]);
    setPaymentsError('');

    if (!user?.id || !workspaceId || !canRead) {
      return () => {
        active = false;
      };
    }

    async function loadPayments() {
      setPaymentsLoading(true);

      try {
        let query = supabase
          .from('crm_payment_requests')
          .select(
            `
            id,
            request_number,
            purpose,
            status,
            amount_inr,
            due_date,
            paid_at,
            paid_amount_inr,
            payment_method,
            payment_reference,
            created_at,
            lead_id,
            crm_leads (
              id,
              customer_name,
              phone,
              email,
              city,
              state
            ),
            crm_proposals (
              id,
              proposal_number
            )
          `
          )
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error: paymentsQueryError } = await query;

        if (paymentsQueryError) throw paymentsQueryError;
        if (!active) return;

        setPayments(data || []);
      } catch (err) {
        if (active) {
          setPaymentsError(
            err.message || 'Could not load payment requests.'
          );
        }
      } finally {
        if (active) setPaymentsLoading(false);
      }
    }

    loadPayments();

    return () => {
      active = false;
    };
  }, [user?.id, workspaceId, canRead, statusFilter]);

  const visiblePayments = payments.filter((payment) => {
    if (!search.trim()) return true;

    const term = search.trim().toLowerCase();
    const lead = payment.crm_leads;

    return (
      payment.request_number.toLowerCase().includes(term) ||
      lead?.customer_name?.toLowerCase().includes(term) ||
      lead?.phone?.includes(term) ||
      lead?.email?.toLowerCase().includes(term)
    );
  });

  const overdueCount = visiblePayments.filter(isOverdue).length;

  const waiting =
    loading || Boolean(user && loadedFor !== loadKey);

  return (
    <div className="payments-page">
      <header>
        <Logo height={34} />
        <Link href={`/vendor/crm/${workspaceId}`}>
          ← Leads list
        </Link>
      </header>

      <main>
        <p className="eyebrow">Installer CRM</p>
        <h1>Payment requests</h1>

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
            {accessError}
          </div>
        )}

        {!waiting && user && workspace && !canRead && (
          <div className="notice">
            Only workspace owners, sales staff and SolarHues admins
            can view payment requests.
          </div>
        )}

        {!waiting && user && workspace && canRead && (
          <>
            <p className="subtitle">{workspace.company_name}</p>

            <div className="toolbar">
              <input
                type="search"
                aria-label="Search payment requests"
                placeholder="Search request, customer, phone or email"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              <select
                aria-label="Filter payment requests by status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">All statuses</option>
                {STATUSES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <Link
                href={`/vendor/crm/${workspaceId}`}
                className="secondary-link"
              >
                Leads
              </Link>
            </div>

            {overdueCount > 0 && (
              <div className="overdue-banner" role="status">
                {overdueCount} pending payment request
                {overdueCount === 1 ? ' is' : 's are'} overdue.
              </div>
            )}

            {paymentsError && (
              <div className="error" role="alert">
                {paymentsError}
              </div>
            )}

            {paymentsLoading ? (
              <p role="status">Loading payment requests…</p>
            ) : visiblePayments.length === 0 ? (
              <div className="empty">
                <h2>No payment requests found</h2>
                <p>
                  Create a payment request from a lead, or change
                  the search or status filter.
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Customer</th>
                      <th>Purpose</th>
                      <th>Amount</th>
                      <th>Due date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visiblePayments.map((payment) => {
                      const lead = payment.crm_leads;
                      const overdue = isOverdue(payment);

                      return (
                        <tr
                          key={payment.id}
                          className={overdue ? 'overdue' : ''}
                        >
                          <td>
                            <span className="request-number">
                              {payment.request_number}
                            </span>
                            <span className="meta">
                              Created{' '}
                              {formatDate(payment.created_at)}
                            </span>
                          </td>

                          <td>
                            {lead ? (
                              <Link
                                href={`/vendor/crm/${workspaceId}/${lead.id}`}
                                className="customer-link"
                              >
                                {lead.customer_name}
                              </Link>
                            ) : (
                              '—'
                            )}

                            <span className="meta">
                              {lead?.phone || '—'}
                            </span>
                          </td>

                          <td>
                            {PURPOSES[payment.purpose] ||
                              payment.purpose}
                          </td>

                          <td>
                            {formatMoney(payment.amount_inr)}
                          </td>

                          <td>
                            {formatDate(payment.due_date)}
                          </td>

                          <td>
                            <span
                              className={`status status-${payment.status}`}
                            >
                              {overdue
                                ? 'Overdue'
                                : STATUSES.find(
                                    ([value]) =>
                                      value === payment.status
                                  )?.[1] || payment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        .payments-page {
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
        .payments-page :global(a) {
          color: #facc15;
          text-decoration: none;
        }
        main {
          max-width: 1100px;
          margin: auto;
          padding: 32px 20px 72px;
        }
        h1 { margin: 0 0 8px; }
        .eyebrow {
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-size: 12px;
        }
        .subtitle { color: #94a3b8; }
        .toolbar {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) 190px auto;
          gap: 12px;
          margin: 24px 0;
        }
        input, select {
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
        .secondary-link {
          display: inline-flex;
          align-items: center;
          padding: 12px 16px;
          border: 1px solid #64748b;
          border-radius: 9px;
          background: #0f172a;
          color: #fff !important;
          font-weight: 600;
          white-space: nowrap;
        }
        .overdue-banner {
          margin: 0 0 18px;
          padding: 14px 18px;
          border: 1px solid #f87171;
          border-radius: 12px;
          background: rgba(127,29,29,.35);
          color: #fecaca;
        }
        .notice, .error, .empty {
          margin: 20px 0;
          padding: 24px;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        .error { color: #fca5a5; }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid #475569;
          border-radius: 14px;
          background: rgba(255,255,255,.03);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 860px;
        }
        th, td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid #334155;
          vertical-align: top;
        }
        th {
          color: #94a3b8;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        tr:last-child td { border-bottom: 0; }
        tr.overdue td {
          background: rgba(127,29,29,.18);
        }
        .request-number {
          display: block;
          font-weight: 600;
        }
        .customer-link {
          color: #facc15 !important;
          font-weight: 600;
        }
        .meta {
          display: block;
          color: #94a3b8;
          font-size: 12px;
          margin-top: 3px;
          overflow-wrap: anywhere;
        }
        .status {
          display: inline-block;
          padding: 4px 9px;
          border-radius: 999px;
          background: #334155;
          font-size: 12px;
        }
        .status-paid { background: #059669; }
        .status-cancelled { background: #7f1d1d; }
        .empty {
          text-align: center;
        }
        @media (max-width: 760px) {
          .toolbar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
