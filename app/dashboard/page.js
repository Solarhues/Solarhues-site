'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../providers';

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

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load dashboard data
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        // Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (cancelled) return;
        setProfile(profileData);

        // Estimates
        const { data: estimatesData, error: estimatesError } = await supabase
          .from('solar_estimates')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (estimatesError) throw estimatesError;
        if (cancelled) return;
        setEstimates(estimatesData || []);

        // Quote requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;
        if (cancelled) return;
        setQuoteRequests(requestsData || []);

        // Quotes (via quote_requests -> quotes join)
        const requestIds = (requestsData || []).map((r) => r.id);

        let quotesData = [];
        if (requestIds.length > 0) {
          const { data: quotesDataRaw, error: quotesError } = await supabase
            .from('quotes')
            .select('*')
            .in('request_id', requestIds)
            .order('created_at', { ascending: false });

          if (quotesError) throw quotesError;
          quotesData = quotesDataRaw || [];
        }
        if (cancelled) return;
        setQuotes(quotesData);

        // Payments (linked to customer via quote_requests or directly via customer_id if you add it)
        // For MVP, we assume quotes have customer_id or you can join via request_id.
        const quoteIds = quotesData.map((q) => q.id);
        let paymentsData = [];
        if (quoteIds.length > 0) {
          const { data: paymentsDataRaw, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .in('quote_id', quoteIds)
            .order('created_at', { ascending: false });

          if (paymentsError) throw paymentsError;
          paymentsData = paymentsDataRaw || [];
        }
        if (cancelled) return;
        setPayments(paymentsData);
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
      <div className="min-h-screen bg-[#1e293b] text-white flex items-center justify-center">
        <p className="text-lg">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-white flex items-center justify-center">
        <p className="text-lg text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e293b] text-white">
      <header className="border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customer Dashboard</h1>
          <div className="text-sm text-slate-300">
            {profile?.email}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Profile summary */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300">
              Name: {profile?.full_name || 'Not set'}
            </p>
            <p className="text-slate-300">
              Phone: {profile?.phone || 'Not set'}
            </p>
            <p className="text-slate-300">
              City: {profile?.city || 'Not set'}
            </p>
            <p className="text-slate-300">
              State: {profile?.state || 'Not set'}
            </p>
          </div>
        </section>

        {/* Solar estimates */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your solar estimates</h2>
          {estimates.length === 0 ? (
            <p className="text-slate-300">
              No estimates yet. Use the calculator to create one.
            </p>
          ) : (
            <div className="space-y-4">
              {estimates.map((est) => (
                <div key={est.id} className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-300">
                    Roof area: {est.roof_area_sqft} sq ft
                  </p>
                  <p className="text-slate-300">
                    Monthly bill: ₹{est.monthly_bill_inr}
                  </p>
                  <p className="text-slate-300">
                    Recommended system: {est.recommended_system_kw} kW
                  </p>
                  <p className="text-slate-300">
                    Estimated generation: {est.estimated_generation_kwh_per_year} kWh/year
                  </p>
                  <p className="text-slate-300">
                    Created: {new Date(est.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quote requests */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quote requests</h2>
          {quoteRequests.length === 0 ? (
            <p className="text-slate-300">
              No quote requests yet.
            </p>
          ) : (
            <div className="space-y-4">
              {quoteRequests.map((req) => (
                <div key={req.id} className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-300">
                    Request ID: {req.id}
                  </p>
                  <p className="text-slate-300">
                    Status: {req.status || 'pending'}
                  </p>
                  <p className="text-slate-300">
                    Created: {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quotes */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quotes received</h2>
          {quotes.length === 0 ? (
            <p className="text-slate-300">
              No quotes yet. Vendors will send quotes after you request them.
            </p>
          ) : (
            <div className="space-y-4">
              {quotes.map((q) => (
                <div key={q.id} className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-300">
                    Quote ID: {q.id}
                  </p>
                  <p className="text-slate-300">
                    System size: {q.system_size_kw} kW
                  </p>
                  <p className="text-slate-300">
                    Total price: ₹{q.total_price_inr}
                  </p>
                  <p className="text-slate-300">
                    Platform fee: ₹{q.platform_fee_inr}
                  </p>
                  <p className="text-slate-300">
                    Customer price: ₹{q.customer_price_inr}
                  </p>
                  <p className="text-slate-300">
                    Status: {q.status || 'pending'}
                  </p>
                  <p className="text-slate-300">
                    Created: {new Date(q.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Milestones / payments */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Project milestones</h2>
          {payments.length === 0 ? (
            <p className="text-slate-300">
              No milestones yet. They will appear once you select a vendor and start a project.
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((p) => (
                <div key={p.id} className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-300">
                    Milestone: {p.milestone_type}
                  </p>
                  <p className="text-slate-300">
                    Amount: ₹{p.amount_inr}
                  </p>
                  <p className="text-slate-300">
                    Status: {p.status || 'pending'}
                  </p>
                  <p className="text-slate-300">
                    Updated: {new Date(p.updated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
