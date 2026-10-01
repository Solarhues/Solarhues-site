'use client';
import React, { useState } from 'react';
import { ShoppingBag, Star, ArrowLeft } from 'lucide-react';
import { ITEMS } from './data';

const TAG = 'solarhues-21';

export default function SolarAffiliateStorefront() {
  const [cat, setCat] = useState('All');
  const cats = ['All', 'Outdoor Lighting', 'Emergency & Utility', 'Portable Power', 'DIY Components'];
  const filtered = cat === 'All' ? ITEMS : ITEMS.filter(p => p.cat === cat);

  return (
    <div className="ps-page" style={{ minHeight: '100vh', background: '#1e293b', color: '#fff', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: '700', color: '#94A3B8', textDecoration: 'none' }}><ArrowLeft size={16} /> Back</a>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.15)' }}></div>
          <div style={{ fontWeight: '700', fontSize: '18px', fontFamily: 'Space Grotesk' }}>SolarHues</div>
        </div>
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#6EE7B7', background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.35)', padding: '7px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><ShoppingBag size={14} /> Shop</div>
      </header>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0' }}>Recommended Solar Equipment & Accessories</h1>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Explore handpicked, high-quality tools, maintenance kits, and components to optimize your array.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} style={{ fontSize: '12.5px', fontWeight: '700', padding: '9px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: cat === c ? '#facc15' : 'rgba(255,255,255,0.04)', color: cat === c ? '#1e293b' : '#94A3B8', cursor: 'pointer' }}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '20px' }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', minHeight: '310px', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94E4C2', fontWeight: '700', display: 'block', marginBottom: '8px' }}>{p.cat}</span>
                <h3 style={{ fontSize: '14.5px', fontWeight: '600', lineHeight: '1.4', color: '#fff', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px' }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#facc15', fontWeight: '600' }}><Star size={13} fill="#facc15" stroke="#facc15" /><span>{p.r}</span></div>
                  <span style={{ color: '#64748B' }}>({p.rev} reviews)</span>
                </div>
              </div>
              <div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', marginBottom: '12px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{p.off}</span><span style={{ fontSize: '12px', color: '#64748B', textDecoration: 'line-through' }}>{p.mrp}</span></div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#6EE7B7', background: 'rgba(5,150,105,0.2)', padding: '4px 8px', borderRadius: '6px' }}>{p.sv}</span>
                </div>
                <a href={`${p.url}?tag=${TAG}`} target="_blank" rel="noopener noreferrer" style={{ width: '100%', textAlign: 'center', display: 'block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '13.5px', fontWeight: '600', padding: '10px 0', borderRadius: '9px', textDecoration: 'none' }}>View on Amazon</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
