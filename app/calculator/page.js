'use client';
import React, { useState } from 'react';
import { Calculator, ArrowRight, Sun, Leaf, TreePine, IndianRupee } from 'lucide-react';

export default function SolarhuesDynamicCalculator() {
  const [pincode, setPincode] = useState('');
  const [roofType, setRoofType] = useState('Concrete Slab');
  const [roofArea, setRoofArea] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [results, setResults] = useState(null);
  const [formError, setFormError] = useState('');

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
    const RATE_PER_UNIT = 8;
    const UNITS_PER_KW_MONTH = 120;
    const COST_PER_KW = 65000;

    const estimatedUnits = bill / RATE_PER_UNIT;
    const neededSize = Math.round((estimatedUnits / UNITS_PER_KW_MONTH) * 2) / 2;

    // Roof capacity accounts for roof type efficiency (metal sheet needs more spacing/mounting allowance)
    const roofCapacity = Math.round(((area / 100) * roofFactor) * 2) / 2;

    let recommendedSize = Math.min(neededSize, roofCapacity);
    if (recommendedSize < 1) recommendedSize = 1;

    const spaceRequired = Math.round(recommendedSize * 100);
    const roofConstrained = roofCapacity < neededSize;

    const costEstimate = recommendedSize * COST_PER_KW;
    const monthlySavings = recommendedSize * UNITS_PER_KW_MONTH * RATE_PER_UNIT;
    const payback = costEstimate / (monthlySavings * 12);
    const co2 = Math.round(recommendedSize * UNITS_PER_KW_MONTH * 12 * 0.82);
    const trees = Math.round(co2 / 22);

    setResults({
      size: recommendedSize,
      reqSpace: spaceRequired,
      roofConstrained,
      cost: costEstimate,
      paybackPeriod: payback.toFixed(1),
      co2Saved: (co2 / 1000).toFixed(1),
      treesPlanted: trees,
    });
  };

  return (
    <div className="sc-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :root{
          --sc-slate:#1e293b; --sc-slate-soft:#64748B; --sc-line:#E2E8F0; --sc-paper:#F8FAFC;
          --sc-emerald:#059669; --sc-emerald-soft:#D1FAE5; --sc-sun:#facc15; --sc-sun-dark:#EAB308;
          --sc-font-body:'Inter',-apple-system,sans-serif; --sc-font-head:'Plus Jakarta Sans','Inter',sans-serif;
        }
        .sc-page{ min-height:100vh; background:var(--sc-paper); color:var(--sc-slate); font-family:var(--sc-font-body); -webkit-font-smoothing:antialiased; }

        .sc-header{ background:#fff; border-bottom:1px solid var(--sc-line); padding:18px 32px; display:flex; align-items:center; justify-content:space-between; }
        .sc-brand{ display:flex; align-items:center; gap:9px; font-family:var(--sc-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; }
        .sc-dots{ display:flex; gap:4px; }
        .sc-dot{ width:9px; height:9px; border-radius:50%; }
        .sc-nav{ display:flex; gap:24px; font-size:13.5px; font-weight:600; color:var(--sc-slate-soft); }
        .sc-nav a{ color:inherit; text-decoration:none; }
        .sc-nav a:hover{ color:var(--sc-slate); }

        .sc-main{ max-width:1160px; margin:0 auto; padding:48px 32px 80px; display:grid; grid-template-columns:0.85fr 1.15fr; gap:32px; align-items:start; }
        @media (max-width:900px){ .sc-main{ grid-template-columns:1fr; padding:32px 20px 60px; } }

        .sc-card{ background:#fff; border:1px solid var(--sc-line); border-radius:14px; padding:26px; box-shadow:0 1px 3px rgba(30,41,59,0.05); }
        .sc-form-title{ font-family:var(--sc-font-head); font-weight:700; font-size:19px; display:flex; align-items:center; gap:8px; margin:0; }
        .sc-form-sub{ font-size:13px; color:var(--sc-slate-soft); margin-top:4px; }

        .sc-row2{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:20px; }
        .sc-field{ margin-top:18px; }
        .sc-row2 .sc-field{ margin-top:0; }
        .sc-label{ display:block; font-size:11.5px; font-weight:700; color:var(--sc-slate-soft); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px; }
        .sc-input{ width:100%; border:1px solid var(--sc-line); border-radius:10px; padding:12px 13px; font-size:14px; font-family:var(--sc-font-body); font-weight:600; color:var(--sc-slate); background:#fff; }
        .sc-input:focus{ outline:2px solid var(--sc-emerald); outline-offset:1px; border-color:transparent; }
        .sc-error{ margin-top:14px; font-size:13px; color:#DC2626; font-weight:600; background:#FEE2E2; padding:10px 12px; border-radius:8px; }

        .sc-submit{
          width:100%; margin-top:22px; background:var(--sc-slate); color:#fff; border:none; border-radius:10px;
          padding:14px; font-family:var(--sc-font-body); font-weight:700; font-size:14.5px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .sc-submit:hover{ background:#0f172a; }

        .sc-empty{
          border:2px dashed var(--sc-line); border-radius:14px; padding:70px 24px; text-align:center;
          color:var(--sc-slate-soft); font-size:14px; font-weight:600; display:flex; flex-direction:column; align-items:center; gap:10px;
        }

        .sc-hero-card{ background:linear-gradient(135deg, var(--sc-emerald-soft), #fff); border:1px solid #A7F3D0; border-radius:14px; padding:26px; }
        .sc-hero-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; }
        .sc-hero-label{ font-size:11.5px; font-weight:700; color:var(--sc-emerald); text-transform:uppercase; letter-spacing:0.05em; }
        .sc-hero-size{ font-family:var(--sc-font-head); font-size:36px; font-weight:800; margin-top:4px; }
        .sc-hero-size span{ font-size:16px; font-weight:600; color:var(--sc-slate-soft); }
        .sc-hero-cost-label{ font-size:11.5px; font-weight:700; color:var(--sc-slate-soft); text-transform:uppercase; letter-spacing:0.05em; text-align:right; }
        .sc-hero-cost{ font-family:var(--sc-font-head); font-size:22px; font-weight:800; color:var(--sc-emerald); display:flex; align-items:center; gap:2px; margin-top:4px; }

        .sc-compliance{ margin-top:18px; padding-top:16px; border-top:1px solid rgba(5,150,105,0.15); display:flex; align-items:flex-start; gap:9px; }
        .sc-dot-status{ width:9px; height:9px; border-radius:50%; margin-top:4px; flex-shrink:0; }
        .sc-compliance p{ font-size:12.5px; font-weight:600; color:var(--sc-slate-soft); margin:0; line-height:1.5; }

        .sc-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:16px; }
        @media (max-width:520px){ .sc-stats{ grid-template-columns:1fr; } }
        .sc-stat{ border:1px solid var(--sc-line); border-radius:12px; padding:16px; background:#fff; }
        .sc-stat-label{ font-size:10.5px; font-weight:700; color:var(--sc-slate-soft); text-transform:uppercase; letter-spacing:0.04em; display:flex; align-items:center; gap:6px; }
        .sc-stat-value{ font-family:var(--sc-font-head); font-size:22px; font-weight:800; margin-top:8px; }
        .sc-stat-value span{ font-size:12px; font-weight:600; color:var(--sc-slate-soft); }

        .sc-cta{
          margin-top:16px; padding:18px 20px; background:var(--sc-slate); color:#fff; border-radius:14px;
          display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
        }
        .sc-cta h4{ font-family:var(--sc-font-head); font-size:14.5px; font-weight:700; margin:0; }
        .sc-cta p{ font-size:12px; color:#CBD5E1; margin-top:3px; }
        .sc-cta a{
          background:var(--sc-sun); color:var(--sc-slate); font-weight:700; font-size:13px; text-decoration:none;
          padding:11px 18px; border-radius:9px; white-space:nowrap;
        }
        .sc-cta a:hover{ background:var(--sc-sun-dark); }
      `}</style>

      <header className="sc-header">
        <div className="sc-brand">
          <span className="sc-dots">
            <span className="sc-dot" style={{ background: '#facc15' }} />
            <span className="sc-dot" style={{ background: '#fbbf24' }} />
            <span className="sc-dot" style={{ background: '#059669' }} />
          </span>
          SolarHues
        </div>
        <nav className="sc-nav">
          <a href="/">Home</a>
          <a href="/products">Shop</a>
          <a href="/terms">Terms</a>
        </nav>
      </header>

      <main className="sc-main">
        <form onSubmit={calculateSolarMetrics} className="sc-card">
          <h2 className="sc-form-title"><Calculator size={19} color="#059669" /> Solar sizing calculator</h2>
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
                  <div>
                    <div className="sc-hero-cost-label">Estimated investment</div>
                    <div className="sc-hero-cost"><IndianRupee size={17} />{results.cost.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div className="sc-compliance">
                  <span className="sc-dot-status" style={{ background: results.roofConstrained ? '#F59E0B' : '#059669' }} />
                  <p>
                    {results.roofConstrained
                      ? `Sized to fit your roof — a system matching your full electricity need would need about ${results.reqSpace} sq. ft, more than you have available.`
                      : `Fits comfortably — this system needs about ${results.reqSpace} sq. ft, within your available roof space.`}
                  </p>
                </div>
              </div>

              <div className="sc-stats">
                <div className="sc-stat">
                  <div className="sc-stat-label"><Sun size={13} color="#EAB308" /> Payback window</div>
                  <div className="sc-stat-value">{results.paybackPeriod} <span>years</span></div>
                </div>
                <div className="sc-stat">
                  <div className="sc-stat-label"><Leaf size={13} color="#059669" /> Carbon offset</div>
                  <div className="sc-stat-value">{results.co2Saved} <span>tons/yr</span></div>
                </div>
                <div className="sc-stat">
                  <div className="sc-stat-label"><TreePine size={13} color="#059669" /> Trees equivalent</div>
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
              <Sun size={30} color="#CBD5E1" />
              Enter your details on the left to see your system size, cost, and environmental impact.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
