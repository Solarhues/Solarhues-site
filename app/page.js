'use client';
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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
    <>
      <div className="top">
        <div className="brand">
          <span className="hue-dots">
            <span></span><span></span><span></span>
          </span>
          SolarHues
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/login" className="pill-status" style={{ transition: 'background 0.2s, border-color 0.2s' }}>
            Customer Login →
          </a>
          <div className="pill-status" style={{ background: 'rgba(255,255,255,0.05)' }}>Launching soon</div>
        </div>
      </div>

      <div className="center">
        <div className="kicker">India's solar marketplace</div>
        <h1>Find the right <span className="hue">shade of solar</span><br />for your roof.</h1>
        <p className="sub">We are mapping rooftop solar potentials across Indian cities. Join the waitlist to get early priority access to vetted vendors and tailored generation calculators.</p>

        <div className="waitlist">
          <form onSubmit={handleJoinWaitlist} className="waitlist-row">
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
          <p className="waitlist-note">Zero spam. Only updates regarding launch windows in your region.</p>
        </div>

        <div className="features">
          <div><span className="dot"></span> 3,000+ Roofs Mapped</div>
          <div><span className="dot"></span> Verified EPC Vendors</div>
          <div><span className="dot"></span> Instant ROI Estimator</div>
        </div>
      </div>

      <div className="bottom">
        <div>© 2026 SolarHues. All rights reserved.</div>
        <div className="footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </>
  );
}
