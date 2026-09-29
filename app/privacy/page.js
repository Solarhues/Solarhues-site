'use client';
import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="pp-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :root{
          --pp-slate:#1e293b; --pp-slate-soft:#64748B; --pp-line:#E2E8F0; --pp-paper:#F8FAFC;
          --pp-emerald:#059669; --pp-sun:#facc15;
          --pp-font-body:'Inter',-apple-system,sans-serif; --pp-font-head:'Plus Jakarta Sans','Inter',sans-serif;
        }
        .pp-page{ min-height:100vh; background:var(--pp-paper); color:var(--pp-slate); font-family:var(--pp-font-body); -webkit-font-smoothing:antialiased; }

        .pp-header{ background:#fff; border-bottom:1px solid var(--pp-line); padding:18px 32px; display:flex; align-items:center; justify-content:space-between; }
        .pp-brand{ display:flex; align-items:center; gap:9px; font-family:var(--pp-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; text-decoration:none; color:var(--pp-slate); }
        .pp-dots{ display:flex; gap:4px; }
        .pp-dot{ width:9px; height:9px; border-radius:50%; }
        .pp-nav{ display:flex; gap:24px; font-size:13.5px; font-weight:600; color:var(--pp-slate-soft); }
        .pp-nav a{ color:inherit; text-decoration:none; }
        .pp-nav a:hover{ color:var(--pp-slate); }

        .pp-main{ max-width:760px; margin:0 auto; padding:56px 24px 80px; }

        .pp-eyebrow{ font-size:11.5px; font-weight:700; color:var(--pp-emerald); text-transform:uppercase; letter-spacing:0.06em; }
        .pp-title{ font-family:var(--pp-font-head); font-size:34px; font-weight:800; letter-spacing:-0.02em; margin:8px 0 6px; }
        .pp-effective{ font-size:13px; color:var(--pp-slate-soft); font-weight:600; padding-bottom:28px; border-bottom:1px solid var(--pp-line); margin-bottom:32px; }

        .pp-intro{ font-size:15px; line-height:1.75; color:#334155; }
        .pp-intro strong{ color:var(--pp-slate); }

        .pp-section{ margin-top:34px; }
        .pp-h2{ font-family:var(--pp-font-head); font-size:18px; font-weight:700; letter-spacing:-0.01em; margin:0 0 10px; }
        .pp-p{ font-size:14.5px; line-height:1.75; color:#475569; }
        .pp-p strong{ color:var(--pp-slate); }

        .pp-crosslinks{ margin-top:52px; padding-top:28px; border-top:1px solid var(--pp-line); display:flex; gap:24px; flex-wrap:wrap; }
        .pp-crosslinks a{ font-size:13.5px; font-weight:700; color:var(--pp-emerald); text-decoration:none; }
        .pp-crosslinks a:hover{ text-decoration:underline; }

        @media (max-width:640px){
          .pp-header{ padding:16px 20px; }
          .pp-main{ padding:40px 20px 60px; }
          .pp-title{ font-size:27px; }
        }
      `}</style>

      <header className="pp-header">
        <a href="/" className="pp-brand">
          <span className="pp-dots">
            <span className="pp-dot" style={{ background: '#facc15' }} />
            <span className="pp-dot" style={{ background: '#fbbf24' }} />
            <span className="pp-dot" style={{ background: '#059669' }} />
          </span>
          SolarHues
        </a>
        <nav className="pp-nav">
          <a href="/">Home</a>
          <a href="/products">Shop</a>
          <a href="/terms">Terms</a>
        </nav>
      </header>

      <main className="pp-main">
        <div className="pp-eyebrow">Legal</div>
        <h1 className="pp-title">Privacy Policy</h1>
        <div className="pp-effective">Effective date: September 28, 2026</div>

        <p className="pp-intro">
          Welcome to SolarHues, accessible at <strong>https://solarhues.com</strong>. We're a clean-energy
          marketplace that matches property owners with verified solar installers. This policy explains
          what information we collect and how we protect it.
        </p>

        <section className="pp-section">
          <h2 className="pp-h2">1. What we collect</h2>
          <p className="pp-p">
            We store property details including your 6-digit pin code, DISCOM name, sanctioned load,
            average electricity bill, and roof layout. Your contact details are verified through a
            secure OTP process.
          </p>
        </section>

        <section className="pp-section">
          <h2 className="pp-h2">2. We don't sell your data</h2>
          <p className="pp-p">
            Your location and project details are never sold to external marketing brokers. Your
            information is shared only with the installers you choose to request a quote from —
            up to three at a time.
          </p>
        </section>

        <section className="pp-section">
          <h2 className="pp-h2">3. Contact us</h2>
          <p className="pp-p">
            For questions about your data or this policy, reach our support team at{' '}
            <strong>hello@solarhues.com</strong>.
          </p>
        </section>

        <div className="pp-crosslinks">
          <a href="/terms">Terms of Service →</a>
          <a href="/refunds">Refund Policy →</a>
        </div>
      </main>
    </div>
  );
}
