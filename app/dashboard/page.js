'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const TARIFF = 7.5;
const YIELD_PER_KW = 120;
const SQFT_PER_KW = 100;
const COST_PER_KW = 60000;

function subsidyFor(kw) {
  if (kw >= 3) return 78000;
  if (kw >= 2) return 60000;
  if (kw >= 1) return 30000;
  return 0;
}

function sizeSystem(profile, bill) {
  if (!profile?.roof_area_sqft || !bill) return null;
  const unitsNeeded = bill / TARIFF;
  const kwByBill = unitsNeeded / YIELD_PER_KW;
  const kwByRoof = profile.roof_area_sqft / SQFT_PER_KW;
  const kw = Math.max(1, Math.floor(Math.min(kwByBill, kwByRoof)));
  const gross = kw * COST_PER_KW;
  const subsidy = subsidyFor(kw);
  const net = gross - subsidy;
  const yearlySavings = kw * YIELD_PER_KW * 12 * TARIFF;
  const payback = net / yearlySavings;
  return { kw, gross, subsidy, net, yearlySavings, payback };
}

const inr = (n) => '₹' + Math.round(Number(n || 0)).toLocaleString('en-IN');

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [requests, setRequests] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadAll(userId) {
    const [est, req, pay] = await Promise.all([
      supabase.from('solar_estimates').select('*').eq('customer_id', userId).order('created_at', { ascending: false }).limit(1),
      supabase.from('quote_requests').select('*').eq('customer_id', userId).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('customer_id', userId).order('created_at', { ascending: true }),
    ]);
    setEstimate(est.data?.[0] || null);
    const reqs = req.data || [];
    setRequests(reqs);
    setPayments(pay.data || []);

    if (reqs.length > 0) {
      const ids = reqs.map((r) => r.id);
      const { data: q } = await supabase
        .from('quotes')
        .select('*, vendors(company_name, google_rating)')
        .in('request_id', ids)
        .order('created_at', { ascending: false });
      setQuotes(q || []);
    } else {
      setQuotes([]);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!active) return;
      if (p?.role === 'admin') { window.location.href = '/admin'; return; }
      if (p?.role === 'vendor') { window.location.href = '/vendor-dashboard'; return; }
      if (!p || !p.full_name || !p.mobile || !p.pincode) {
        window.location.href = '/login';
        return;
      }
      setProfile(p);
      await loadAll(session.user.id);
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  async function requestQuotes() {
    if (!profile) return;
    const sized = sizeSystem(profile, estimate?.monthly_bill);
    setBusy(true);
    const { error } = await supabase.from('quote_requests').insert({
      customer_id: profile.id,
      estimate_id: estimate?.id || null,
      tentative_kw: sized?.kw || null,
    });
    setBusy(false);
    if (error) {
      setNote('Could not create your request: ' + error.message);
    } else {
      setNote('Your quote request has been created. Installers near you will be notified once matching is live.');
      await loadAll(profile.id);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <div className="dash">
        <p className="muted">Loading your dashboard...</p>
        <style jsx>{styles}</style>
      </div>
    );
  }

  const sized = sizeSystem(profile, estimate?.monthly_bill);
  const hasOpenRequest = requests.some((r) => r.status !== 'cancelled' && r.status !== 'completed');

  return (
    <div className="dash">
      <header className="bar">
        <Link href="/" className="logo">SolarHues</Link>
        <div className="barlinks">
          <Link href="/calculator">Calculator</Link>
          <Link href="/products">Products</Link>
          <button onClick={signOut}>Sign out</button>
        </div>
      </header>

      <main className="content">
        <h1>Welcome, {profile.full_name}</h1>
        <p className="muted">
          {profile.email} - {profile.mobile} - Pincode {profile.pincode}
        </p>

        {note && <div className="note">{note}</div>}

        <section className="panel">
          <h2>Your solar estimate</h2>
          {!sized && <p className="muted">Add your roof area and monthly bill to see an estimate.</p>}
          {sized && (
            <>
              <div className="stats">
                <div><span>System size</span><b>{sized.kw} kW</b></div>
                <div><span>Cost before subsidy</span><b>{inr(sized.gross)}</b></div>
                <div><span>PM Surya Ghar subsidy</span><b>{inr(sized.subsidy)}</b></div>
                <div><span>Net cost</span><b>{inr(sized.net)}</b></div>
                <div><span>Yearly savings</span><b>{inr(sized.yearlySavings)}</b></div>
                <div><span>Payback</span><b>{sized.payback.toFixed(1)} years</b></div>
              </div>
              <p className="fine">
                Estimate based on a tariff of Rs 7.5 per unit, 120 units per kW per month and Rs 60,000 per kW. Final prices come from installer quotes.
              </p>
            </>
          )}
          {!hasOpenRequest && (
            <button className="primary" onClick={requestQuotes} disabled={busy}>
              {busy ? 'Creating request...' : 'Request quotes from installers'}
            </button>
          )}
        </section>

        <section className="panel">
          <h2>Quotes</h2>
          {quotes.length === 0 && <p className="muted">No quotes yet. They will appear here when installers respond.</p>}
          {quotes.map((q) => (
            <div className="row" key={q.id}>
              <div>
                <b>{q.vendors?.company_name || 'Installer'}</b>
                <div className="muted">
                  Rating: {q.vendors?.google_rating ? q.vendors.google_rating + ' / 5' : 'New'}
                </div>
              </div>
              <div className="right">
                <b>{inr(q.customer_price)}</b>
                <div className="muted">includes 6% platform fee</div>
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Payment milestones</h2>
          {payments.length === 0 && <p className="muted">No payments yet. Milestones appear after you choose an installer.</p>}
          {payments.map((p) => (
            <div className="row" key={p.id}>
              <div>
                <b>{p.stage.replace('_', ' ')}</b>
                <div className="muted">{p.pct}% of project price</div>
              </div>
              <div className="right">
                <b>{inr(p.amount)}</b>
                <div className={'pill ' + p.status}>{p.status.replace('_', ' ')}</div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .dash { min-height: 100vh; background: #1e293b; color: #f8fafc; font-family: Inter, sans-serif; }
  .bar { display: flex; justify-content: space-between; align-items: center; padding: 18px clamp(16px, 5vw, 48px); border-bottom: 1px solid rgba(255,255,255,0.08); }
  .logo { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.2rem; color: #fff; text-decoration: none; }
  .barlinks { display: flex; gap: 16px; align-items: center; }
  .barlinks a { color: #cbd5e1; text-decoration: none; font-size: 0.9rem; }
  .barlinks a:hover { color: #facc15; }
  .barlinks button { padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.18); background: transparent; color: #e2e8f0; cursor: pointer; }
  .content { max-width: 900px; margin: 0 auto; padding: 32px 20px 64px; }
  h1 { font-family: 'Space Grotesk', sans-serif; font-size: 1.9rem; margin: 0 0 6px; }
  h2 { font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; margin: 0 0 16px; }
  .muted { color: #94a3b8; font-size: 0.9rem; }
  .note { margin: 16px 0; padding: 12px 16px; border-radius: 10px; background: rgba(5,150,105,0.15); color: #6ee7b7; }
  .panel { margin-top: 24px; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .stats div { padding: 14px; border-radius: 12px; background: rgba(255,255,255,0.04); }
  .stats span { display: block; color: #94a3b8; font-size: 0.8rem; margin-bottom: 4px; }
  .stats b { font-size: 1.15rem; color: #facc15; }
  .fine { margin-top: 14px; color: #64748b; font-size: 0.8rem; }
  .primary { margin-top: 18px; padding: 13px 22px; border: none; border-radius: 10px; background: #facc15; color: #1e293b; font-weight: 700; cursor: pointer; }
  .primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 0; border-top: 1px solid rgba(255,255,255,0.06); }
  .right { text-align: right; }
  .pill { display: inline-block; margin-top: 4px; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; background: rgba(56,189,248,0.15); color: #7dd3fc; }
  .pill.in_escrow, .pill.released { background: rgba(5,150,105,0.18); color: #6ee7b7; }
  .pill.due { background: rgba(250,204,21,0.15); color: #facc15; }
  .pill.refunded { background: rgba(239,68,68,0.15); color: #fca5a5; }
  @media (max-width: 640px) { .stats { grid-template-columns: repeat(2, 1fr); } }
`;
