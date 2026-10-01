'use client';
import React from 'react';
import { ShoppingBag, ArrowLeft, ExternalLink } from 'lucide-react';
import { products } from './data';

const TAG = 'solarhues-21';

export default function SolarAffiliateStorefront() {
  return (
    <div className="ps-page" style={{ minHeight: '100vh', background: '#1e293b', color: '#fff', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: '700', color: '#94A3B8', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back
          </a>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.15)' }}></div>
          <div style={{ fontWeight: '700', fontSize: '18px', fontFamily: 'Space Grotesk' }}>SolarHues</div>
        </div>
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#6EE7B7', background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.35)', padding: '7px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShoppingBag size={14} /> Shop
        </div>
      </header>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0', fontFamily: 'Space Grotesk' }}>Recommended Solar Equipment & Accessories</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Explore handpicked high-quality tools, maintenance kits, and components to optimize your array.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {products.map((p, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6EE7B7', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                  Equipment Gear
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', lineHeight: '1.4', color: '#fff', margin: '0 0 8px 0' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  {p.description}
                </p>
              </div>
              <div>
                <a 
                  href={`${p.url}${p.url.includes('?') ? '&' : '?'}tag=${TAG}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '13.5px', fontWeight: '600', padding: '10px 0', borderRadius: '9px', textDecoration: 'none', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  View on Amazon <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
