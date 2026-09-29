'use client';
import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="tp-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :root{
          --tp-slate:#1e293b; --tp-slate-soft:#64748B; --tp-line:#E2E8F0; --tp-paper:#F8FAFC;
          --tp-emerald:#059669; --tp-sun:#facc15;
          --tp-font-body:'Inter',-apple-system,sans-serif; --tp-font-head:'Plus Jakarta Sans','Inter',sans-serif;
        }
        .tp-page{ min-height:100vh; background:var(--tp-paper); color:var(--tp-slate); font-family:var(--tp-font-body); -webkit-font-smoothing:antialiased; }

        .tp-header{ background:#fff; border-bottom:1px solid var(--tp-line); padding:18px 32px; display:flex; align-items:center; justify-content:space-between; }
        .tp-brand{ display:flex; align-items:center; gap:9px; font-family:var(--tp-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; text-decoration:none; color:var(--tp-slate); }
        .tp-dots{ display:flex; gap:4px; }
        .tp-dot{ width:9px; height:9px; border-radius:50%; }
        .tp-nav{ display:flex; gap:24px; font-size:13.5px; font-weight:600; color:var(--tp-slate-soft); }
        .tp-nav a{ color:inherit; text-decoration:none; }
        .tp-nav a:hover{ color:var(--tp-slate); }

        .tp-main{ max-width:760px; margin:0 auto; padding:56px 24px 80px; }
        .tp-eyebrow{ font-size:11.5px; font-weight:700; color:var(--tp-emerald); text-transform:uppercase; letter-spacing:0.06em; }
        .tp-title{ font-family:var(--tp-font-head); font-size:34px; font-weight:800; letter-spacing:-0.02em; margin:8px 0 6px; }
        .tp-effective{ font-size:13px; color:var(--tp-slate-soft); font-weight:600; padding-bottom:28px; border-bottom:1px solid var(--tp-line); margin-bottom:32px; }

        .tp-section{ margin-top:34px; }
        .tp-h2{ font-family:var(--tp-font-head); font-size:18px; font-weight:700; letter-spacing:-0.01em; margin:0 0 10px; }
        .tp-p{ font-size:14.5px; line-height:1.75; color:#475569; }

        .tp-warning{
          margin:0 0 32px; background:#FEF3C7; border:1px solid #FDE68A; border-radius:12px; padding:16px 18px;
          font-size:13px; line-height:1.6; color:#78350F;
        }
        .tp-warning strong{ display:block; margin-bottom:4px; font-family:var(--tp-font-head); font-size:13.5px; }

        .tp-crosslinks{ margin-top:52px; padding-top:28px; border-top:1px solid var(--tp-line); display:flex; gap:24px; flex-wrap:wrap; }
        .tp-crosslinks a{ font-size:13.5px; font-weight:700; color:var(--tp-emerald); text-decoration:none; }
        .tp-crosslinks a:hover{ text-decoration:underline; }

        @media (max-width:640px){
          .tp-header{ padding:16px 20px; }
          .tp-main{ padding:40px 20px 60px; }
          .tp-title{ font-size:27px; }
        }
      `}</style>

      <header className="tp-header">
        <a href="/" className="tp-brand">
          <span className="tp-dots">
            <span className="tp-dot" style={{ background: '#facc15' }} />
            <span className="tp-dot" style={{ background: '#fbbf24' }} />
            <span className="tp-dot" style={{ background: '#059669' }} />
          </span>
          SolarHues
        </a>
        <nav className="tp-nav">
          <a href="/">Home</a>
          <a href="/products">Shop</a>
          <a href="/privacy">Privacy</a>
        </nav>
      </header>

      <main className="tp-main">
        <div className="tp-eyebrow">Legal</div>
        <h1 className="tp-title">Terms of Service</h1>
        <div className="tp-effective">Effective date: September 28, 2026</div>

        <div className="tp-warning">
          <strong>⚠ Draft notice — not yet reviewed</strong>
          This content describes a direct customer-to-vendor payment model. It has not been checked
          against the actual escrow-based payment structure, and should not be published as-is. See
          the note above this code block.
        </div>

        <section className="tp-section">
          <h2 className="tp-h2">1. Aggregator platform mandate</h2>
          <p className="tp-p">
            SolarHues operates strictly as an intermediary technology framework (E-Commerce Operator).
            The site handles matching software services and does not physically construct or warranty
            solar array hardware. Engineering liability rests solely with your chosen contractor.
          </p>
        </section>

        <section className="tp-section">
          <h2 className="tp-h2">2. Direct customer-to-vendor payments</h2>
          <p className="tp-p">
            Users execute capital transactions directly into the installer's corporate bank details
            using free NEFT/IMPS/RTGS transfers. SolarHues coordinates matching data tracking, while
            project funds bypass inline clearing gateway percentages completely.
          </p>
        </section>

        <section className="tp-section">
          <h2 className="tp-h2">3. Pre-paid wallet management &amp; Section 194-O</h2>
          <p className="tp-p">
            Installers agree to fund their digital business wallet to cover the 6% marketplace
            service charge. Platform access freezes automatically if wallet credits expire. The
            system accounts for gross logs in line with Section 194-O tax parameters.
          </p>
        </section>

        <div className="tp-crosslinks">
          <a href="/privacy">Privacy Policy →</a>
          <a href="/refunds">Refund Policy →</a>
        </div>
      </main>
    </div>
  );
}
