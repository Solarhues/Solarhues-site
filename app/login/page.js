'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase as sb } from '../../lib/supabase';

export default function CustomerAccessPortal() {
  const [email, setEmail] = useState('');
  const [btnText, setBtnText] = useState('Send Magic Link');
  const [isDisabled, setIsDisabled] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgStyle, setMsgStyle] = useState({ display: 'none' });

  const [isNewUser, setIsNewUser] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [roofArea, setRoofArea] = useState('');
  const [roofType, setRoofType] = useState('Concrete Flat Roof');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [saving, setSaving] = useState(false);
  const checkedFor = useRef(null);

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) checkProfile(session.user);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) checkProfile(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (user) => {
    if (checkedFor.current === user.id) return;
    checkedFor.current = user.id;
    setActiveUser(user);

    const { data } = await sb
      .from('profiles')
      .select('role, full_name, mobile, pincode')
      .eq('id', user.id)
      .single();

    if (data?.role === 'admin') { window.location.href = '/admin'; return; }
    if (data?.role === 'vendor') { window.location.href = '/vendor-dashboard'; return; }

    const complete = data && data.full_name && data.mobile && data.pincode;
    if (complete) window.location.href = '/dashboard';
    else setIsNewUser(true);
  };

  const showMsg = (text, ok) => {
    setMsgStyle({ display: 'block', color: ok ? '#6EE7B7' : '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
    setMsgText(text);
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  const cleanEmail = email.trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    showMsg('Enter a valid email address.', false);
    return;
  }

  setIsDisabled(true);
  setBtnText('Sending link...');

  try {
    const redirectUrl = `${window.location.origin}/auth/callback`;

   const { error } = await sb.auth.signInWithOtp({
  email: cleanEmail,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});

    if (error) throw error;

    showMsg('Check your inbox! We sent a secure link.', true);
  } catch (err) {
    showMsg(err.message || 'Authentication failed.', false);
  } finally {
    setIsDisabled(false);
    setBtnText('Send Magic Link');
  }
};

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (pincode.length !== 6 || phone.length !== 10) {
      alert('Please enter a 10-digit mobile number and a 6-digit pincode.');
      return;
    }
    setSaving(true);

    const { error } = await sb
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        mobile: phone,
        pincode,
        roof_area_sqft: Number(roofArea),
        roof_type: roofType,
      })
      .eq('id', activeUser.id);

    if (error) {
      setSaving(false);
      alert('Could not save your profile: ' + error.message);
      return;
    }

    await sb.from('solar_estimates').insert({
      customer_id: activeUser.id,
      pincode,
      roof_type: roofType,
      roof_area_sqft: Number(roofArea),
      monthly_bill: Number(monthlyBill),
    });

    window.location.href = '/dashboard';
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
        .s-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="top">
        <a href="/" className="brand">
          <span className="hue-dots"><span></span><span></span><span></span></span>SolarHues
        </a>
      </div>

      <div className="center" style={{ padding: '24px 16px' }}>
        {!isNewUser ? (
          <div className="form-box">
            <div className="kicker">Access Portal</div>
            <h1>Log In or Sign Up</h1>
            <p className="sub" style={{ marginBottom: '24px' }}>Enter your email below. New users can securely register their rooftop details in the next step.</p>
            <form onSubmit={handleLogin} style={{ display: 'flex', gap: '8px' }}>
              <input type="email" className="inp" style={{ flex: 1 }} placeholder="Enter email address..." value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className="inp" style={{ background: 'var(--sun, #facc15)', color: '#1e293b', fontWeight: '700', cursor: 'pointer' }} disabled={isDisabled}>{btnText}</button>
            </form>
            <div style={msgStyle}>{msgText}</div>
          </div>
        ) : (
          <div className="form-box" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', borderRadius: '14px' }}>
            <div className="kicker" style={{ color: 'var(--sun, #facc15)' }}>Setup Required</div>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', fontFamily: 'Space Grotesk' }}>Configure Roof Details</h2>
            <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: '0 0 20px 0' }}>Share your roof details so we can match you with verified installers near you.</p>

            <form onSubmit={handleSaveProfile}>
              <div className="row-item">
                <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Full Name</label>
                <input type="text" className="inp" placeholder="e.g. Aarav Sharma" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="grid-split">
                <div className="row-item">
                  <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Mobile Number</label>
                  <input type="tel" inputMode="numeric" maxLength={10} className="inp" placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} required />
                </div>
                <div className="row-item">
                  <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Area Pincode</label>
                  <input type="text" inputMode="numeric" maxLength={6} className="inp" placeholder="6 digits" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} required />
                </div>
              </div>
              <div className="grid-split">
                <div className="row-item">
                  <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Usable Roof Space (sq.ft)</label>
                  <input type="number" min="1" className="inp" placeholder="e.g. 500" value={roofArea} onChange={(e) => setRoofArea(e.target.value)} required />
                </div>
                <div className="row-item">
                  <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Avg Monthly Bill (₹)</label>
                  <input type="number" min="1" className="inp" placeholder="e.g. 4500" value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)} required />
                </div>
              </div>
              <div className="row-item">
                <label style={{ fontSize: '13px', color: '#CBD5E1' }}>Roof Type</label>
                <select className="inp" style={{ background: '#2e3a4e' }} value={roofType} onChange={(e) => setRoofType(e.target.value)}>
                  <option value="Concrete Flat Roof">Concrete Flat Roof</option>
                  <option value="Metal Tin Shade">Metal Tin Shade</option>
                  <option value="Slanted Clay Tile">Slanted Clay Tile</option>
                </select>
              </div>
              <button type="submit" className="s-btn" disabled={saving}>{saving ? 'Saving...' : 'Continue to Dashboard →'}</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
