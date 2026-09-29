'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Calculator,
  IndianRupee,
  Leaf,
  Sun,
  TreePine,
} from 'lucide-react';

const ROOF_FACTORS = {
  'Concrete Slab': 1,
  'Metal Sheet': 0.9,
};

export default function ProductsPage() {
  const [pincode, setPincode] = useState('');
  const [roofType, setRoofType] = useState('Concrete Slab');
  const [roofArea, setRoofArea] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [results, setResults] = useState(null);
  const [formError, setFormError] = useState('');

  function calculateSolarMetrics(event) {
    event.preventDefault();
    setFormError('');

    const bill = Number(monthlyBill);
    const area = Number(roofArea);
    const validPincode = /^\d{6}$/.test(pincode);

    if (!validPincode) {
      setResults(null);
      setFormError('Please enter a valid 6-digit pincode.');
      return;
    }

    if (!Number.isFinite(bill) || bill <= 0 || !Number.isFinite(area) || area <= 0) {
      setResults(null);
      setFormError('Enter a monthly electricity bill and roof area greater than zero.');
      return;
    }

    const ratePerUnit = 8;
    const unitsPerKwMonth = 120;
    const costPerKw = 65000;
    const roofFactor = ROOF_FACTORS[roofType] ?? 1;

    const estimatedUnits = bill / ratePerUnit;
    const neededSize = Math.max(
      0.5,
      Math.round((estimatedUnits / unitsPerKwMonth) * 2) / 2
    );

    const roofCapacity = Math.floor((area / 100) * roofFactor * 2) / 2;

    if (roofCapacity < 0.5) {
      setResults(null);
      setFormError(
        'Your available roof area is too small for a practical solar installation. Enter at least 50 sq. ft.'
      );
      return;
    }

    const recommendedSize = Math.min(neededSize, roofCapacity);
    const spaceRequired = Math.round(recommendedSize * 100);
    const roofConstrained = roofCapacity < neededSize;

    const costEstimate = recommendedSize * costPerKw;
    const monthlySavings = recommendedSize * unitsPerKwMonth * ratePerUnit;
    const payback = costEstimate / (monthlySavings * 12);
    const co2KgPerYear = Math.round(recommendedSize * unitsPerKwMonth * 12 * 0.82);
    const trees = Math.round(co2KgPerYear / 22);

    setResults({
      size: recommendedSize,
      reqSpace: spaceRequired,
      roofConstrained,
      cost: costEstimate,
      paybackPeriod: payback.toFixed(1),
      co2Saved: (co2KgPerYear / 1000).toFixed(1),
      treesPlanted: trees,
    });
  }

  return (
    <div className="sc-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :root {
          --sc-slate: #1e293b;
          --sc-slate-soft: #64748b;
          --sc-line: #e2e8f0;
          --sc-paper: #f8fafc;
          --sc-emerald: #059669;
          --sc-emerald-soft: #d1fae5;
          --sc-sun: #facc15;
          --sc-sun-dark: #eab308;
          --sc-font-body: 'Inter', -apple-system, sans-serif;
          --sc-font-head: 'Plus Jakarta Sans', 'Inter', sans-serif;
        }

        * { box-sizing: border-box; }

        .sc-page {
          min-height: 100vh;
          background: var(--sc-paper);
          color: var(--sc-slate);
          font-family: var(--sc-font-body);
          -webkit-font-smoothing: antialiased;
        }

        .sc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 32px;
          background: #fff;
          border-bottom: 1px solid var(--sc-line);
        }

        .sc-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: var(--sc-font-head);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .sc-dots {
          display: flex;
          gap: 4px;
        }

        .sc-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .sc-nav {
          display: flex;
          gap: 24px;
          color: var(--sc-slate-soft);
          font-size: 13.5px;
          font-weight: 600;
        }

        .sc-nav a {
          color: inherit;
          text-decoration: none;
        }

        .sc-nav a:hover {
          color: var(--sc-slate);
        }

        .sc-main {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 32px;
          align-items: start;
          max-width: 1160px;
          margin: 0 auto;
          padding: 48px 32px 80px;
        }

        .sc-card {
          padding: 26px;
          background: #fff;
          border: 1px solid var(--sc-line);
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(30, 41, 59, 0.05);
        }

        .sc-form-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-family: var(--sc-font-head);
          font-size: 19px;
          font-weight: 700;
        }

        .sc-form-sub {
          margin: 4px 0 0;
          color: var(--sc-slate-soft);
          font-size: 13px;
        }

        .sc-row2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 20px;
        }

        .sc-field {
          margin-top: 18px;
        }

        .sc-row2 .sc-field {
          margin-top: 0;
        }

        .sc-label {
          display: block;
          margin-bottom: 6px;
          color: var(--sc-slate-soft);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .sc-input {
          width: 100%;
          padding: 12px 13px;
          color: var(--sc-slate);
          background: #fff;
          border: 1px solid var(--sc-line);
          border-radius: 10px;
          font-family: var(--sc-font-body);
          font-size: 14px;
          font-weight: 600;
        }

        .sc-input:focus {
          outline: 2px solid var(--sc-emerald);
          outline-offset: 1px;
          border-color: transparent;
        }

        .sc-error {
          margin-top: 14px;
          padding: 10px 12px;
          color: #dc2626;
          background: #fee2e2;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .sc-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          margin-top: 22px;
          padding: 14px;
          color: #fff;
          background: var(--sc-slate);
          border: 0;
          border-radius: 10px;
          cursor: pointer;
          font-family: var(--sc-font-body);
          font-size: 14.5px;
          font-weight: 700;
        }

        .sc-submit:hover {
          background: #0f172a;
        }

        .sc-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 70px 24px;
          color: var(--sc-slate-soft);
          border: 2px dashed var(--sc-line);
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }

        .sc-hero-card {
          padding: 26px;
          background: linear-gradient(135deg, var(--sc-emerald-soft), #fff);
          border: 1px solid #a7f3d0;
          border-radius: 14px;
        }

        .sc-hero-top {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .sc-hero-label,
        .sc-hero-cost-label {
          color: var(--sc-emerald);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .sc-hero-cost-label {
          color: var(--sc-slate-soft);
          text-align: right;
        }

        .sc-hero-size {
          margin-top: 4px;
          font-family: var(--sc-font-head);
          font-size: 36px;
          font-weight: 800;
        }

        .sc-hero-size span {
          color: var(--sc-slate-soft);
          font-size: 16px;
          font-weight: 600;
        }

        .sc-hero-cost {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-top: 4px;
          color: var(--sc-emerald);
          font-family: var(--sc-font-head);
          font-size: 22px;
          font-weight: 800;
        }

        .sc-compliance {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid rgba(5, 150, 105, 0.15);
        }

        .sc-dot-status {
          flex-shrink: 0;
          width: 9px;
          height: 9px;
          margin-top: 4px;
          border-radius: 50%;
        }

        .sc-compliance p {
          margin: 0;
          color: var(--sc-slate-soft);
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1.5;
        }

        .sc-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 16px;
        }

        .sc-stat {
          padding: 16px;
          background: #fff;
          border: 1px solid var(--sc-line);
          border-radius: 12px;
        }

        .sc-stat-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--sc-slate-soft);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .sc-stat-value {
          margin-top: 8px;
          font-family: var(--sc-font-head);
          font-size: 22px;
          font-weight: 800;
        }

        .sc-stat-value span {
          color: var(--sc-slate-soft);
          font-size: 12px;
          font-weight: 600;
        }

        .sc-cta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 16px;
          padding: 18px 20px;
          color: #fff;
          background: var(--sc-slate);
          border-radius: 14px;
        }

        .sc-cta h4 {
          margin: 0;
          font-family: var(--sc-font-head);
          font-size: 14.5px;
          font-weight: 700;
        }

        .sc-cta p {
          margin: 3px 0 0;
          color: #cbd5e1;
          font-size: 12px;
        }

        .sc-cta a {
          padding: 11px 18px;
          color: var(--sc-slate);
          background: var(--sc-sun);
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .sc-cta a:hover {
          background: var(--sc-sun-dark);
        }

        @media (max-width: 900px) {
          .sc-main {
            grid-template-columns: 1fr;
            padding: 32px 20px 60px;
          }
        }

        @media (max-width: 520px) {
          .sc-header {
            padding: 16px 20px;
          }

          .sc-nav {
            gap: 12px;
            font-size: 12px;
          }

          .sc-row2,
          .sc-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="sc-header">
        <div className="sc-brand">
          <span className="sc-dots" aria-hidden="true">
            <span className="sc-dot" style={{ background: '#facc15' }} />
            <span className="sc-dot" style={{ background: '#fbbf24' }} />
            <span className="sc-dot" style={{ background: '#059669' }} />
          </span>
          SolarHues
        </div>

        <nav className="sc-nav" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/products">Shop</a>
          <a href="/terms">Terms</a>
        </nav>
      </header>

      <main className="sc-main">
        <form onSubmit={calculateSolarMetrics} className="sc-card">
          <h2 className="sc-form-title">
            <Calculator size={19} color="#059669" />
            Solar sizing calculator
          </h2>

          <p className="sc-form-sub">
            Enter a few details to size your rooftop system.
          </p>

          <div className="sc-row2">
            <div className="sc-field">
              <label className="sc-label" htmlFor="pincode">
                6-digit pincode
              </label>
              <input
                id="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="e.g. 400001"
                value={pincode}
                onChange={(event) =>
                  setPincode(event.target.value.replace(/\D/g, ''))
                }
                className="sc-input"
              />
            </div>

            <div className="sc-field">
              <label className="sc-label" htmlFor="roofType">
                Roof type
              </label>
              <select
                id="roofType"
                value={roofType}
                onChange={(event) => setRoofType(event.target.value)}
                className="sc-input"
              >
                <option value="Concrete Slab">Concrete Slab</option>
                <option value="Metal Sheet">Metal Sheet</option>
              </select>
            </div>
          </div>

          <div className="sc-field">
            <label className="sc-label" htmlFor="roofArea">
              Roof area (sq. ft.)
            </label>
            <input
              id="roofArea"
              type="number"
              min="1"
              required
              placeholder="Enter open roof space..."
              value={roofArea}
              onChange={(event) => setRoofArea(event.target.value)}
              className="sc-input"
            />
          </div>

          <div className="sc-field">
            <label className="sc-label" htmlFor="monthlyBill">
              Monthly electricity bill (₹)
            </label>
            <input
              id="monthlyBill"
              type="number"
              min="1"
              required
              placeholder="Enter average bill..."
              value={monthlyBill}
              onChange={(event) => setMonthlyBill(event.target.value)}
              className="sc-input"
            />
          </div>

          {formError && <div className="sc-error">{formError}</div>}

          <button type="submit" className="sc-submit">
            Calculate feasibility
            <ArrowRight size={16} />
          </button>
        </form>

        <div>
          {results ? (
            <>
              <div className="sc-hero-card">
                <div className="sc-hero-top">
                  <div>
                    <div className="sc-hero-label">
                      Recommended solar capacity
                    </div>
                    <div className="sc-hero-size">
                      {results.size} <span>kW system</span>
                    </div>
                  </div>

                  <div>
                    <div className="sc-hero-cost-label">
                      Estimated investment
                    </div>
                    <div className="sc-hero-cost">
                      <IndianRupee size={17} />
                      {results.cost.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="sc-compliance">
                  <span
                    className="sc-dot-status"
                    style={{
                      background: results.roofConstrained ? '#f59e0b' : '#059669',
                    }}
                  />
                  <p>
                    {results.roofConstrained
                      ? `Sized to fit your roof. Your estimated full requirement is larger than the space available, so this recommendation uses about ${results.reqSpace} sq. ft.`
                      : `Fits comfortably. This system needs about ${results.reqSpace} sq. ft., within your available roof space.`}
                  </p>
                </div>
              </div>

              <div className="sc-stats">
                <div className="sc-stat">
                  <div className="sc-stat-label">
                    <Sun size={13} color="#eab308" />
                    Payback window
                  </div>
                  <div className="sc-stat-value">
                    {results.paybackPeriod} <span>years</span>
                  </div>
                </div>

                <div className="sc-stat">
                  <div className="sc-stat-label">
                    <Leaf size={13} color="#059669" />
                    Carbon offset
                  </div>
                  <div className="sc-stat-value">
                    {results.co2Saved} <span>tons/yr</span>
                  </div>
                </div>

                <div className="sc-stat">
                  <div className="sc-stat-label">
                    <TreePine size={13} color="#059669" />
                    Trees equivalent
                  </div>
                  <div className="sc-stat-value">
                    {results.treesPlanted} <span>trees/yr</span>
                  </div>
                </div>
              </div>

              <div className="sc-cta">
                <div>
                  <h4>Like this estimate?</h4>
                  <p>Get real quotes from vetted local installers near you.</p>
                </div>
                <a href="/quote">Request free quotes →</a>
              </div>
            </>
          ) : (
            <div className="sc-empty">
              <Sun size={30} color="#cbd5e1" />
              Enter your details on the left to see your system size, cost,
              and environmental impact.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
