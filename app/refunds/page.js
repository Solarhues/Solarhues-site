'use client';
import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="rp-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :root{
          --rp-slate:#1e293b; --rp-slate-soft:#64748B; --rp-line:#E2E8F0; --rp-paper:#F8FAFC;
          --rp-emerald:#059669; --rp-sun:#facc15;
          --rp-font-body:'Inter',-apple-system,sans-serif; --rp-font-head:'Plus Jakarta Sans','Inter',sans-serif;
        }
        .rp-page{ min-height:100vh; background:var(--rp-paper); color:var(--rp-slate); font-family:var(--rp-font-body); -webkit-font-smoothing:antialiased; }

        .rp-header{ background:#fff; border-bottom:1px solid var(--rp-line); padding:18px 32px; display:flex; align-items:center; justify-content:space-between; }
        .rp-brand{ display:flex; align-items:center; gap:9px; font-family:var(--rp-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; text-decoration:none; color:var(--rp-slate); }
        .rp-dots{ display:flex; gap:4px; }
        .rp-dot{ width:9px; height:9px; border-radius:50%; }
        .rp-nav{ display:flex; gap:24px; font-size:13.5px; font-weight:600; color:var(--rp-slate-soft); }
        .rp-nav a{ color:inherit; text-decoration:none; }
        .rp-nav a:hover{ color:var(--rp-slate); }

        .rp-main{ max-width:760px; margin:0 auto; padding:56px 24px 80px; }
        .rp-eyebrow{ font-size:11.5px; font-weight:700; color:var(--rp-emerald); text-transform:uppercase; letter-spacing:0.06em; }
        .rp-title{ font-family:var(--rp-font-head); font-size:34px; font-weight:800; letter-spacing:-0.02em; margin:8px 0 6px; }
        .rp-effective{ font-size:13px; color:var(--rp-slate-soft); font-weight:600; padding-bottom:28px; border-bottom:1px solid var(--rp-line); margin-bottom:32px; }

        .rp-section{ margin-top:34px; }
        .rp-h2{ font-family:var(--rp-font-head); font-size:18px; font-weight:700; letter-spacing:-0.01em; margin:0 0 10px; }
        .rp-p{ font-size:14.5px; line-height:1.75; color:#475569; }

        .rp-warning{
          margin:0 0 32px; background:#FEF3C7; border:1px solid #FDE68A; border-radius:12px; padding:16px 18px;
          font-size:13px; line-height:1.6; color:#78350F;
        }
        .rp-warning strong{ display:block; margin-bottom:4px; font-family:var(--rp-font-head); font-size:13.5px; }

        .rp-crosslinks{ margin-top:52px; padding-top:28px; border-top:1px solid var(--rp-line); display:flex; gap:24px; flex-wrap:wrap; }
        .rp-crosslinks a{ font-size:13.5px; font-weight:700; color:var(--rp-emerald); text-decoration:none; }
        .rp-crosslinks a:hover{ text-decoration:underline; }

        @media (max-width:640px){
          .rp-header{ padding:16px 20px; }
          .rp-main{ padding:40px 20px 60px; }
          .rp-title{ font-size:27px; }
        }
      `}</style>

      <header className="rp-header">
        <a href="/" className="rp-brand">
          <span className="rp-dots">
            <span className="rp-dot" style={{ background: '#facc15' }} />
            <span className="rp-dot" style={{ background: '#fbbf24' }} />
            <span className="rp-dot" style={{ background: '#059669' }} />
          </span>
          SolarHues
        </a>
        <nav className="rp-nav">
          <a href="/">Home</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </header>

      <main className="rp-main">
        <div className="rp-eyebrow">Legal</div>
        <h1 className="rp-title">Cancellation &amp; Refunds</h1>
        <div className="rp-effective">Effective date: September 28, 2026</div>

        <div className="rp-warning">
          <strong>⚠ Draft notice — not yet reviewed</strong>
          This content describes refunds returned directly by the installer, and only covers the
          10% advance. It hasn't been checked against the escrow model (both the 10% and 15% are
          refundable pre-filing, with admin approval) — see the note above this code block.
        </div>

        <section className="rp-section">
          <h2 className="rp-h2">1. Stage 1 booking reversals</h2>
          <p className="rp-p">
            Customers can cancel a matched booking before the physical roof survey or DISCOM file
            step. In this case, the installer must return 100% of the 10% advance within 7 business
            days, and SolarHues returns the 6% wallet credits.
          </p>
        </section>

        <section className="rp-section">
          <h2 className="rp-h2">2. Technical unfeasibility clause</h2>
          <p className="rp-p">
            If the physical on-site survey shows that structural roof damage or permanent shade
            obstructions make the solar installation unsafe or impossible, the contract terminates.
            The customer receives a full return of their advance.
          </p>
        </section>

        <section className="rp-section">
          <h2 className="rp-h2">3. Post-filing lockout status</h2>
          <p className="rp-p">
            Once engineering blueprints are approved and files are submitted to the local electrical
            DISCOM, the project layout becomes non-refundable due to custom allocation parameters.
          </p>
        </section>

        <div className="rp-crosslinks">
          <a href="/privacy">Privacy Policy →</a>
          <a href="/terms">Terms of Service →</a>
        </div>
      </main>
    </div>
  );
}
