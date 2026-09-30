'use client';
import React, { useState } from 'react';
import {
  MapPin, Home, Ruler, Zap, FileText, Camera, CheckCircle2,
  Lock, Upload, X, ArrowRight, Building2,
} from 'lucide-react';

const PLATFORM_FEE_RATE = 0.06;

// Sample data shaped to match the quotes/proposals/vendors tables from the spec.
// Swap these for real Supabase queries once auth + RLS are wired up.
const NEW_REQUESTS = [
  {
    id: 'REQ-1042',
    area: 'Koramangala, Bengaluru — 560034',
    phone: '+91 98xxxxxx12',
    address: 'Flat 4B, Sunview Apartments (full address unlocks after booking)',
    roofType: 'RCC flat',
    roofArea: 600,
    tentativeSize: 4.5,
    requestedOn: '2 hours ago',
  },
  {
    id: 'REQ-1039',
    area: 'HSR Layout, Bengaluru — 560068',
    phone: '+91 98xxxxxx77',
    address: 'Villa 12, Green Meadows (full address unlocks after booking)',
    roofType: 'Metal sheet',
    roofArea: 450,
    tentativeSize: 3.2,
    requestedOn: 'Yesterday',
  },
];

const SITE_VISITS = [
  {
    id: 'REQ-1021',
    area: 'Whitefield, Bengaluru — 560066',
    phone: '+91 98xxxxxx34',
    address: 'Full address unlocks after full 25% advance is paid',
    roofType: 'RCC flat',
    roofArea: 800,
    tentativeSize: 5.0,
    bookingPaid: true,
    bookingAmount: 10600,
  },
];

const PROPOSALS_SENT = [
  {
    id: 'REQ-0998',
    area: 'Indiranagar, Bengaluru — 560038',
    finalPrice: 318000,
    sentOn: '3 days ago',
    status: 'Awaiting customer decision',
  },
];

const ACTIVE_PROJECTS = [
  {
    id: 'REQ-0974',
    customerName: 'Anjali Rao',
    phone: '+91 98765 43210',
    address: 'Flat 4B, Sunview Apartments, Koramangala, Bengaluru — 560034',
    aadhaarMasked: 'XXXX XXXX 4821',
    panMasked: 'AXXXXX821X',
    finalPrice: 318000,
    advancePaid: 79500,
    stage: 'Ready to file DISCOM application',
  },
];

function Pill({ children, tone = 'sky' }) {
  const tones = {
    sky: { bg: '#E0F2FE', color: '#0369A1' },
    leaf: { bg: '#D1FAE5', color: '#059669' },
    sun: { bg: '#FEF9C3', color: '#854D0E' },
  };
  const t = tones[tone] || tones.sky;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 700, background: t.bg, color: t.color,
    }}>
      {children}
    </span>
  );
}

export default function VendorDashboard() {
  const [tab, setTab] = useState('requests');
  const [quoteModal, setQuoteModal] = useState(null); // request being quoted
  const [visitModal, setVisitModal] = useState(null); // request under site visit
  const [quotePrice, setQuotePrice] = useState('');
  const [visitFiles, setVisitFiles] = useState([]);

  const customerFacingPrice = quotePrice
    ? Math.round(parseFloat(quotePrice) * (1 + PLATFORM_FEE_RATE))
    : 0;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).map((f) => f.name);
    setVisitFiles(files);
  };

  const TABS = [
    { id: 'requests', label: 'New requests', count: NEW_REQUESTS.length },
    { id: 'visits', label: 'Site visits', count: SITE_VISITS.length },
    { id: 'proposals', label: 'Proposals sent', count: PROPOSALS_SENT.length },
    { id: 'active', label: 'Active projects', count: ACTIVE_PROJECTS.length },
  ];

  return (
    <div className="vd-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :root{
          --vd-slate:#1e293b; --vd-slate-soft:#64748B; --vd-line:#E2E8F0; --vd-paper:#F8FAFC;
          --vd-emerald:#059669; --vd-emerald-soft:#D1FAE5; --vd-sun:#facc15; --vd-sun-dark:#EAB308;
          --vd-font-body:'Inter',-apple-system,sans-serif; --vd-font-head:'Plus Jakarta Sans','Inter',sans-serif;
        }
        .vd-page{ min-height:100vh; background:var(--vd-paper); color:var(--vd-slate); font-family:var(--vd-font-body); -webkit-font-smoothing:antialiased; }

        .vd-header{ background:#fff; border-bottom:1px solid var(--vd-line); padding:16px 32px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
        .vd-brand{ display:flex; align-items:center; gap:9px; font-family:var(--vd-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; text-decoration:none; color:var(--vd-slate); }
        .vd-dots{ display:flex; gap:4px; }
        .vd-dot{ width:9px; height:9px; border-radius:50%; }
        .vd-account{ display:flex; align-items:center; gap:10px; font-size:13px; font-weight:600; color:var(--vd-slate-soft); }
        .vd-account-badge{ width:30px; height:30px; border-radius:50%; background:var(--vd-slate); color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; }

        .vd-main{ max-width:1080px; margin:0 auto; padding:32px 32px 70px; }
        .vd-page-title{ font-family:var(--vd-font-head); font-size:24px; font-weight:800; letter-spacing:-0.01em; margin:0 0 4px; }
        .vd-page-sub{ font-size:13.5px; color:var(--vd-slate-soft); margin-bottom:24px; }

        .vd-tabs{ display:flex; gap:4px; border-bottom:1px solid var(--vd-line); margin-bottom:24px; overflow-x:auto; }
        .vd-tab{
          font-family:var(--vd-font-body); font-size:13.5px; font-weight:700; color:var(--vd-slate-soft);
          background:none; border:none; padding:11px 16px; cursor:pointer; white-space:nowrap;
          border-bottom:2.5px solid transparent; display:flex; align-items:center; gap:7px;
        }
        .vd-tab.on{ color:var(--vd-slate); border-bottom-color:var(--vd-emerald); }
        .vd-tab-count{ background:var(--vd-line); color:var(--vd-slate-soft); font-size:11px; padding:1px 7px; border-radius:20px; }
        .vd-tab.on .vd-tab-count{ background:var(--vd-emerald-soft); color:var(--vd-emerald); }

        .vd-cards{ display:flex; flex-direction:column; gap:14px; }
        .vd-card{ background:#fff; border:1px solid var(--vd-line); border-radius:14px; padding:20px 22px; }

        .vd-card-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:14px; flex-wrap:wrap; }
        .vd-card-id{ font-size:11.5px; font-weight:700; color:var(--vd-slate-soft); letter-spacing:0.03em; }
        .vd-card-area{ font-family:var(--vd-font-head); font-size:15.5px; font-weight:700; margin-top:3px; display:flex; align-items:center; gap:6px; }

        .vd-detail-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:16px; }
        @media (max-width:760px){ .vd-detail-grid{ grid-template-columns:1fr 1fr; } }
        .vd-detail{ display:flex; flex-direction:column; gap:3px; }
        .vd-detail-label{ font-size:10.5px; font-weight:700; color:var(--vd-slate-soft); text-transform:uppercase; letter-spacing:0.04em; display:flex; align-items:center; gap:5px; }
        .vd-detail-value{ font-size:13.5px; font-weight:700; }

        .vd-privacy-note{
          margin-top:16px; display:flex; align-items:center; gap:8px; font-size:12px; color:var(--vd-slate-soft);
          background:#F8FAFC; border:1px solid var(--vd-line); padding:9px 12px; border-radius:8px;
        }

        .vd-card-actions{ margin-top:16px; display:flex; gap:10px; flex-wrap:wrap; }
        .vd-btn{
          font-family:var(--vd-font-body); font-size:13px; font-weight:700; padding:10px 16px; border-radius:9px;
          cursor:pointer; border:none; display:inline-flex; align-items:center; gap:7px;
        }
        .vd-btn-primary{ background:var(--vd-slate); color:#fff; }
        .vd-btn-primary:hover{ background:#0f172a; }
        .vd-btn-sun{ background:var(--vd-sun); color:var(--vd-slate); }
        .vd-btn-sun:hover{ background:var(--vd-sun-dark); }
        .vd-btn-outline{ background:#fff; border:1px solid var(--vd-line); color:var(--vd-slate); }
        .vd-btn-outline:hover{ border-color:var(--vd-slate-soft); }

        .vd-empty{
          border:2px dashed var(--vd-line); border-radius:14px; padding:60px 24px; text-align:center;
          color:var(--vd-slate-soft); font-size:13.5px; font-weight:600;
        }

        /* Active project card */
        .vd-unlocked-banner{
          display:flex; align-items:center; gap:8px; font-size:12px; font-weight:700; color:var(--vd-emerald);
          background:var(--vd-emerald-soft); padding:8px 12px; border-radius:8px; margin-bottom:14px;
        }

        /* Modal */
        .vd-modal-backdrop{ position:fixed; inset:0; background:rgba(15,23,42,0.5); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; }
        .vd-modal{ background:#fff; border-radius:16px; padding:28px; width:100%; max-width:460px; max-height:88vh; overflow-y:auto; }
        .vd-modal-head{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; }
        .vd-modal-title{ font-family:var(--vd-font-head); font-size:18px; font-weight:800; margin:0; }
        .vd-modal-sub{ font-size:12.5px; color:var(--vd-slate-soft); margin-top:4px; }
        .vd-modal-close{ background:none; border:none; cursor:pointer; color:var(--vd-slate-soft); padding:4px; }

        .vd-field{ margin-bottom:16px; }
        .vd-label{ display:block; font-size:12.5px; font-weight:700; color:var(--vd-slate); margin-bottom:6px; }
        .vd-input{ width:100%; padding:11px 13px; border:1px solid var(--vd-line); border-radius:9px; font-size:14px; font-family:var(--vd-font-body); background:#fff; color:var(--vd-slate); }
        .vd-input:focus{ outline:2px solid var(--vd-emerald); outline-offset:1px; border-color:transparent; }

        .vd-fee-box{
          background:var(--vd-emerald-soft); border-radius:10px; padding:14px; margin-bottom:16px; font-size:13px;
        }
        .vd-fee-row{ display:flex; justify-content:space-between; margin-top:6px; }
        .vd-fee-row.total{ font-weight:800; border-top:1px solid #A7F3D0; margin-top:10px; padding-top:10px; }

        .vd-upload-zone{
          border:1.5px dashed var(--vd-line); border-radius:10px; padding:20px; text-align:center; cursor:pointer;
          display:flex; flex-direction:column; align-items:center; gap:6px; margin-bottom:12px;
        }
        .vd-upload-zone span{ font-size:12.5px; font-weight:600; color:var(--vd-slate-soft); }
        .vd-file-chip{ font-size:12px; background:#F1F5F9; padding:6px 10px; border-radius:7px; margin-bottom:6px; display:flex; align-items:center; gap:6px; }

        .vd-modal-submit{
          width:100%; padding:13px; border-radius:9px; background:var(--vd-slate); color:#fff; border:none;
          font-family:var(--vd-font-body); font-weight:700; font-size:14.5px; cursor:pointer; margin-top:6px;
        }
        .vd-modal-submit:hover{ background:#0f172a; }

        @media (max-width:640px){
          .vd-header{ padding:14px 18px; }
          .vd-main{ padding:24px 18px 56px; }
        }
      `}</style>

      <header className="vd-header">
        <a href="/" className="vd-brand">
          <span className="vd-dots">
            <span className="vd-dot" style={{ background: '#facc15' }} />
            <span className="vd-dot" style={{ background: '#fbbf24' }} />
            <span className="vd-dot" style={{ background: '#059669' }} />
          </span>
          SolarHues
        </a>
        <div className="vd-account">
          <span className="vd-account-badge"><Building2 size={14} /></span>
          Peak Energy Solutions
        </div>
      </header>

      <main className="vd-main">
        <h1 className="vd-page-title">Vendor dashboard</h1>
        <p className="vd-page-sub">Leads, site visits, proposals, and active projects — in one place.</p>

        <div className="vd-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`vd-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label} <span className="vd-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* NEW REQUESTS */}
        {tab === 'requests' && (
          <div className="vd-cards">
            {NEW_REQUESTS.length === 0 && <div className="vd-empty">No new quote requests right now.</div>}
            {NEW_REQUESTS.map((r) => (
              <div key={r.id} className="vd-card">
                <div className="vd-card-top">
                  <div>
                    <div className="vd-card-id">{r.id} · requested {r.requestedOn}</div>
                    <div className="vd-card-area"><MapPin size={15} color="#059669" /> {r.area}</div>
                  </div>
                  <Pill tone="sky">New request</Pill>
                </div>

                <div className="vd-detail-grid">
                  <div className="vd-detail">
                    <span className="vd-detail-label"><Home size={11} /> Roof type</span>
                    <span className="vd-detail-value">{r.roofType}</span>
                  </div>
                  <div className="vd-detail">
                    <span className="vd-detail-label"><Ruler size={11} /> Roof area</span>
                    <span className="vd-detail-value">{r.roofArea} sq.ft</span>
                  </div>
                  <div className="vd-detail">
                    <span className="vd-detail-label"><Zap size={11} /> Tentative size</span>
                    <span className="vd-detail-value">{r.tentativeSize} kW</span>
                  </div>
                  <div className="vd-detail">
                    <span className="vd-detail-label">Phone</span>
                    <span className="vd-detail-value">{r.phone}</span>
                  </div>
                </div>

                <div className="vd-privacy-note">
                  <Lock size={13} /> Full name, exact address, and ID documents unlock once the customer pays the full 25% advance.
                </div>

                <div className="vd-card-actions">
                  <button className="vd-btn vd-btn-primary" onClick={() => { setQuoteModal(r); setQuotePrice(''); }}>
                    <FileText size={14} /> Send quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SITE VISITS */}
        {tab === 'visits' && (
          <div className="vd-cards">
            {SITE_VISITS.length === 0 && <div className="vd-empty">No site visits scheduled right now.</div>}
            {SITE_VISITS.map((r) => (
              <div key={r.id} className="vd-card">
                <div className="vd-card-top">
                  <div>
                    <div className="vd-card-id">{r.id}</div>
                    <div className="vd-card-area"><MapPin size={15} color="#059669" /> {r.area}</div>
                  </div>
                  <Pill tone="leaf">Booking paid — ₹{r.bookingAmount.toLocaleString('en-IN')}</Pill>
                </div>

                <div className="vd-detail-grid">
                  <div className="vd-detail">
                    <span className="vd-detail-label"><Home size={11} /> Roof type</span>
                    <span className="vd-detail-value">{r.roofType}</span>
                  </div>
                  <div className="vd-detail">
                    <span className="vd-detail-label"><Ruler size={11} /> Roof area</span>
                    <span className="vd-detail-value">{r.roofArea} sq.ft</span>
                  </div>
                  <div className="vd-detail">
                    <span className="vd-detail-label"><Zap size={11} /> Tentative size</span>
                    <span className="vd-detail-value">{r.tentativeSize} kW</span>
                  </div>
                  <div className="vd-detail">
                    <span className="vd-detail-label">Phone</span>
                    <span className="vd-detail-value">{r.phone}</span>
                  </div>
                </div>

                <div className="vd-privacy-note">
                  <Lock size={13} /> You've been shortlisted — site visit costs are borne by your company per the vendor agreement.
                </div>

                <div className="vd-card-actions">
                  <button className="vd-btn vd-btn-sun" onClick={() => { setVisitModal(r); setVisitFiles([]); }}>
                    <Camera size={14} /> Log visit &amp; submit final proposal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROPOSALS SENT */}
        {tab === 'proposals' && (
          <div className="vd-cards">
            {PROPOSALS_SENT.length === 0 && <div className="vd-empty">No proposals awaiting a decision.</div>}
            {PROPOSALS_SENT.map((r) => (
              <div key={r.id} className="vd-card">
                <div className="vd-card-top">
                  <div>
                    <div className="vd-card-id">{r.id} · sent {r.sentOn}</div>
                    <div className="vd-card-area"><MapPin size={15} color="#059669" /> {r.area}</div>
                  </div>
                  <Pill tone="sun">{r.status}</Pill>
                </div>
                <div className="vd-detail-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="vd-detail">
                    <span className="vd-detail-label">Final proposal price</span>
                    <span className="vd-detail-value" style={{ fontSize: 18 }}>₹{r.finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIVE PROJECTS */}
        {tab === 'active' && (
          <div className="vd-cards">
            {ACTIVE_PROJECTS.length === 0 && <div className="vd-empty">No active projects yet.</div>}
            {ACTIVE_PROJECTS.map((r) => (
              <div key={r.id} className="vd-card">
                <div className="vd-unlocked-banner">
                  <CheckCircle2 size={14} /> Full 25% advance received — customer details unlocked
                </div>

                <div className="vd-card-top">
                  <div>
                    <div className="vd-card-id">{r.id}</div>
                    <div className="vd-card-area">{r.customerName}</div>
                  </div>
                  <Pill tone="leaf">{r.stage}</Pill>
                </div>

                <div className="vd-detail-grid">
                  <div className="vd-detail">
                    <span className="vd-detail-label">Phone</span>
                    <span className="vd-detail-value">{r.phone}</span>
                  </div>
                  <div className="vd-detail">
                    <span className="vd-detail-label">Address</span>
                    <span className="vd-detail-value" style={{ fontSize: 12.5 }}>{r.address}</span>
                  </div>
                  <div className="vd-detail">
                    <span className="vd-detail-label">Aadhaar</span>
                    <span className="vd-detail-value">{r.aadhaarMasked}</span>
                  </div>
                  <div className="vd-detail">
                    <span className="vd-detail-label">PAN</span>
                    <span className="vd-detail-value">{r.panMasked}</span>
                  </div>
                </div>

                <div className="vd-card-actions">
                  <button className="vd-btn vd-btn-primary">
                    <FileText size={14} /> File DISCOM application
                  </button>
                  <button className="vd-btn vd-btn-outline">View full proposal</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* SEND QUOTE MODAL */}
      {quoteModal && (
        <div className="vd-modal-backdrop" onClick={() => setQuoteModal(null)}>
          <div className="vd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vd-modal-head">
              <div>
                <h3 className="vd-modal-title">Send a quote</h3>
                <p className="vd-modal-sub">{quoteModal.area} · {quoteModal.id}</p>
              </div>
              <button className="vd-modal-close" onClick={() => setQuoteModal(null)}><X size={18} /></button>
            </div>

            <div className="vd-field">
              <label className="vd-label">System size (kW)</label>
              <input className="vd-input" defaultValue={quoteModal.tentativeSize} />
            </div>
            <div className="vd-field">
              <label className="vd-label">Your price (₹, before platform fee)</label>
              <input
                className="vd-input"
                type="number"
                placeholder="e.g. 300000"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
              />
            </div>
            <div className="vd-field">
              <label className="vd-label">Panel type &amp; warranty</label>
              <input className="vd-input" placeholder="e.g. Mono PERC, 25-yr warranty" />
            </div>

            <div className="vd-fee-box">
              <div className="vd-fee-row"><span>Your price</span><span>₹{quotePrice ? parseFloat(quotePrice).toLocaleString('en-IN') : '0'}</span></div>
              <div className="vd-fee-row"><span>Platform fee (6%)</span><span>₹{quotePrice ? Math.round(parseFloat(quotePrice) * PLATFORM_FEE_RATE).toLocaleString('en-IN') : '0'}</span></div>
              <div className="vd-fee-row total"><span>Customer sees</span><span>₹{customerFacingPrice.toLocaleString('en-IN')}</span></div>
            </div>

            <button
              className="vd-modal-submit"
              onClick={() => { alert('Quote sent to the customer.'); setQuoteModal(null); }}
            >
              Send quote <ArrowRight size={15} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
            </button>
          </div>
        </div>
      )}

      {/* SITE VISIT / FINAL PROPOSAL MODAL */}
      {visitModal && (
        <div className="vd-modal-backdrop" onClick={() => setVisitModal(null)}>
          <div className="vd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vd-modal-head">
              <div>
                <h3 className="vd-modal-title">Final proposal</h3>
                <p className="vd-modal-sub">{visitModal.area} · {visitModal.id}</p>
              </div>
              <button className="vd-modal-close" onClick={() => setVisitModal(null)}><X size={18} /></button>
            </div>

            <div className="vd-field">
              <label className="vd-label">Confirmed system size (kW)</label>
              <input className="vd-input" defaultValue={visitModal.tentativeSize} />
            </div>
            <div className="vd-field">
              <label className="vd-label">Final price (₹, before platform fee)</label>
              <input className="vd-input" type="number" placeholder="e.g. 300000" />
            </div>
            <div className="vd-field">
              <label className="vd-label">Site visit notes</label>
              <textarea className="vd-input" rows={3} placeholder="Roof condition, shading, structural notes..." />
            </div>

            <div className="vd-field">
              <label className="vd-label">Drawings &amp; design files</label>
              <label className="vd-upload-zone">
                <Upload size={20} color="#64748B" />
                <span>Upload layout diagram, single-line diagram, structural drawing</span>
                <input type="file" multiple accept=".pdf,.dwg,.png,.jpg" style={{ display: 'none' }} onChange={handleFileSelect} />
              </label>
              {visitFiles.map((f, i) => (
                <div key={i} className="vd-file-chip"><FileText size={12} /> {f}</div>
              ))}
              {/* TODO: wire to Supabase Storage bucket for proposal drawings */}
            </div>

            <button
              className="vd-modal-submit"
              onClick={() => { alert('Final proposal sent to the customer.'); setVisitModal(null); }}
            >
              Submit final proposal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
