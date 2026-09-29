'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CalculatorContent() {
  const searchParams = useSearchParams();
  const [activePin, setActivePin] = useState('------');
  const [monthlyBill, setMonthlyBill] = useState(3500); // Default placeholder bill in Rupees
  const [showQuotesPanel, setShowQuotesPanel] = useState(false);

  useEffect(() => {
    const pin = searchParams.get('pin');
    if (pin) setActivePin(pin);
  }, [searchParams]);

  // --- Dynamic ROI Calculations ---
  const costPerUnit = 7.5; 
  const monthlyUnits = Math.round(monthlyBill / costPerUnit);
  
  // 1 kW produces ~120 units/month. Size the system to cover their consumption.
  const recommendedSystemSize = Math.max(1, Math.min(10, Math.round((monthlyUnits / 120) * 10) / 10)); 
  
  const annualGeneration = Math.round(recommendedSystemSize * 4 * 365); // 4 units per kW per day
  const annualSavings = Math.round(annualGeneration * costPerUnit);
  
  // Total cost estimated at ₹60,000 per kW benchmark
  const baseCost = recommendedSystemSize * 60000; 
  
  // PM Surya Ghar Subsidy Calculations
  let subsidy = 0;
  if (recommendedSystemSize >= 1) {
    if (recommendedSystemSize >= 3) {
      subsidy = 78000; // Capped maximum subsidy
    } else if (recommendedSystemSize >= 2) {
      subsidy = 60000;
    } else {
      subsidy = 30000;
    }
  }
  
  const netInvestment = Math.max(15000, baseCost - subsidy);
  const paybackPeriod = Math.round((netInvestment / annualSavings) * 10) / 10;
  const spaceRequired = Math.round(recommendedSystemSize * 100);

  return (
    <>
      {/* Top Header Navigation Matrix */}
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

      {/* Main Container */}
      <div className="center">
        <div className="kicker">Dynamic Solar ROI Engine</div>
        <h1 style={{ marginBottom: '8px' }}>Rooftop Potential for <span className="hue">Zone {activePin}</span></h1>
        <p className="sub" style={{ marginTop: '0', marginBottom: '32px' }}>Adjust the slider below to match your average monthly electricity bill expense.</p>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '640px', textAlign: 'left' }}>
          
          {/* Interactive Range Slider Module */}
          <div style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}>Monthly Electricity Bill:</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--sun)', fontFamily: "'Space Grotesk', sans-serif" }}>₹{monthlyBill.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min={1000} 
              max={15000} 
              step={500}
              value={monthlyBill} 
              onChange={(e) => {
                setMonthlyBill(Number(e.target.value));
                setShowQuotesPanel(false); // Reset quotes panel state on value change
              }}
              style={{ width: '100%', accentColor: 'var(--sun)', cursor: 'pointer', height: '6px', borderRadius: '3px' }}
            />
          </div>

          {/* Core Calculation Metrics Row */}
          <h4 style={{ margin: '0 0 16px 0', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Architecture Recommendations</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Recommended Plant Capacity</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: 'Space Grotesk' }}>{recommendedSystemSize} kW</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Clear Roof Space Required</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: 'Space Grotesk' }}>~{spaceRequired} Sq.Ft</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Net Setup Investment (Post Subsidy)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--sun)', fontFamily: 'Space Grotesk' }}>₹{netInvestment.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Est. Break-Even Payback Window</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--emerald)', fontFamily: 'Space Grotesk' }}>{paybackPeriod} Years</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#CBD5E1', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
            <span>Annual Generation Potential: <strong style={{ color: '#fff' }}>{annualGeneration.toLocaleString('en-IN')} Units</strong></span>
            <span>Est. Yearly Bill Savings: <strong style={{ color: 'var(--emerald)' }}>₹{annualSavings.toLocaleString('en-IN')}</strong></span>
          </div>

          {/* Interactive B2B Quote Submission Engine Switcher */}
          {!showQuotesPanel ? (
            <button 
              onClick={() => setShowQuotesPanel(true)}
              style={{ width: '100%', padding: '16px', borderRadius: '10px', background: 'var(--emerald)', color: '#fff', fontWeight: '700', fontSize: '15px', fontFamily: "'Space Grotesk', sans-serif", border: 'none', cursor: 'pointer', textAlign: 'center', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--emerald)'}
            >
              Get quotes from your nearest installer →
            </button>
          ) : (
            <div style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px dashed var(--emerald)', padding: '20px', borderRadius: '10px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#6EE7B7', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px' }}>Connecting with Regional Installers...</h4>
              <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: '0', lineHeight: '1.5' }}>
                Success! System configurations for your **{recommendedSystemSize} kW** requirement have been queued for verified solar partners near pin code **{activePin}**.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer System Alignment */}
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
    <Suspense fallback={<div className="center"><p style={{ fontFamily: "'Inter', sans-serif" }}>Loading solar radiation metrics...</p></div>}>
      <CalculatorContent />
    </Suspense>
  );
}
