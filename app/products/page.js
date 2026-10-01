'use client';
import React, { useState } from 'react';
import { ShoppingBag, Star, ArrowLeft } from 'lucide-react';

const AFFILIATE_PRODUCTS = [
  { id: 1, name: "Gesto 25 Feet G40 LED String Lights with 25 Warm White Bulbs", category: "Outdoor Lighting", rating: 4.1, reviews: "278", mrp: "₹1,999", offerPrice: "₹1,198", savings: "40% OFF", url: "https://link.amazon" },
  { id: 2, name: "One94Store 20Meter 56 LED Serial String Lights - Waterproof Wire", category: "Outdoor Lighting", rating: 3.9, reviews: "1,731", mrp: "₹999", offerPrice: "₹199", savings: "80% OFF", url: "https://link.amazon" },
  { id: 3, name: "Anker Solar Charger 21W 2-Port USB Foldable Panel", category: "Portable Power", rating: 4.7, reviews: "2,150", mrp: "₹6,999", offerPrice: "₹4,899", savings: "30% OFF", url: "https://link.amazon" },
  { id: 4, name: "Havells Solace 3-Watt Solar Path Finder Light Assembly", category: "Outdoor Lighting", rating: 4.4, reviews: "410", mrp: "₹1,500", offerPrice: "₹999", savings: "33% OFF", url: "https://link.amazon" },
  { id: 5, name: "Solar Universe India 10W Solar Module for DIY Charging", category: "DIY Components", rating: 4.2, reviews: "670", mrp: "₹1,200", offerPrice: "₹749", savings: "38% OFF", url: "https://link.amazon" },
  { id: 6, name: "Tata Power Solar Regular 100-Litre Solar Water Heater", category: "Home Appliances", rating: 4.6, reviews: "340", mrp: "₹28,000", offerPrice: "₹23,500", savings: "16% OFF", url: "https://link.amazon" },
  { id: 7, name: "Home 100W Solar Street Light Waterproof with Remote", category: "Outdoor Lighting", rating: 4.4, reviews: "1,520", mrp: "₹4,999", offerPrice: "₹2,799", savings: "44% OFF", url: "https://link.amazon" },
  { id: 8, name: "Pick Ur Needs Solar Powered Rechargeable LED Torch Lamp", category: "Emergency & Utility", rating: 4.1, reviews: "630", mrp: "₹999", offerPrice: "₹649", savings: "35% OFF", url: "https://link.amazon" },
  { id: 9, name: "SARRVAD Portable Solar Generator Power Station 150Wh", category: "Portable Power", rating: 4.5, reviews: "280", mrp: "₹18,500", offerPrice: "₹14,999", savings: "19% OFF", url: "https://link.amazon" },
  { id: 10, name: "Luminous Solar NXG 1100 Hybrid UPS Smart Inverter", category: "Home Appliances", rating: 4.3, reviews: "1,890", mrp: "₹9,500", offerPrice: "₹7,299", savings: "23% OFF", url: "https://link.amazon" },
  { id: 11, name: "Solar Universe India Digital Multimeter Setup Kit", category: "DIY Components", rating: 4.0, reviews: "190", mrp: "₹1,400", offerPrice: "₹949", savings: "32% OFF", url: "https://link.amazon" },
  { id: 12, name: "IFITech Outdoor Solar Wall Security Motion Lights (Set of 2)", category: "Outdoor Lighting", rating: 4.2, reviews: "2,410", mrp: "₹2,200", offerPrice: "₹1,299", savings: "41% OFF", url: "https://link.amazon" },
  { id: 13, name: "Gesto High Power Solar Flood Light 200W IP66", category: "Outdoor Lighting", rating: 4.3, reviews: "1,140", mrp: "₹5,500", offerPrice: "₹3,199", savings: "42% OFF", url: "https://link.amazon" },
  { id: 14, name: "Wipro Always On Rechargeable Solar Emergency LED Lantern", category: "Emergency & Utility", rating: 4.4, reviews: "3,110", mrp: "₹2,100", offerPrice: "₹1,449", savings: "31% OFF", url: "https://link.amazon" },
  { id: 15, name: "EcoFlow RIVER 2 Portable Power Station 256Wh LiFePO4", category: "Portable Power", rating: 4.8, reviews: "750", mrp: "₹29,999", offerPrice: "₹24,499", savings: "18% OFF", url: "https://link.amazon" },
  { id: 16, name: "Microtek Solar Inverter SS1130 12V Dual Charging Matrix", category: "Home Appliances", rating: 4.2, reviews: "860", mrp: "₹8,900", offerPrice: "₹6,850", savings: "23% OFF", url: "https://link.amazon" },
  { id: 17, name: "Loom Solar Panel 50 Watt - 12 Volt Mono Crystalline", category: "DIY Components", rating: 4.5, reviews: "1,430", mrp: "₹4,500", offerPrice: "₹3,250", savings: "27% OFF", url: "https://link.amazon" },
  { id: 18, name: "V-Guard Solar Hot Water Geyser 150 Litre System", category: "Home Appliances", rating: 4.4, reviews: "210", mrp: "₹34,000", offerPrice: "₹29,999", savings: "11% OFF", url: "https://link.amazon" }
];

const AFFILIATE_TAG = 'solarhues-21';

export default function SolarAffiliateStorefront() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Outdoor Lighting', 'Emergency & Utility', 'Portable Power', 'DIY Components', 'Home Appliances'];
  const filtered = selectedCategory === 'All' ? AFFILIATE_PRODUCTS : AFFILIATE_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="ps-page">
      <div className="ps-glow"></div>
      <div className="ps-wrap">
        <header className="ps-header">
          <div className="ps-header-left">
            <a href="/" className="ps-back"><ArrowLeft size={16} /> Back</a>
            <div className="ps-divider-v"></div>
            <div className="ps-brand">
              <div className="ps-dots">
                <span className="ps-dot" style={{background:'var(--sun, #facc15)'}}></span>
                <span className="ps-dot" style={{background:'#fbbf24'}}></span>
                <span className="ps-dot" style={{background:'var(--emerald, #059669)'}}></span>
              </div>
              SolarHues
            </div>
          </div>
          <div className="ps-badge"><ShoppingBag size={14} /> Affiliate Shop</div>
        </header>
        <main className="ps-main">
          <div className="ps-toolbar">
            <div>
              <h1 className="ps-title">Curated Solar Gear</h1>
              <p className="ps-subtitle">Top-rated consumer solar products available in India</p>
            </div>
            <div className="ps-filters">
              {categories.map((cat)=>(
                <button key={cat} className={`ps-filter-btn ${selectedCategory===cat?'active':''}`} onClick={()=>setSelectedCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="ps-grid">
            {filtered.map((p)=>{
              const trackUrl = `${p.url}?tag=${AFFILIATE_TAG}`;
              return (
                <div key={p.id} className="ps-card">
                  <div>
                    <span className="ps-card-cat">{p.category}</span>
                    <h3 className="ps-card-title">{p.name}</h3>
                    <div className="ps-rating-row">
                      <div className="ps-stars"><Star size={13} fill="#facc15" stroke="#facc15"/><span>{p.rating}</span></div>
                      <span className="ps-reviews">({p.reviews} reviews)</span>
                    </div>
                  </div>
                  <div>
                    <div className="ps-price-box">
                      <div className="ps-price-main"><span className="ps-offer">{p.offerPrice}</span><span className="ps-mrp">{p.mrp}</span></div>
                      <span className="ps-savings">{p.savings}</span>
                    </div>
                    <a href={trackUrl} target="_blank" rel="noopener noreferrer" className="ps-buy-btn">View on Amazon</a>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
      <style>{`
        .ps-page{min-height:100vh;background:#1e293b;color:#fff;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden;}
        .ps-glow{position:fixed;inset:-10%;background:radial-gradient(circle at 15% 20%,rgba(5,150,105,0.2),transparent 45%),radial-gradient(circle at 85% 10%,rgba(250,204,21,0.12),transparent 45%);filter:blur(60px);z-index:0;pointer-events:none;}
        .ps-wrap{position:relative;z-index:1;}
        .ps-header{border-bottom:1px solid rgba(255,255,255,0.08);padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}
        .ps-header-left{display:flex;align-items:center;gap:16px;}
        .ps-back{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;color:#94A3B8;text-decoration:none;}
        .ps-back:hover{color:#fff;}
        .ps-divider-v{width:1px;height:16px;background:rgba(255,255,255,0.15);}
        .ps-brand{display:flex;align-items:center;gap:9px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;}
        .ps-dots{display:flex;gap:4px;}
        .ps-dot{width:9px;height:9px;border-radius:50%;display:inline-block;}
        .ps-badge{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#6EE7B7;background:rgba(5,150,105,0.15);border:1px solid rgba(5,150,105,0.35);padding:7px 12px;border-radius:10px;display:flex;align-items:center;gap:6px;}
        .ps-main{max-width:1200px;margin:0 auto;padding:40px 32px 70px;}
        .ps-toolbar{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:20px;margin-bottom:28px;}
        .ps-title{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:800;margin:0;color:#fff;}
        .ps-subtitle{font-size:13px;color:#94A3B8;margin-top:4px;}
        .ps-filters{display:flex;flex-wrap:wrap;gap:8px;}
        .ps-filter-btn{font-size:12.5px;font-weight:700;padding:9px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.04);color:#94A3B8;cursor:pointer;}
        .ps-filter-btn:hover{border-color:#94A3B8;color:#fff;}
        .ps-filter-btn.active{background:#facc15;border-color:#facc15;color:#1e293b;}
        .ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;}
        .ps-card{background:rgba(255, 255, 255, 0.03);border:1px solid rgba(255, 255, 255, 0.08);border-radius:14px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;min-height:310px;}
        .ps-card-cat{font-size:11px;text-transform:uppercase;color:#94E4C2;font-weight:700;margin-bottom:8px;display:block;}
        .ps-card-title{font-size:14.5px;font-weight:600;line-height:1.4;color:#fff;margin:0 0 12px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;height:40px;}
        .ps-rating-row{display:flex;align-items:center;gap:8px;font-size:12.5px;margin-bottom:16px;}
        .ps-stars{display:flex;align-items:center;gap:4px;color:#facc15;font-weight:600;}
        .ps-reviews{color:#64748B;}
        .ps-price-box{background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .ps-price-main {display:flex;flex-direction:column;}
        .ps-offer{font-size:18px;font-weight:700;color:#fff;font-family:'Space Grotesk',sans-serif;}
        .ps-mrp{font-size:12px;color:#64748B;text-decoration:line-through;}
        .ps-savings{font-size:11px;font-weight:700;color:#6EE7B7;background:rgba(5,150,105,0.2);padding:4px 8px;border-radius:6px;}
        .ps-buy-btn{width:100%;text-align:center;display:block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:13.5px;font-weight:600;padding:10px 0;border-radius:9px;text-decoration:none;transition:background 0.2s;}
         .ps-buy-btn:hover {background:#059669;border-color:#059669;}
`}

);
}
