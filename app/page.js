'use client';
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
 
const SUPABASE_URL = 'https://qcnvqmomlzvlkquryreb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_heg2iW28ly1fTI5BRJ_0Cg_9lURldPF';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
 
export default function SolarhuesComingSoon() {
  const [email, setEmail] = useState('');
  const [btnText, setBtnText] = useState('Notify me');
  const [isDisabled, setIsDisabled] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgType, setMsgType] = useState('');
 
  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setMsgText('');
    setMsgType('');
 
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMsgType('err');
      setMsgText('Enter a valid email address.');
      return;
    }
 
    setIsDisabled(true);
    setBtnText('Joining...');
 
    try {
      const { error } = await sb.from('waitlist_signups').insert({ email });
      if (error) throw error;
 
      setEmail('');
      setMsgType('ok');
      setMsgText("You're on the list — we'll email you at launch.");
    } catch (error) {
      if (error.code === '23505') {
        setMsgType('ok');
        setMsgText("You're already on the list!");
      } else {
        setMsgType('err');
        setMsgText('Something went wrong — please try again.');
      }
    } finally {
      setIsDisabled(false);
      setBtnText('Notify me');
    }
  };
 
  return (
    <div className="sh-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
 
        :root{
          --sh-font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --sh-font-head: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
        }
 
        .sh-page{
          min-height:100vh; position:relative; display:flex; flex-direction:column;
          overflow-x:hidden; background:#1e293b; color:#fff;
          font-family:var(--sh-font-body); -webkit-font-smoothing:antialiased;
          text-rendering:optimizeLegibility;
        }
        .sh-glow{
          position:fixed; inset:-10%;
          background:
            radial-gradient(circle at 15% 20%, rgba(5,150,105,0.35), transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(250,204,21,0.25), transparent 45%),
            radial-gradient(circle at 50% 90%, rgba(5,150,105,0.2), transparent 50%);
          filter:blur(60px); z-index:0; pointer-events:none;
        }
        .sh-wrap{ position:relative; z-index:1; flex:1; display:flex; flex-direction:column; }
 
        .sh-header{ display:flex; align-items:center; justify-content:space-between; padding:28px 32px; }
        .sh-brand{ display:flex; align-items:center; gap:9px; font-family:var(--sh-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; }
        .sh-dots{ display:flex; gap:4px; }
        .sh-dot{ width:9px; height:9px; border-radius:50%; }
        .sh-status{ font-family:var(--sh-font-body); font-size:12px; color:#CBD5E1; border:1px solid rgba(255,255,255,0.18); padding:5px 12px; border-radius:20px; }
 
        .sh-main{ flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px 24px; }
        .sh-kicker{ font-family:var(--sh-font-body); font-size:12.5px; letter-spacing:0.08em; text-transform:uppercase; color:#94E4C2; margin-bottom:18px; font-weight:700; }
        .sh-h1{ font-family:var(--sh-font-head); font-weight:700; letter-spacing:-0.02em; margin:0; font-size:44px; line-height:1.14; max-width:640px; }
        .sh-hue{ background:linear-gradient(90deg,#facc15,#059669); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .sh-sub{ font-family:var(--sh-font-body); font-size:16px; color:#CBD5E1; max-width:480px; margin-top:18px; line-height:1.65; }
 
        .sh-cta-row{ display:flex; gap:12px; margin-top:32px; flex-wrap:wrap; justify-content:center; }
        .sh-cta-primary{
          font-family:var(--sh-font-body); padding:14px 26px; border-radius:9px; background:#facc15; color:#1e293b;
          font-weight:700; font-size:14.5px; text-decoration:none; display:inline-flex; align-items:center; gap:8px;
        }
        .sh-cta-primary:hover{ background:#eab308; }
        .sh-cta-secondary{
          font-family:var(--sh-font-body); padding:14px 26px; border-radius:9px; border:1px solid rgba(255,255,255,0.25); color:#fff;
          font-weight:600; font-size:14.5px; text-decoration:none;
        }
        .sh-cta-secondary:hover{ border-color:#fff; }
 
        .sh-divider{ font-family:var(--sh-font-body); display:flex; align-items:center; gap:12px; width:100%; max-width:420px; margin:40px 0 8px; color:#64748B; font-size:12px; }
        .sh-divider::before, .sh-divider::after{ content:""; flex:1; height:1px; background:rgba(255,255,255,0.12); }
 
        .sh-waitlist{ width:100%; max-width:420px; }
        .sh-waitlist-row{ display:flex; gap:8px; }
        .sh-input{
          font-family:var(--sh-font-body); flex:1; padding:13px 16px; border-radius:9px; border:1px solid rgba(255,255,255,0.18);
          background:rgba(255,255,255,0.06); color:#fff; font-size:14px; min-width:0;
        }
        .sh-input::placeholder{ color:#8FA0B5; }
        .sh-input:focus{ outline:2px solid #facc15; outline-offset:1px; }
        .sh-btn{
          font-family:var(--sh-font-body); padding:13px 20px; border-radius:9px; background:#facc15; color:#1e293b;
          font-weight:700; font-size:14px; white-space:nowrap; cursor:pointer; border:none;
        }
        .sh-btn:hover{ background:#eab308; }
        .sh-btn:disabled{ opacity:0.6; cursor:default; }
        .sh-note{ font-family:var(--sh-font-body); font-size:12.5px; color:#8FA0B5; margin-top:10px; text-align:left; }
        .sh-msg{ font-family:var(--sh-font-body); font-size:13.5px; margin-top:12px; font-weight:700; text-align:left; }
        .sh-msg.ok{ color:#6EE7B7; }
        .sh-msg.err{ color:#FCA5A5; }
 
        .sh-features{ display:flex; gap:28px; margin-top:48px; flex-wrap:wrap; justify-content:center; max-width:560px; }
        .sh-feature{ font-family:var(--sh-font-body); font-size:13px; color:#94A3B8; display:flex; align-items:center; gap:7px; font-weight:500; }
        .sh-feature-dot{ width:6px; height:6px; border-radius:50%; background:#facc15; display:inline-block; flex-shrink:0; }
 
        .sh-footer{
          font-family:var(--sh-font-body); padding:26px 32px; display:flex; justify-content:space-between; align-items:center;
          font-size:12.5px; color:#64748B; border-top:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; gap:14px;
        }
        .sh-footer-links{ display:flex; gap:16px; flex-wrap:wrap; }
        .sh-footer a{ color:#64748B; text-decoration:none; }
        .sh-footer a:hover{ color:#fff; }
 
        @media (max-width:640px){
          .sh-header{ padding:20px; }
          .sh-h1{ font-size:30px; }
          .sh-sub{ font-size:14.5px; }
          .sh-cta-row{ flex-direction:column; width:100%; max-width:340px; }
          .sh-cta-primary, .sh-cta-secondary{ justify-content:center; text-align:center; }
          .sh-waitlist-row{ flex-direction:column; }
          .sh-btn{ width:100%; justify-content:center; }
          .sh-features{ gap:16px 22px; }
          .sh-footer{ flex-direction:column; align-items:flex-start; padding:22px 20px; }
        }
      `}</style>
 
      <div className="sh-glow" />
 
      <div className="sh-wrap">
        <header className="sh-header">
          <div className="sh-brand">
            <span className="sh-dots">
              <span className="sh-dot" style={{ background: '#facc15' }} />
              <span className="sh-dot" style={{ background: '#fbbf24' }} />
              <span className="sh-dot" style={{ background: '#059669' }} />
            </span>
            SolarHues
          </div>
          <span className="sh-status">Launching soon</span>
        </header>
 
        <main className="sh-main">
          <div className="sh-kicker">India's solar marketplace</div>
 
          <h1 className="sh-h1">
            Find the right <span className="sh-hue">shade of solar</span><br />for your roof.
          </h1>
 
          <p className="sh-sub">
            The full marketplace is almost ready — but the sizing calculator is live right now.
            Enter your pin code, get a real system size and payback estimate, and we'll email you
            the moment vendor quotes go live.
          </p>
 
          <div className="sh-cta-row">
            <a href="/calculator" className="sh-cta-primary">Try the free calculator →</a>
            <a href="#notify" className="sh-cta-secondary">Notify me at launch</a>
          </div>
 
          <div className="sh-divider">or get notified</div>
 
          <div className="sh-waitlist" id="notify">
            <form onSubmit={handleJoinWaitlist} className="sh-waitlist-row">
              <label htmlFor="sh-email" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                Email address
              </label>
              <input
                id="sh-email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sh-input"
              />
              <button type="submit" disabled={isDisabled} className="sh-btn">{btnText}</button>
            </form>
            <div className="sh-note">No spam — just one email when we fully launch.</div>
            {msgText && <div className={`sh-msg ${msgType}`}>{msgText}</div>}
          </div>
 
          <div className="sh-features">
            {['Instant sizing calculator', 'Compare verified vendors', 'Managed, milestone-based payments'].map((feat, i) => (
              <div key={i} className="sh-feature">
                <span className="sh-feature-dot" />
                {feat}
              </div>
            ))}
          </div>
        </main>
 
        <footer className="sh-footer">
          <span>© 2026 SolarHues</span>
          <div className="sh-footer-links">
            <a href="/calculator">Solar Calculator</a>
            <a href="/products">Affiliate Shop</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
            <a href="/refunds">Refunds</a>
          </div>
          <a href="mailto:hello@solarhues.com">hello@solarhues.com</a>
        </footer>
      </div>
    </div>
  );
}
