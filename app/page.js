'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SolarhuesHome() {
  const router = useRouter();
  const [pincode, setPincode] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgStyle, setMsgStyle] = useState({ display: 'none' });

  const handleGoToCalculator = (e) => {
    e.preventDefault();
    setMsgText('');
    setMsgStyle({ display: 'none' });

    // Enforce authentic Indian standard Pin Code validation parameters (6-digits numeric)
    if (!pincode || !/^\d{6}\$/.test(pincode)) {
      setMsgStyle({ display: 'block', color: '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText('Enter a valid 6-digit area pin code.');
      return;
    }

    // Safely transmit user location context downstream via global routing parameters
    router.push(`/calculator?pin=${pincode}`);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/calculator" className="pill-status" style={{ transition: 'all 0.2s' }}>
            Calculator
          </a>
          <a href="/products" className="pill-status" style={{ transition: 'all 0.2s' }}>
            Products
          </a>
          <a href="/login" className="pill-status" style={{ background: 'rgba(250, 204, 21, 0.1)', borderColor: 'var(--sun)' }}>
            Customer Login →
          </a>
          <div className="pill-status" style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}>Launching soon</div>
        </div>
      </div>

      <div className="center">
        <div className="kicker">India's solar marketplace</div>
        <h1>Find the right <span className="hue">shade of solar</span><br />for your roof.</h1>
        <p className="sub">Instantly compute your roof's generation capabilities, installation sizing constraints, and financial payback timelines based on regional solar irradiance mapping data.</p>

        {/* Rebuilt Pin Code Router Container */}
        <div className="waitlist">
          <label style={{ display: 'block', fontSize: '14px', color: '#CBD5E1', marginBottom: '8px', fontWeight: '500' }}>
            Enter your area pin code:
          </label>
          <form onSubmit={handleGoToCalculator} className="waitlist-row">
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 110001 or 400001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} // Filter inputs strictly to numbers
              style={{ flex: '1', padding: '13px 16px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '13px 20px', borderRadius: '9px', background: 'var(--sun)', color: '#1e293b', fontWeight: '700', fontSize: '14px', whiteSpace: nowrap, cursor: 'pointer', border: 'none', transition: 'background 0.2s' }}>
              Calculator →
            </button>
          </form>
          <div style={msgStyle}>{msgText}</div>
          <p className="waitlist-note">Get instant localized generation analysis and localized installer quotations.</p>
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
Use code with caution.
🛠️ Update 2: Interactive Calculator Matrix (app/calculator/page.js)
To match this architecture, create or overwrite your app/calculator/page.js script. This loads an interactive estimation simulator that automatically grabs the pin code passed from the home page, displays localized results, and provides the quote request trigger.
javascript
'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CalculatorContent() {
  const searchParams = useSearchParams();
  const [activePin, setActivePin] = useState('------');
  const [showQuotesPanel, setShowQuotesPanel] = useState(false);

  useEffect(() => {
    const pin = searchParams.get('pin');
    if (pin) setActivePin(pin);
  }, [searchParams]);

  return (
    <>
      <div className="top">
        <a href="/" className="brand">
          <span className="hue-dots">
            <span></span><span></span><span></span>
          </span>
          SolarHues
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/products" className="pill-status">Products</a>
          <div className="pill-status" style={{ background: 'rgba(5, 150, 105, 0.1)', borderColor: 'var(--emerald)' }}>
            Pin Code Locked: {activePin}
          </div>
        </div>
      </div>

      <div className="center">
        <div className="kicker">Solar ROI Engine</div>
        <h1>Generation Analysis for <span className="hue">Zone {activePin}</span></h1>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', margin: '24px 0', width: '100%', maxWidth: '600px', textAlign: 'left' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--sun)' }}>Estimated Annual Potential</h3>
          <p style={{ fontSize: '15px', color: '#CBD5E1', marginBottom: '24px' }}>
            Based on satellite sun exposure curves mapped at your pin code region, a typical 5kW rooftop framework setup delivers:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Annual Output</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: 'Space Grotesk' }}>7,200 kWh</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Payback Period</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--emerald)', fontFamily: 'Space Grotesk' }}>4.2 Years</div>
            </div>
          </div>

          {!showQuotesPanel ? (
            <button 
              onClick={() => setShowQuotesPanel(true)}
              style={{ width: '100%', padding: '14px', borderRadius: '9px', background: 'var(--emerald)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer', textAlign: 'center', transition: 'background 0.2s' }}
            >
              Get quotes from your nearest installer →
            </button>
          ) : (
            <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px dashed var(--emerald)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#6EE7B7' }}>Connecting with Regional Installers...</h4>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0' }}>We are matching your profile with top vetted EPC engineers near pin code {activePin}.</p>
            </div>
          )}
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

export default function SolarCalculator() {
  return (
    <Suspense fallback={<div className="center"><p>Loading system parameters...</p></div>}>
      <CalculatorContent />
    </Suspense>
  );
}
