'use client';
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_heg2iW28ly1fTI5BRJ_0Cg_9lURldPF';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [btnText, setBtnText] = useState('Send Magic Link');
  const [isDisabled, setIsDisabled] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgStyle, setMsgStyle] = useState({ display: 'none' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsgText('');
    setMsgStyle({ display: 'none' });

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMsgStyle({ display: 'block', color: '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText('Enter a valid email address.');
      return;
    }

    setIsDisabled(true);
    setBtnText('Sending link...');

    const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://solarhues-site.vercel.app';

    try {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectOrigin,
        },
      });

      if (error) throw error;

      setEmail('');
      setMsgStyle({ display: 'block', color: '#6EE7B7', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText('Check your inbox! We sent a secure login link.');
    } catch (error) {
      setMsgStyle({ display: 'block', color: '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsDisabled(false);
      setBtnText('Send Magic Link');
    }
  };

  return (
    <>
      <div className="top">
        <a href="/" className="brand">
          <span className="hue-dots">
            <span></span><span></span><span></span>
          </span>
          SolarHues
        </a>
        {/* Synced Top Navigation Menu Array */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/calculator" className="pill-status">
            Calculator
          </a>
          <a href="/products" className="pill-status">
            Products
          </a>
          <div className="pill-status" style={{ background: 'rgba(255,255,255,0.05)', color: '#94E4C2', borderColor: 'var(--emerald)' }}>
            Secure Portal
          </div>
        </div>
      </div>

      <div className="center">
        <div className="kicker">Customer Access</div>
        <h1>Welcome back to <span className="hue">SolarHues</span>.</h1>
        <p className="sub">Enter your email below. We will send a passwordless login link directly to your inbox to keep your account instantly secure.</p>

        <div className="waitlist">
          <form onSubmit={handleLogin} className="waitlist-row">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isDisabled}
              required
            />
            <button type="submit" disabled={isDisabled}>
              {btnText}
            </button>
          </form>
          <div style={msgStyle}>{msgText}</div>
          <p className="waitlist-note">No password required. Securely managed via Supabase Shield.</p>
        </div>
      </div>

      <div className="bottom">
        <div>© 2026 SolarHues. All rights reserved.</div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </>
  );
}
