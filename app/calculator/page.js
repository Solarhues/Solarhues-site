'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calculator, ArrowRight, Sun, Leaf, TreePine, IndianRupee } from 'lucide-react';
 
// Next.js requires useSearchParams() to sit inside a Suspense boundary,
// so the page export wraps the real component below.
export default function CalculatorPage() {
  return (
    <Suspense fallback={null}>
      <SolarhuesDynamicCalculator />
    </Suspense>
  );
}
 
// PM Surya Ghar Yojana subsidy tiers (central government scheme)
function pmSuryaGharSubsidy(sizeKw) {
  if (sizeKw <= 1) return sizeKw * 30000;
  if (sizeKw <= 2) return 30000 + (sizeKw - 1) * 30000; // 1kW=30k, 2kW=60k
  return 78000; // 3kW to 10kW capped at 78,000
}
 
function SolarhuesDynamicCalculator() {
  const searchParams = useSearchParams();
  const [pincode, setPincode] = useState('');
  const [roofType, setRoofType] = useState('Concrete Slab');
  const [roofArea, setRoofArea] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [results, setResults] = useState(null);
  const [formError, setFormError] = useState('');
 
  // Pre-fill from ?pin=xxxxxx if the visitor arrived from the home page pincode box
  useEffect(() => {
    const pinFromUrl = searchParams.get('pin');
    if (pinFromUrl) {
      setPincode(pinFromUrl.replace(/\D/g, '').slice(0, 6));
    }
  }, [searchParams]);
 
  const ROOF_FACTORS = {
    'Concrete Slab': 1.0,
    'Metal Sheet': 0.9,
  };
 
  const calculateSolarMetrics = (e) => {
    e.preventDefault();
    setFormError('');
 
    const bill = parseFloat(monthlyBill);
    const area = parseFloat(roofArea);
 
    if (!bill || !area) {
      setFormError('Please fill in both your average monthly electricity bill and available roof area.');
      return;
    }
 
    const roofFactor = ROOF_FACTORS[roofType] ?? 1.0;
    const RATE_PER_UNIT = 7.5;        // ₹ per kWh, residential tariff index
    const UNITS_PER_KW_MONTH = 120;   // ~4 units/day per kW
    const COST_PER_KW = 60000;        // gross engineering layout cost per kW
 
    const estimatedUnits = bill / RATE_PER_UNIT;
    const neededSize = Math.round((estimatedUnits / UNITS_PER_KW_MONTH) * 2) / 2;
 
    // Roof capacity: 100 sq.ft per kW, adjusted for roof type mounting efficiency
    const roofCapacity = Math.round(((area / 100) * roofFactor) * 2) / 2;
 
    let recommendedSize = Math.min(neededSize, roofCapacity);
    if (recommendedSize < 1) recommendedSize = 1;
 
    const spaceRequired = Math.round(recommendedSize * 100);
    const roofConstrained = roofCapacity < neededSize;
 
    const grossCost = recommendedSize * COST_PER_KW;
    const subsidy = pmSuryaGharSubsidy(recommendedSize);
    const netCost = grossCost - subsidy;
 
    const monthlySavings = recommendedSize * UNITS_PER_KW_MONTH * RATE_PER_UNIT;
    const payback = netCost / (monthlySavings * 12);
    const co2 = Math.round(recommendedSize * UNITS_PER_KW_MONTH * 12 * 0.82);
    const trees = Math.round(co2 / 22);
 
    setResults({
      size: recommendedSize,
      reqSpace: spaceRequired,
      roofConstrained,
      grossCost,
      subsidy,
      netCost,
      paybackPeriod: payback.toFixed(1),
      co2Saved: (co2 / 1000).toFixed(1),
      treesPlanted: trees,
    });
  };
 
  return (
    <div className="sc-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');
 
        :root{
          --sc-font-body:'Inter',-apple-system,sans-serif; --sc-font-head:'Space Grotesk','Inter',sans-serif;
        }
        .sc-page{ min-height:100vh; background:#1e293b; color:#fff; font-family:var(--sc-font-body); -webkit-font-smoothing:antialiased; position:relative; overflow-x:hidden; }
        .sc-glow{
          position:fixed; inset:-10%;
          background:
            radial-gradient(circle at 15% 20%, rgba(5,150,105,0.25), transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(250,204,21,0.15), transparent 45%);
          filter:blur(60px); z-index:0; pointer-events:none;
        }
        .sc-wrap{ position:relative; z-index:1; }
 
        .sc-header{ border-bottom:1px solid rgba(255,255,255,0.08); padding:18px 32px; display:flex; align-items:center; justify-content:space-between; }
        .sc-brand{ display:flex; align-items:center; gap:9px; font-family:var(--sc-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; text-decoration:none; color:#fff; }
        .sc-dots{ display:flex; gap:4px; }
        .sc-dot{ width:9px; height:9px; border-radius:50%; }
        .sc-nav{ display:flex; gap:24px; font-size:13.5px; font-weight:600; color:#94A3B8; }
        .sc-nav a{ color:inherit; text-decoration:none; }
        .sc-nav a:hover{ color:#fff; }
 
        .sc-main{ max-width:1160px; margin:0 auto; padding:48px 32px 80px; display:grid; grid-template-columns:0.85fr 1.15fr; gap:32px; align-items:start; }
        @media (max-width:900px){ .sc-main{ grid-template-columns:1fr; padding:32px 20px 60px; } }
 
        .sc-card{ background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:26px; }
        .sc-form-title{ font-family:var(--sc-font-head); font-weight:700; font-size:19px; display:flex; align-items:center; gap:8px; margin:0; color:#fff; }
        .sc-form-sub{ font-size:13px; color:#94A3B8; margin-top:4px; }
 
        .sc-row2{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:20px; }
        .sc-field{ margin-top:18px; }
        .sc-row2 .sc-field{ margin-top:0; }
        .sc-label{ display:block; font-size:11.5px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px; }
        .sc-input{ width:100%; border:1px solid rgba(255,255,255,0.18); border-radius:10px; padding:12px 13px; font-size:14px; font-family:var(--sc-font-body); font-weight:600; color:#fff; background:rgba(255,255,255,0.06); }
        .sc-input::placeholder{ color:#64748B; }
        .sc-input:focus{ outline:2px solid #facc15; outline-offset:1px; border-color:transparent; }
        .sc-error{ margin-top:14px; font-size:13px; color:#FCA5A5; font-weight:600; background:rgba(239,68,68,0.12); padding:10px 12px; border-radius:8px; }
 
        .sc-submit{
          width:100%; margin-top:22px; background:#facc15; color:#1e293b; border:none; border-radius:10px;
          padding:14px; font-family:var(--sc-font-body); font-weight:700; font-size:14.5px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .sc-submit:hover{ background:#eab308; }
 
        .sc-empty{
          border:2px dashed rgba(255,255,255,0.15); border-radius:14px; padding:70px 24px; text-align:center;
          color:#94A3B8; font-size:14px; font-weight:600; display:flex; flex-direction:column; align-items:center; gap:10px;
        }
 
        .sc-hero-card{ background:rgba(5,150,105,0.1); border:1px solid rgba(5,150,105,0.3); border-radius:14px; padding:26px; }
        .sc-hero-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; }
        .sc-hero-label{ font-size:11.5px; font-weight:700; color:#6EE7B7; text-transform:uppercase; letter-spacing:0.05em; }
        .sc-hero-size{ font-family:var(--sc-font-head); font-size:36px; font-weight:800; margin-top:4px; color:#fff; }
        .sc-hero-size span{ font-size:16px; font-weight:600; color:#94A3B8; }
 
        .sc-cost-lines{ margin-top:14px; display:flex; flex-direction:column; gap:4px; }
        .sc-cost-row{ display:flex; justify-content:space-between; font-size:13px; color:#94A3B8; }
        .sc-cost-row.net{ font-size:18px; font-weight:800; color:#fff; border-top:1px solid rgba(255,255,255,0.1); margin-top:6px; padding-top:8px; }
        .sc-cost-row .subsidy{ color:#6EE7B7; }
 
        .sc-compliance{ margin-top:18px; padding-top:16px; border-top:1px solid rgba(5,150,105,0.2); display:flex; align-items:flex-start; gap:9px; }
        .sc-dot-status{ width:9px; height:9px; border-radius:50%; margin-top:4px; flex-shrink:0; }
        .sc-compliance p{ font-size:12.5px; font-weight:600; color:#94A3B8; margin:0; line-height:1.5; }
 
        .sc-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:16px; }
        @media (max-width:520px){ .sc-stats{ grid-template-columns:1fr; } }
        .sc-stat{ border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; background:rgba(255,255,255,0.03); }
        .sc-stat-label{ font-size:10.5px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.04em; display:flex; align-items:center; gap:6px; }
        .sc-stat-value{ font-family:var(--sc-font-head); font-size:22px; font-weight:800; margin-top:8px; color:#fff; }
        .sc-stat-value span{ font-size:12px; font-weight:600; color:#94A3B8; }
 
        .sc-cta{
          margin-top:16px; padding:18px 20px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:14px;
          display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
        }
        .sc-cta h4{ font-family:var(--sc-font-head); font-size:14.5px; font-weight:700; margin:0; }
        .sc-cta p{ font-size:12px; color:#94A3B8; margin-top:3px; }
        .sc-cta a{
          background:#facc15; color:#1e293b; font-weight:700; font-size:13px; text-decoration:none;
          padding:11px 18px; border-radius:9px; white-space:nowrap;
        }
        .sc-cta a:hover{ background:#eab308; }
      `}</style>
 
      <div className="sc-glow" />
      <div className="sc-wrap">
        <header className="sc-header">
          <a href="/" className="sc-brand">
            <span className="sc-dots">
              <span className="sc-dot" style={{ background: '#facc15' }} />
              <span className="sc-dot" style={{ background: '#fbbf24' }} />
              <span className="sc-dot" style={{ background: '#059669' }} />
            </span>
            SolarHues
          </a>
          <nav className="sc-nav">
            <a href="/">Home</a>
            <a href="/products">Shop</a>
            <a href="/login">Customer Login</a>
          </nav>
        </header>
 
        <main className="sc-main">
          <form onSubmit={calculateSolarMetrics} className="sc-card">
            <h2 className="sc-form-title"><Calculator size={19} color="#6EE7B7" /> Solar sizing calculator</h2>
            <p className="sc-form-sub">Enter a few details to size your rooftop system.</p>
 
            <div className="sc-row2">
              <div className="sc-field">
                <label className="sc-label">6-digit pincode</label>
                <input type="text" maxLength={6} required placeholder="e.g. 400001" value={pincode}
                  onChange={(e) => setPincode(e.target.value)} className="sc-input" />
              </div>
              <div className="sc-field">
                <label className="sc-label">Roof type</label>
                <select value={roofType} onChange={(e) => setRoofType(e.target.value)} className="sc-input">
                  <option value="Concrete Slab">Concrete Slab</option>
                  <option value="Metal Sheet">Metal Sheet</option>
                </select>
              </div>
            </div>
 
            <div className="sc-field">
              <label className="sc-label">Roof area (sq. ft.)</label>
              <input type="number" required placeholder="Enter open roof space..." value={roofArea}
                onChange={(e) => setRoofArea(e.target.value)} className="sc-input" />
            </div>
 
            <div className="sc-field">
              <label className="sc-label">Monthly electricity bill (₹)</label>
              <input type="number" required placeholder="Enter average bill..." value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)} className="sc-input" />
            </div>
 
            {formError && <div className="sc-error">{formError}</div>}
 
            <button type="submit" className="sc-submit">
              Calculate feasibility <ArrowRight size={16} />
            </button>
          </form>
 
          <div>
            {results ? (
              <div>
                <div className="sc-hero-card">
                  <div className="sc-hero-top">
                    <div>
                      <div className="sc-hero-label">Recommended solar capacity</div>
                      <div className="sc-hero-size">{results.size} <span>kW system</span></div>
                    </div>
                  </div>
 
                  <div className="sc-cost-lines">
                    <div className="sc-cost-row"><span>Gross cost</span><span>₹{results.grossCost.toLocaleString('en-IN')}</span></div>
                    <div className="sc-cost-row"><span className="subsidy">PM Surya Ghar subsidy</span><span className="subsidy">− ₹{results.subsidy.toLocaleString('en-IN')}</span></div>
                    <div className="sc-cost-row net"><span>Your net cost</span><span><IndianRupee size={15} style={{ display: 'inline', verticalAlign: -2 }} />{results.netCost.toLocaleString('en-IN')}</span></div>
                  </div>
 
                  <div className="sc-compliance">
                    <span className="sc-dot-status" style={{ background: results.roofConstrained ? '#facc15' : '#059669' }} />
                    <p>
                      {results.roofConstrained
                        ? `Sized to fit your roof — a system matching your full electricity need would need about ${results.reqSpace} sq. ft, more than you have available.`
                        : `Fits comfortably — this system needs about ${results.reqSpace} sq. ft, within your available roof space.`}
                    </p>
                  </div>
                </div>
 
                <div className="sc-stats">
                  <div className="sc-stat">
                    <div className="sc-stat-label"><Sun size={13} color="#facc15" /> Payback window</div>
                    <div className="sc-stat-value">{results.paybackPeriod} <span>years</span></div>
                  </div>
                  <div className="sc-stat">
                    <div className="sc-stat-label"><Leaf size={13} color="#6EE7B7" /> Carbon offset</div>
                    <div className="sc-stat-value">{results.co2Saved} <span>tons/yr</span></div>
                  </div>
                  <div className="sc-stat">
                    <div className="sc-stat-label"><TreePine size={13} color="#6EE7B7" /> Trees equivalent</div>
                    <div className="sc-stat-value">{results.treesPlanted} <span>trees/yr</span></div>
                  </div>
                </div>
 
                <div className="sc-cta">
                  <div>
                    <h4>Like this estimate?</h4>
                    <p>Get real quotes from vetted local installers near you.</p>
                  </div>
                  <a href="/quote">Request free quotes →</a>
                </div>
              </div>
            ) : (
              <div className="sc-empty">
                <Sun size={30} color="#64748B" />
                Enter your details on the left to see your system size, cost, and environmental impact.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
