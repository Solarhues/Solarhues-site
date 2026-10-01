'use client';
import React, { useState } from 'react';
import { ShoppingBag, Star, ArrowLeft } from 'lucide-react';

const ITEMS = [
  { id: 1, name: "Gesto 25 Feet G40 LED String Lights with 25 Warm White Bulbs", cat: "Outdoor Lighting", r: 4.1, rev: "278", mrp: "₹1,999", off: "₹1,198", sv: "40% OFF", url: "https://link.amazon" },
  { id: 2, name: "One94Store 20Meter 56 LED Serial String Lights - Waterproof Wire", cat: "Outdoor Lighting", r: 3.9, rev: "1,731", mrp: "₹999", off: "₹199", sv: "80% OFF", url: "https://link.amazon" },
  { id: 3, name: "Anker Solar Charger 21W 2-Port USB Foldable Panel", cat: "Portable Power", r: 4.7, rev: "2,150", mrp: "₹6,999", off: "₹4,899", sv: "30% OFF", url: "https://link.amazon" },
  { id: 4, name: "Havells Solace 3-Watt Solar Path Finder Light Assembly", cat: "Outdoor Lighting", r: 4.4, rev: "410", mrp: "₹1,500", off: "₹999", sv: "33% OFF", url: "https://link.amazon" },
  { id: 5, name: "Solar Universe India 10W Solar Module for DIY Charging", cat: "DIY Components", r: 4.2, rev: "670", mrp: "₹1,200", off: "₹749", sv: "38% OFF", url: "https://link.amazon" },
  { id: 6, name: "Tata Power Solar Regular 100-Litre Solar Water Heater", cat: "Home Appliances", r: 4.6, rev: "340", mrp: "₹28,000", off: "₹23,500", sv: "16% OFF", url: "https://link.amazon" },
  { id: 7, name: "Home 100W Solar Street Light Waterproof with Remote", cat: "Outdoor Lighting", r: 4.4, rev: "1,520", mrp: "₹4,999", off: "₹2,799", sv: "44% OFF", url: "https://link.amazon" },
  { id: 8, name: "Pick Ur Needs Solar Powered Rechargeable LED Torch Lamp", cat: "Emergency & Utility", r: 4.1, rev: "630", mrp: "₹999", off: "₹649", sv: "35% OFF", url: "https://link.amazon" },
  { id: 9, name: "SARRVAD Portable Solar Generator Power Station 150Wh", cat: "Portable Power", r: 4.5, rev: "280", mrp: "₹18,500", off: "₹14,999", sv: "19% OFF", url: "https://link.amazon" },
  { id: 10, name: "Luminous Solar NXG 1100 Hybrid UPS Smart Inverter", cat: "Home Appliances", r: 4.3, rev: "1,890", mrp: "₹9,500", off: "₹7,299", sv: "23% OFF", url: "https://link.amazon" },
  { id: 11, name: "Solar Universe India Digital Multimeter Setup Kit", cat: "DIY Components", r: 4.0, rev: "190", mrp: "₹1,400", off: "₹949", sv: "32% OFF", url: "https://link.amazon" },
  { id: 12, name: "IFITech Outdoor Solar Wall Security Motion Lights (Set of 2)", cat: "Outdoor Lighting", r: 4.2, rev: "2,410", mrp: "₹2,200", off: "₹1,299", sv: "41% OFF", url: "https://link.amazon" },
  { id: 13, name: "Gesto High Power Solar Flood Light 200W IP66", cat: "Outdoor Lighting", r: 4.3, rev: "1,140", mrp: "₹5,500", off: "₹3,199", sv: "42% OFF", url: "https://link.amazon" },
  { id: 14, name: "Wipro Always On Rechargeable Solar Emergency LED Lantern", cat: "Emergency & Utility", r: 4.4, rev: "3,110", mrp: "₹2,100", off: "₹1,449", sv: "31% OFF", url: "https://link.amazon" },
  { id: 15, name: "EcoFlow RIVER 2 Portable Power Station 256Wh LiFePO4", cat: "Portable Power", r: 4.8, rev: "750", mrp: "₹29,999", off: "₹24,499", sv: "18% OFF", url: "https://link.amazon" },
  { id: 16, name: "Microtek Solar Inverter SS1130 12V Dual Charging Matrix", cat: "Home Appliances", r: 4.2, rev: "860", mrp: "₹8,900", off: "₹6,850", sv: "23% OFF", url: "https://link.amazon" },
  { id: 17, name: "Loom Solar Panel 50 Watt - 12 Volt Mono Crystalline", cat: "DIY Components", r: 4.5, rev: "1,430", mrp: "₹4,500", off: "₹3,250", sv: "27% OFF", url: "https://link.amazon" },
  { id: 18, name: "V-Guard Solar Hot Water Geyser 150 Litre System", cat: "Home Appliances", r: 4.4, rev: "210", mrp: "₹34,000", off: "₹29,999", sv: "11% OFF", url: "https://link.amazon" }
];

const TAG = 'solarhues-21';

export default function SolarAffiliateStorefront() {
  const [cat, setCat] = useState('All');
  const cats = ['All', 'Outdoor Lighting', 'Emergency & Utility', 'Portable Power', 'DIY Components', 'Home Appliances'];
  const filtered = cat === 'All' ? ITEMS : ITEMS.filter(p => p.cat === cat);

  return (
    <div className="ps-page">
      <div className="ps-glow"></div>
      <header className="ps-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" className="ps-back"><ArrowLeft size={16} /> Back</a>
          <div className="ps-divider-v"></div>
          <div className="ps-brand">
            <span className="ps-dot" style={{ background: 'var(--sun, #facc15)' }}></span>
            <span className="ps-dot" style={{ background: '#fbbf24' }}></span>
            <span className="ps-dot" style={{ background: 'var(--emerald, #059669)' }}></span>
            SolarHues
          </div>
        </div>
        <div className="ps-badge"><ShoppingBag size={14} /> Shop</div>
      </header>
      <main className="ps-main">
        <div className="ps-toolbar">
          <div>
            <h1 className="ps-title">Curated Solar Gear</h1>
            <p className="ps-subtitle">Top-rated consumer solar products available in India</p>
          </div>
          <div className="ps-filters">
            {cats.map((c) => (
              <button key={c} className={`ps-filter-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="ps-grid">
          {filtered.map((p) => (
            <div key={p.id} className="ps-card">
              <div>
                <span className="ps-card-cat">{p.cat}</span>
                <h3 className="ps-card-title">{p.name}</h3>
                <div className="ps-rating-row">
                  <div className="ps-stars"><Star size={13} fill="#facc15" stroke="#facc15" /><span>{p.r}</span></div>
                  <span className="ps-reviews">({p.rev} reviews)</span>
                </div>
              </div>
              <div>
                <div className="ps-price-box">
                  <div><span className="ps-offer">{p.off}</span><span className="ps-mrp">{p.mrp}</span></div>
                  <span className="ps-savings">{p.sv}</span>
                </div>
                <a href={`${p.url}?tag=${TAG}`} target="_blank" rel="noopener noreferrer" className="ps-buy-btn">View on Amazon</a>
              </div>
            </div>
          ))}
        </div>
      </main>
      <style>{`
        .ps-page{min-height:100vh;background:#1e293b;color:#fff;font-family:'Inter',sans-serif;position:relative;overflow-x:hidden;}
        .ps-glow{position:fixed;inset:-10%;background:radial-gradient(circle at 15% 20%,rgba(5,150,105,0.2),transparent 45%),radial-gradient(circle at 85% 10%,rgba(250,204,21,0.12),transparent 45%);filter:blur(60px);z-index:0;pointer-events:none;}
        .ps-header{border-bottom:1px solid rgba(255,255,255,0.08);padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}
        .ps-back{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;color:#94A3B8;}
        .ps-divider-v{width:1px;height:16px;background:rgba(255,255,255,0.15);}
        .ps-brand{display:flex;align-items:center;gap:9px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;}
        .ps-dot{width:9px;height:9px;border-radius:50%;display:inline-block;}
        .ps-badge{font-size:11px;font-weight:700;text-transform:uppercase;color:#6EE7B7;background:rgba(5,150,105,0.15);border:1px solid rgba(5,150,105,0.35);padding:7px 12px;border-radius:10px;display:flex;align-items:center;gap:6px;}
        .ps-main{max-width:1200px;margin:0 auto;padding:40px 32px 70px;}
        .ps-toolbar{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:20px;margin-bottom:28px;}
        .ps-title{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:800;margin:0;}
        .ps-subtitle{font-size:13px;color:#94A3B8;margin-top:4px;}
        .ps-filters{display:flex;flex-wrap:wrap;gap:8px;}
        .ps-filter-btn{font-size:12.5px;font-weight:700;padding:9px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.04);color:#94A3B8;cursor:pointer;}
        .ps-filter-btn.active{background:#facc15;border-color:#facc15;color:#1e293b;}
        .ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;}
        .ps-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;min-height:310px;}
        .ps-card-cat{font-size:11px;text-transform:uppercase;color:#94E4C2;font-weight:700;margin-bottom:8px;display:block;}
        .ps-card-title{font-size:14.5px;font-weight:600;line-height:1.4;color:#fff;margin:0 0 12px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;height:40px;}
        .ps-rating-row{display:flex;align-items:center;gap:8px;font-size:12.5px;margin-bottom:16px;}
        .ps-stars{display:flex;align-items:center;gap:4px;color:#facc15;font-weight:600;}
        .ps-reviews{color:#64748B;}
        .ps-price-box{background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .ps-price-main{display:flex;flex-direction:column;}
        .ps-offer{font-size:18px;font-weight:700;color:#fff;font-family:'Space Grotesk',sans-serif;}
        .ps-mrp{font-size:12px;color:#64748B;text-decoration:line-through;}
        .ps-savings{font-size:11px;font-weight:700;color:#6EE7B7;background:rgba(5,150,105,0.2);padding:4px 8px;border-radius:6px;}
.ps-buy-btn{width:100%;text-align:center;display:block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:13.5px;font-weight:600;padding:10px 0;border-radius:9px;text-decoration:none;}
.ps-buy-btn:hover{background:#059669;border-color:#059669;}
`}

);
}
