'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_...';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function CustomerAccessPortal() {
  const [email, setEmail] = useState('');
  const [btnText, setBtnText] = useState('Send Magic Link');
  const [isDisabled, setIsDisabled] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgStyle, setMsgStyle] = useState({ display: 'none' });

  // Profile Form States
  const [isNewUser, setIsNewUser] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [roofArea, setRoofArea] = useState('');
  const [roofType, setRoofType] = useState('Concrete Flat Roof');
  const [monthlyBill, setMonthlyBill] = useState('');

  useEffect(() => {
    // Listen for incoming auth tokens automatically on confirmation redirect loops
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) checkProfileExistence(session.user);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) checkProfileExistence(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfileExistence = async (user) => {
    setActiveUser(user);
    const { data, error } = await sb.from('customer_profiles').select('*').eq('id', user.id).single();
    
    if (data) {
      window.location.href = '/dashboard'; // Profile exists, bypass signup form directly
    } else {
      setIsNewUser(true); // Profile missing, open details registration wizard panel
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsgText('');
    setMsgStyle({ display: 'none' });

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setMsgStyle({ display: 'block', color: '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText('Enter a valid email address.');
      return;
    }

    setIsDisabled(true);
    setBtnText('Sending link...');
    const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://solarhues.com';

    try {
      const { error } = await sb.auth.signInWithOtp({
        email: cleanEmail,
        options: { emailRedirectTo: `${originUrl}/login` }, // Routes back into this component callback listener
      });
      if (error) throw error;
      setMsgStyle({ display: 'block', color: '#6EE7B7', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText('Check your inbox! We sent a secure link.');
    } catch (err) {
      setMsgStyle({ display: 'block', color: '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText(err.message || 'Authentication failed.');
    } finally {
      setIsDisabled(false);
      setBtnText('Send Magic Link');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (pincode.length !== 6 || phone.length < 10) {
      alert('Please check your phone number and 6-digit pin code entry settings.');
      return;
    }

    const { error } = await sb.from('customer_profiles').insert({
      id: activeUser.id,
      full_name: fullName,
      phone_number: phone,
      area_pincode: pincode,
      roof_area_sqft: Number(roofArea),
      monthly_bill_inr: Number(monthlyBill),
      roof_type: roofType
    });

    if (error) {
      alert('Error updating profile repository: ' + error.message);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <>
      <style>{`
        .form-box { width: 100%; max-width: 480px; margin-top: 24px; text-align: left; padding: 0 16px; }
        .row-item { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .grid-split { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .inp { padding: 14px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.05); color: #fff; font-size: 14px; outline: none; }
        .inp:focus { border-color: var(--sun, #facc15); }
        .s-btn { width: 100%; padding: 14px; border-radius: 8px; background: var(--sun, #facc15); color: #1e293b; font-weight: 700; border: none; cursor: pointer; font-size: 15px; margin-top: 10px; }
      `}</style>

      <div className="top">
        <a href="/" className="brand">
          <span className="hue-dots"><span></span><span></span><span></span></span>SolarHues
        </a>
      </div>

      <div className="center" style={{ padding: '24px 16px' }}>
        {!isNewUser ? (
          /* SECTION A: Passwordless Authentication Hub Entry */
          <div className="form-box">
            <div className="kicker">Access Portal</div>
            <h1>Log In or Sign Up</h1>
            <p className="sub" style={{ marginBottom: '24px' }}>Enter your email below. New users can securely register their structural rooftop parameters in the next step.</p>
            <form onSubmit={handleLogin} style={{ display: 'flex', gap: '8px' }}>
              <input type="email" className="inp" style={{ flex: 1 }} placeholder="Enter email address..." value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className="inp" style={{ background: 'var(--sun)', color: '#1e293b', fontWeight: '700', cursor: 'pointer' }} disabled={isDisabled}>{btnText}</button>
            </form>
            <div style={msgStyle}>{msgText}</div>
          </div>
        ) : (
          /* SECTION B: Core Customer Rooftop Parameter Initialization Wizard */
          <div className="form-box" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '28px', borderRadius: '14px' }}>
            <div className="kicker" style={{ color: 'var(--sun)' }}>Setup Required</div>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', fontFamily: 'Space Grotesk' }}>Configure Roof Metrics</h2>
            <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: '0 0 20px 0' }}>Link your residential parameters to match live vetted installation quotation pipelines instantly.</p>
            
            <form onSubmit={handleSaveProfile}>
              <div className="row-item">
                <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Full Name</label>
                <input type="text" className="inp" placeholder="e.g. Aarav Sharma" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="grid-split">
                <div className="row-item">
                  <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Mobile Number</label>
                  <input type="text" className="inp" placeholder="10-Digit Phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))} required />
                </div>
                <div className="row-item">
                  <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Area Pincode</label>
                  <input type="text" maxLength={6} className="inp" placeholder="6-Digits" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g,''))} required />
                </div>
              </div>
              <div className="grid-split">
                <div className="row-item">
                  <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Usable Roof Space (Sq.Ft)</label>
                  <input type="number" className="inp" placeholder="e.g. 500" value={roofArea} onChange={(e) => setRoofArea(e.target.value)} required />
                </div>
                <div className="row-item">
                  <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Avg Monthly Bill (₹)</label>
                  <input type="number" className="inp" placeholder="e.g. 4500" value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)} required />
                </div>
              </div>
              <div className="row-item">
                <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Roof Structure Type</label>
                <select className="inp" style={{ background: '#2e3a4e' }} value={roofType} onChange={(e) => setRoofType(e.target.value)}>
                  <option value="Concrete Flat Roof">Concrete Flat Roof</option>
                  <option value="Metal Tin Shade">Metal Tin Shade</option>
                  <option value="Slanted Clay Tile">Slanted Clay Tile</option>
                </select>
              </div>
              <button type="submit" className="s-btn">Initialize Marketplace Dashboard →</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
