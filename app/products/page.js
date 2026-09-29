'use client';
import React from 'react';

// Hardcoded array representing your tailored solar inventory stack.
// Simply swap out the 'affiliateUrl' properties with your real Amazon Associate tracking links!
const PRODUCTS_DATA = [
  {
    id: 'prod-01',
    title: 'Monocrystalline Balcony Solar Panel (100W)',
    category: 'Solar Panels',
    description: 'High-efficiency space-saving weather resistant panel setup optimized for urban residential apartment balconies.',
    specs: { Power: '100W', Efficiency: '22.5%', Type: 'Monocrystalline' },
    priceEstimate: '₹6,499',
    affiliateUrl: 'https://amazon.in'
  },
  {
    id: 'prod-02',
    title: 'Smart MPPT Solar Charge Controller (30A)',
    category: 'Electronics',
    description: 'Intelligent multi-stage solar regulator with integrated LCD readout indicators and dual tracking USB ports.',
    specs: { Rating: '30 Amps', Voltage: '12V/24V Auto', Efficiency: '98%' },
    priceEstimate: '₹2,199',
    affiliateUrl: 'https://amazon.in'
  },
  {
    id: 'prod-03',
    title: 'Heavy-Duty Outdoor Motion Sensor Solar Light',
    category: 'Lighting',
    description: 'Ultra-bright wide angle illumination array with robust ip65 waterproofing architecture for absolute boundary security.',
    specs: { Brightness: '1200 Lumens', Battery: '2200mAh Li-ion', Mode: '3 Smart Settings' },
    priceEstimate: '₹899',
    affiliateUrl: 'https://amazon.in'
  },
  {
    id: 'prod-04',
    title: 'Portable Solar Power Bank Generator (24000mAh)',
    category: 'Power Storage',
    description: 'Rugged high-capacity external power bank containing integrated backup generation panels and fast-charging outports.',
    specs: { Capacity: '24,000 mAh', Output: 'PD 18W Fast Charge', Input: 'Dual Solar/Micro' },
    priceEstimate: '₹3,499',
    affiliateUrl: 'https://amazon.in'
  }
];

export default function ProductsCatalog() {
  return (
    <>
      {/* Top Header Navigation Matrix */}
      <div className="top">
        <a href="/" className="brand">
          <span className="hue-dots">
            <span></span><span><span></span></span><span></span>
          </span>
          SolarHues
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/calculator" className="pill-status">Calculator</a>
          <div className="pill-status" style={{ background: 'rgba(250, 204, 21, 0.1)', borderColor: 'var(--sun)' }}>
            Affiliate Showroom
          </div>
        </div>
      </div>

      {/* Main Structural Showcase Wrapper */}
      <div className="center" style={{ display: 'block', maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', textAlign: 'left' }}>
        <div className="kicker" style={{ textAlign: 'center' }}>Vetted Hardware Picks</div>
        <h1 style={{ fontSize: '40px', textAlign: 'center', marginBottom: '12px' }}>
          Recommended <span className="hue">Solar Gear</span>
        </h1>
        <p className="sub" style={{ textStyle: 'center', margin: '0 auto 48px auto', textAlign: 'center', maxWidth: '540px' }}>
          Explore consumer solar components and tech accessories curated for seamless off-grid configurations and household integrations.
        </p>

        {/* CSS Flex/Grid Matrix for Product Placement */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px',
          width: '100%' 
        }}>
          {PRODUCTS_DATA.map((product) => (
            <div 
              key={product.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
            >
              <div>
                {/* Category Tag Header */}
                <div style={{ display: 'inline-block', fontSize: '11px', textTransform: 'uppercase', color: '#94E4C2', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  {product.category}
                </div>
                {/* Product Title */}
                <h3 style={{ fontSize: '20px', fontFamily: "'Space Grotesk', sans-serif", margin: '0 0 10px 0', color: '#fff', lineHeight: '1.3' }}>
                  {product.title}
                </h3>
                {/* Description Body */}
                <p style={{ fontSize: '13.5px', color: '#CBD5E1', lineHeight: '1.5', marginBottom: '18px' }}>
                  {product.description}
                </p>

                {/* Micro Specification Table Module */}
                <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px' }}>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: '#64748B' }}>{key}</span>
                      <span style={{ color: '#fff', fontWeight: '500' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Footer Anchors */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', pt: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Approx Price</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--sun)', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {product.priceEstimate}
                  </div>
                </div>
                {/* Target External Affiliate Button Anchor */}
                <a 
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'rgba(250, 204, 21, 0.1)',
                    border: '1px solid var(--sun)',
                    color: 'var(--sun)',
                    fontSize: '13px',
                    fontWeight: '700',
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--sun)';
                    e.currentTarget.style.color = '#1e293b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(250, 204, 21, 0.1)';
                    e.currentTarget.style.color = 'var(--sun)';
                  }}
                >
                  View on Amazon →
                </a>
              </div>
            </div>
          ))}
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
