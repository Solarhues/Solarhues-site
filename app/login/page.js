'use client';
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Dynamically pulling these configs from your secure Vercel environment matrix
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnlhgnnxunqghvdfuvke.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_xNBsUzhB6ujPKglfHpQkqQ_zNNpgBmH';
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

    // Streamlined validation matching clean standard email structures
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setMsgStyle({ display: 'block', color: '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText('Enter a valid email address.');
      return;
    }

    setIsDisabled(true);
    setBtnText('Sending link...');

    const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://vercel.app';

    try {
      const { error } = await sb.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectOrigin + '/dashboard',
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
      {/* Core Scoped Style Definitions to Override Default Browser Elements */}
      <style>{`
        .login-box {
          width: 100%;
          max-width: 460px;
          margin-top: 32px;
          text-align: left;
          padding: 0 16px;
        }
        .login-row {
          display: flex;
          gap: 10px;
          align-items: stretch;
          width: 100%;
        }
        .login-input {
          flex: 1;
          padding: 16px 20px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          outline: none;
          height: 54px;
          transition: border-color 0.2s;
        }
        .login-input:focus {
          border-color: var(--sun, #facc15);
        }
        .login-btn {
          padding: 0 24px;
          border-radius: 10px;
          background: var(--sun, #facc15);
          color: #1e293b;
          font-weight: 700;
          font-size: 15px;
          font-family: 'Space Grotesk', sans-serif;
          white-space: nowrap;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-btn:hover {
          background: var(--sun-dark, #eab308);
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        
        @media (max-width: 600px) {
          .login-row {
            flex-direction: column;
            gap: 12px;
          }
          .login-input, .login-btn {
            width: 100% !important;
            height: 52px !important;
          }
        }
      `}</style>

      <div className="top">
        <a href="/" className="brand">
          <span className="hue-dots">
            <span></span><span></span><span></span>
          </span>
          SolarHues
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/calculator" className="pill-status">Calculator</a>
          <a href="/products" className="pill-status">Products</a>
        </div>
      </div>

      <div className="center">
        <div className="kicker">Customer Access</div>
        <h1 style={{ fontSize: '36px', lineHeight: '1.2' }}>
          Welcome back to <span className="hue">SolarHues</span>.
        </h1>
        <p className="sub" style={{ marginTop: '12px' }}>
          Enter your email below. We will send a passwordless login link directly to your inbox to keep your account instantly secure.
        </p>

        {/* Structured Form Container */}
        <div className="login-box">
          <form onSubmit={handleLogin} className="login-row">
            <input
              type="email"
              className="login-input"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isDisabled}
              required
            />
            <button type="submit" className="login-btn" disabled={isDisabled}>
              {btnText}
            </button>
          </form>
          <div style={msgStyle}>{msgText}</div>
          <p className="waitlist-note" style={{ marginTop: '14px', color: '#64748B' }}>
            No password required. Securely managed via Supabase Shield.
          </p>
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
