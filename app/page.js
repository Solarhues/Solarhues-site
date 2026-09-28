'use client';
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ⚙️ INITIALIZE THE SUPABASE LIVE CLIENT ENVIRONMENT
const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_heg2iW28ly1fTI5BRJ_0Cg_9lURldPF';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function SolarhuesComingSoon() {
  const [email, setEmail] = useState('');
  const [btnText, setBtnText] = useState('Notify me');
  const [isDisabled, setIsDisabled] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgStyle, setMsgStyle] = useState({ display: 'none' });

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setMsgText('');
    setMsgStyle({ display: 'none' });

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMsgStyle({ display: 'block', color: '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText('Enter a valid email address.');
      return;
    }

    setIsDisabled(true);
    setBtnText('Joining...');

    try {
      const { error } = await sb.from('waitlist_signups').insert({ email });

      if (error) throw error;

      setEmail('');
      setMsgStyle({ display: 'block', color: '#6EE7B7', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText("You're on the list — we'll email you at launch.");
    } catch (error) {
      if (error.code === '23505') {
        setMsgStyle({ display: 'block', color: '#6EE7B7', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
        setMsgText("You're already on the list!");
      } else {
        setMsgStyle({ display: 'block', color: '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
        setMsgText('Something went wrong — please try again.');
      }
    } finally {
      setIsDisabled(false);
      setBtnText('Notify me');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      backgroundColor: '#1e293b',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      WebkitFontSmoothing: 'antialiased'
    }}>
      
      {/* 🔮 MASTER DRIFTING GRADIENT BACKGROUND INLINE ENGINE */}
      <div style={{
        position: 'fixed',
        inset: '-10%',
        background: 'radial-gradient(circle at 15% 20%, rgba(5,150,105,0.35), transparent 45%), radial-gradient(circle at 85% 15%, rgba(250,204,21,0.25), transparent 45%), radial-gradient(circle at 50% 90%, rgba(5,150,105,0.2), transparent 50%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, flex: '1', display: 'flex', flexDirection: 'column' }}>
        
        {/* TOP BRAND NAVIGATION HEADER */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 32px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: '18px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#facc15' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#fbbf24' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#059669' }} />
            </div>
            SolarHues
          </div>
          <span style={{ fontSize: '12px', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: '20px' }}>
            Launching soon
          </span>
        </header>

        {/* CORE MIDDLE DISPLAY PANEL */}
        <main style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '12.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94E4C2', marginBottom: '18px', fontWeight: 'bold' }}>
            India's solar marketplace
          </div>
          
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '600', letterSpacing: '-0.01em', margin: '0', fontSize: '44px', lineHeight: '1.14', maxWidth: '640px' }}>
            Find the right <span style={{ background: 'linear-gradient(90deg, #facc15, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>shade of solar</span><br />for your roof.
          </h1>
          
          <p style={{ fontSize: '16px', color: '#CBD5E1', maxWidth: '480px', marginTop: '18px', lineHeight: '1.65' }}>
            SolarHues is almost ready — enter your pin code, get a real system size and payback estimate, and compare quotes from verified installers near you. We'll email you the moment we're live.
          </p>

          {/* DYNAMIC FORM REGISTRATION INTERFACE */}
          <div style={{ marginTop: '36px', width: '100%', maxWidth: '420px' }}>
            <form onSubmit={handleJoinWaitlist} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                placeholder="you@email.com" 
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: '1', padding: '13px 16px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', outline: 'none' }}
              />
              <button 
                type="submit" 
                disabled={isDisabled}
                style={{ padding: '13px 20px', borderRadius: '9px', background: '#facc15', color: '#1e293b', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', opacity: isDisabled ? 0.6 : 1 }}
              >
                {btnText}
              </button>
            </form>
            <div style={{ fontSize: '12.5px', color: '#8FA0B5', marginTop: '10px', textAlign: 'left' }}>No spam — just one email when we launch.</div>
            <div style={msgStyle}>{msgText}</div>
          </div>

          {/* VALUE PROP BADGES ACCORDION LINK */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '48px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '560px' }}>
            {["Instant sizing calculator", "Compare verified vendors", "Managed, milestone-based payments"].map((feat, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: '500' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#facc15', display: 'inline-block' }} />
                {feat}
              </div>
            ))}
          </div>
        </main>

        {/* BOTTOM LEGAL LINK STRIP FOOTER */}
        <footer style={{ padding: '26px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: '#64748B', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
          <span>© 2026 SolarHues</span>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="/calculator" style={{ color: '#64748B', textDecoration: 'none' }}>Solar Calculator</a>
            <a href="/products" style={{ color: '#64748B', textDecoration: 'none' }}>Affiliate Shop</a>
            <a href="/privacy" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#64748B', textDecoration: 'none' }}>Terms</a>
            <a href="/refunds" style={{ color: '#64748B', textDecoration: 'none' }}>Refunds</a>
          </div>

          <a href="mailto:hello@solarhues.com" style={{ color: '#94A3B8', textDecoration: 'none' }}>
            hello@solarhues.com
          </a>
        </footer>

      </div>
    </div>
  );
}
