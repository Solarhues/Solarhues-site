'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const TABS = ['Vendors', 'Customers', 'Milestones', 'Audit log', 'Settings'];

export default function AdminPage() {
  const [state, setState] = useState('loading');
  const [tab, setTab] = useState('Vendors');
  const [vendors, setVendors] = useState([]);
  const [docs, setDocs] = useState({});
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [audit, setAudit] = useState([]);
  const [settings, setSettings] = useState([]);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const [v, d, c, p, a, s] = await Promise.all([
      supabase.from('vendors').select('*').order('created_at', { ascending: false }),
      supabase.from('vendor_documents').select('*'),
      supabase.from('profiles').select('id,full_name,email,mobile,pincode,roof_type,roof_area_sqft,created_at').eq('role', 'customer').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('app_settings').select('*').order('key'),
    ]);
    setVendors(v.data || []);
    const grouped = {};
    (d.data || []).forEach((x) => {
      if (!grouped[x.vendor_id]) grouped[x.vendor_id] = [];
      grouped[x.vendor_id].push(x);
    });
    setDocs(grouped);
    setCustomers(c.data || []);
    setPayments(p.data || []);
    setAudit(a.data || []);
    setSettings(s.data || []);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (data?.role !== 'admin') { setState('denied'); return; }
      setState('ok');
      load();
    })();
  }, [load]);

  const flash = (m) => { setNote(m); setTimeout(() => setNote(''), 4000); };

  async function approveVendor(v) {
    const { error } = await supabase.from('vendors').update({ status: 'approved', rejection_reason: null }).eq('id', v.id);
    if (error) return flash('Error: ' + error.message);
    await supabase.from('profiles').update({ role: 'vendor' }).eq('id', v.user_id);
    const { data: u } = await supabase.auth.getUser();
    await supabase.from('audit_log').insert({ action: 'vendor_approved', entity: 'vendors', entity_id: v.id, actor_id: u.user.id });
    flash(`${v.company_name} approved.`);
    load();
  }

  async function rejectVendor(v) {
    const reason = window.prompt('Reason for rejection (required):');
    if (!reason || !reason.trim()) return;
    const { error } = await supabase.from('vendors').update({ status: 'rejected', rejection_reason: reason.trim() }).eq('id', v.id);
    if (error) return flash('Error: ' + error.message);
    const { data: u } = await supabase.auth.getUser();
    await supabase.from('audit_log').insert({ action: 'vendor_rejected', entity: 'vendors', entity_id: v.id, reason: reason.trim(), actor_id: u.user.id });
    flash(`${v.company_name} rejected.`);
    load();
  }

  async function viewDoc(path) {
    const { data, error } = await supabase.storage.from('vendor-documents').createSignedUrl(path, 120);
    if (error) return flash('Cannot open file: ' + error.message);
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  async function overridePayment(p) {
    const reason = window.prompt('Reason for overriding this milestone (required, will be logged):');
    if (!reason || !reason.trim()) return;
    const { error } = await supabase.rpc('admin_override_payment', { pay_id: p.id, reason: reason.trim() });
    if (error) return flash('Error: ' + error.message);
    flash('Milestone overridden and logged.');
    load();
  }

  async function saveSetting(key, value) {
    const { error } = await supabase.from('app_settings').update({ value: String(value) }).eq('key', key);
    flash(error ? 'Error: ' + error.message : `${key} saved.`);
  }

  if (state === 'loading') {
    return (<div className="box"><p>Checking access…</p><style jsx>{base}</style></div>);
  }
  if (state === 'denied') {
    return (<div className="box"><h1>Access denied</h1><p>This area is for administrators only.</p><a href="/">Back to home</a><style jsx>{base}</style></div>);
  }

  const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN') : '');
  const pending = vendors.filter((v) => v.status === 'pending').length;

  return (
    <div className="wrap">
      <header>
        <h1>SolarHues Admin</h1>
        <button className="out" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}>Sign out</button>
      </header>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t}{t === 'Vendors' && pending ? ` (${pending})` : ''}
          </button>
        ))}
      </nav>
      {note && <div className="note">{note}</div>}

      {tab === 'Vendors' && (
        <section>
          {vendors.length === 0 && <p className="muted">No vendor applications yet.</p>}
          {vendors.map((v) => (
            <div className="row" key={v.id}>
              <div>
                <b>{v.company_name}</b> <span className={`pill ${v.status}`}>{v.status}</span>
                <div className="muted">{v.owner_name} · {v.phone} · {v.pincode} · GST {v.gst_number || '—'}</div>
                <div className="docs">
                  {(docs[v.id] || []).length === 0 && <span className="muted">No documents uploaded</span>}
                  {(docs[v.id] || []).map((d) => (
                    <button key={d.id} className="link" onClick={() => viewDoc(d.file_path)}>{d.doc_type.replace(/_/g, ' ')}</button>
                  ))}
                </div>
                {v.rejection_reason && <div className="muted">Reason: {v.rejection_reason}</div>}
              </div>
              <div className="acts">
                {v.status !== 'approved' && <button className="ok" onClick={() => approveVendor(v)}>Approve</button>}
                {v.status !== 'rejected' && <button className="bad" onClick={() => rejectVendor(v)}>Reject</button>}
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === 'Customers' && (
        <section>
          {customers.length === 0 && <p className="muted">No customers yet.</p>}
          {customers.map((c) => (
            <div className="row" key={c.id}>
              <div>
                <b>{c.full_name || '(profile incomplete)'}</b>
                <div className="muted">{c.email} · {c.mobile || '—'} · {c.pincode || '—'} · {c.roof_type || '—'} {c.roof_area_sqft ? `· ${c.roof_area_sqft} sq.ft` : ''}</div>
              </div>
              <span className="muted">{fmt(c.created_at)}</span>
            </div>
          ))}
        </section>
      )}

      {tab === 'Milestones' && (
        <section>
          {payments.length === 0 && <p className="muted">No payments yet.</p>}
          {payments.map((p) => (
            <div className="row" key={p.id}>
              <div>
                <b>{p.stage.replace('_', ' ')}</b> · {p.pct}% · ₹{Number(p.amount).toLocaleString('en-IN')} <span className={`pill ${p.status}`}>{p.status.replace('_', ' ')}</span>
                {p.admin_override && <div className="muted">Overridden: {p.override_reason}</div>}
              </div>
              {p.status !== 'released' && p.status !== 'refunded' && (
                <button className="bad" onClick={() => overridePayment(p)}>Override</button>
              )}
            </div>
          ))}
        </section>
      )}

      {tab === 'Audit log' && (
        <section>
          {audit.length === 0 && <p className="muted">Nothing logged yet.</p>}
          {audit.map((a) => (
            <div className="row" key={a.id}>
              <div><b>{a.action.replace(/_/g, ' ')}</b><div className="muted">{a.reason || ''}</div></div>
              <span className="muted">{fmt(a.created_at)}</span>
            </div>
          ))}
        </section>
      )}

      {tab === 'Settings' && (
        <section>
          {settings.map((s) => (
            <div className="row" key={s.key}>
              <b>{s.key === 'vendor_radius_km' ? 'Vendor radius (km)' : s.key === 'platform_fee_pct' ? 'Platform fee (%)' : s.key}</b>
              <form onSubmit={(e) => { e.preventDefault(); saveSetting(s.key, e.target.v.value); }} className="acts">
                <input name="v" defaultValue={s.value} type="number" step="any" />
                <button className="ok" type="submit">Save</button>
              </form>
            </div>
          ))}
        </section>
      )}
      <style jsx>{base}</style>
    </div>
  );
}

const base = `
  .box, .wrap { min-height: 100vh; background: #1e293b; color: #f8fafc; font-family: Inter, sans-serif; padding: 24px clamp(16px, 5vw, 48px); }
  .box a { color: #facc15; }
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  h1 { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 1.6rem; }
  .tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .tabs button, .out { padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #e2e8f0; cursor: pointer; }
  .tabs button.on { border-color: #facc15; color: #facc15; }
  .note { margin-bottom: 16px; padding: 10px 14px; border-radius: 10px; background: rgba(5,150,105,0.15); color: #6ee7b7; }
  .row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px; margin-bottom: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
  .muted { color: #94a3b8; font-size: 0.88rem; margin-top: 4px; }
  .pill { margin-left: 8px; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; background: rgba(56,189,248,0.15); color: #7dd3fc; }
  .pill.approved, .pill.released, .pill.in_escrow { background: rgba(5,150,105,0.18); color: #6ee7b7; }
  .pill.pending, .pill.due { background: rgba(250,204,21,0.15); color: #facc15; }
  .pill.rejected, .pill.refunded { background: rgba(239,68,68,0.15); color: #fca5a5; }
  .docs { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
  .link { background: none; border: none; color: #facc15; text-decoration: underline; cursor: pointer; padding: 0; text-transform: capitalize; }
  .acts { display: flex; gap: 8px; align-items: center; }
  .ok, .bad { padding: 8px 16px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; }
  .ok { background: #059669; color: #fff; }
  .bad { background: rgba(239,68,68,0.2); color: #fca5a5; }
  input { padding: 8px 10px; width: 100px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.05); color: #fff; }
`;
