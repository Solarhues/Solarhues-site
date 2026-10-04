'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../providers';

function formatDate(value) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function EmptyState({ children }) {
  return <p className="dashboard-empty">{children}</p>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const { data: estimatesData, error: estimatesError } = await supabase
          .from('solar_estimates')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (estimatesError) throw estimatesError;

        const { data: requestsData, error: requestsError } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;

        const requestIds = (requestsData || []).map((request) => request.id);

        let quotesData = [];

        if (requestIds.length > 0) {
          const { data, error: quotesError } = await supabase
            .from('quotes')
            .select('*')
            .in('request_id', requestIds)
            .order('created_at', { ascending: false });

          if (quotesError) throw quotesError;
          quotesData = data || [];
        }

        const quoteIds = quotesData.map((quote) => quote.id);

        let paymentsData = [];

        if (quoteIds.length > 0) {
          const { data, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .in('quote_id', quoteIds)
            .order('created_at', { ascending: false });

          if (paymentsError) throw paymentsError;
          paymentsData = data || [];
        }

        if (!cancelled) {
          setProfile(
            profileData || {
              email: user.email,
              full_name: '',
              phone: '',
              city: '',
              state: '',
            }
          );
          setEstimates(estimatesData || []);
          setQuoteRequests(requestsData || []);
          setQuotes(quotesData);
          setPayments(paymentsData);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);

        if (!cancelled) {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">Loading your dashboard…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">{error}</div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">SolarHues</p>
            <h1>Customer Dashboard</h1>
            <p className="dashboard-subtitle">
              Track your solar estimate, quotes, and project progress.
            </p>
          </div>

          <div className="dashboard-account">
            <span className="account-label">Signed in as</span>
            <span>{profile?.email || user?.email}</span>
          </div>
        </header>

        <section className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-label">Solar estimates</span>
            <strong>{estimates.length}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Quote requests</span>
            <strong>{quoteRequests.length}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Quotes received</span>
            <strong>{quotes.length}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Project milestones</span>
            <strong>{payments.length}</strong>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Account</p>
              <h2>Your profile</h2>
            </div>
          </div>

          <div className="profile-grid">
            <div>
              <span className="field-label">Name</span>
              <span>{profile?.full_name || 'Not set'}</span>
            </div>

            <div>
              <span className="field-label">Phone</span>
              <span>{profile?.phone || 'Not set'}</span>
            </div>

            <div>
              <span className="field-label">City</span>
              <span>{profile?.city || 'Not set'}</span>
            </div>

            <div>
              <span className="field-label">State</span>
              <span>{profile?.state || 'Not set'}</span>
            </div>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Calculator</p>
              <h2>Your solar estimates</h2>
            </div>

            <button
              className="primary-button"
              onClick={() => router.push('/calculator')}
            >
              New estimate
            </button>
          </div>

          {estimates.length === 0 ? (
            <EmptyState>
              No estimates yet. Start with the solar calculator to understand
              your possible system size and savings.
            </EmptyState>
          ) : (
            <div className="record-grid">
              {estimates.map((estimate) => (
                <article className="record-card" key={estimate.id}>
                  <div className="record-card-top">
                    <span className="status-badge">Estimate</span>
                    <span>{formatDate(estimate.created_at)}</span>
                  </div>

                  <h3>
                    {estimate.recommended_system_kw || '—'} kW recommended
                  </h3>

                  <div className="record-details">
                    <span>
                      Monthly bill:{' '}
                      {formatCurrency(estimate.monthly_bill_inr)}
                    </span>
                    <span>
                      Roof area: {estimate.roof_area_sqft || '—'} sq ft
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Marketplace</p>
              <h2>Quote requests</h2>
            </div>
          </div>

          {quoteRequests.length === 0 ? (
            <EmptyState>
              No quote requests yet. Once you submit a request, matched
              installers will be shown here.
            </EmptyState>
          ) : (
            <div className="record-grid">
              {quoteRequests.map((request) => (
                <article className="record-card" key={request.id}>
                  <div className="record-card-top">
                    <span className="status-badge">
                      {request.status || 'Pending'}
                    </span>
                    <span>{formatDate(request.created_at)}</span>
                  </div>

                  <h3>Installer quotes request</h3>

                  <div className="record-details">
                    <span>Pincode: {request.pincode || '—'}</span>
                    <span>
                      System size: {request.preferred_system_kw || '—'} kW
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Compare</p>
              <h2>Quotes received</h2>
            </div>
          </div>

          {quotes.length === 0 ? (
            <EmptyState>
              No installer quotes yet. Quotes will appear here after vendors
              respond to your request.
            </EmptyState>
          ) : (
            <div className="record-grid">
              {quotes.map((quote) => (
                <article className="record-card" key={quote.id}>
                  <div className="record-card-top">
                    <span className="status-badge">
                      {quote.status || 'Submitted'}
                    </span>
                    <span>{formatDate(quote.created_at)}</span>
                  </div>

                  <h3>
                    {quote.system_size_kw || '—'} kW solar system
                  </h3>

                  <div className="record-details">
                    <span>
                      Customer price:{' '}
                      {formatCurrency(quote.customer_price_inr)}
                    </span>
                    <span>
                      Installation days:{' '}
                      {quote.estimated_installation_days || '—'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Project tracking</p>
              <h2>Project milestones</h2>
            </div>
          </div>

          {payments.length === 0 ? (
            <EmptyState>
              Project milestones will appear after you select an installer and
              begin the project.
            </EmptyState>
          ) : (
            <div className="record-grid">
              {payments.map((payment) => (
                <article className="record-card" key={payment.id}>
                  <div className="record-card-top">
                    <span className="status-badge">
                      {payment.status || 'Pending'}
                    </span>
                    <span>{formatDate(payment.updated_at)}</span>
                  </div>

                  <h3>{payment.milestone || payment.milestone_type}</h3>

                  <div className="record-details">
                    <span>
                      Amount: {formatCurrency(payment.amount_inr)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
