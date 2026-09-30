'use client';
import React, { useState } from 'react';
import { ShoppingBag, Star, ArrowLeft, ArrowRight } from 'lucide-react';

const AFFILIATE_PRODUCTS = [
  { id: 1, name: "Hardoll Waterproof Solar Garden Disk Lights (Set of 4)", category: "Outdoor Lighting", rating: 4.5, reviews: "1,240", mrp: "₹2,499", offerPrice: "₹1,499", savings: "40% OFF", asin: "B07K4S2X6W" },
  { id: 2, name: "Urja Lite Portable Solar Emergency LED Lantern with USB Port", category: "Emergency & Utility", rating: 4.3, reviews: "820", mrp: "₹1,800", offerPrice: "₹1,149", savings: "36% OFF", asin: "B08LYV9T55" },
  { id: 3, name: "Anker Solar Charger 21W 2-Port USB Foldable Panel", category: "Portable Power", rating: 4.7, reviews: "2,150", mrp: "₹6,999", offerPrice: "₹4,899", savings: "30% OFF", asin: "B012YQZSMV" },
  { id: 4, name: "Havells Solace 3-Watt Solar Path Finder Light Assembly", category: "Outdoor Lighting", rating: 4.4, reviews: "410", mrp: "₹1,500", offerPrice: "₹999", savings: "33% OFF", asin: "B09RFG8912" },
  { id: 5, name: "Solar Universe India 10W Solar Module for DIY Charging", category: "DIY Components", rating: 4.2, reviews: "670", mrp: "₹1,200", offerPrice: "₹749", savings: "38% OFF", asin: "B078WV7V45" },
  { id: 6, name: "Tata Power Solar Regular 100-Litre Solar Water Heater", category: "Home Appliances", rating: 4.6, reviews: "340", mrp: "₹28,000", offerPrice: "₹23,500", savings: "16% OFF", asin: "B0BFG90123" },
  { id: 7, name: "Home 100W Solar Street Light Waterproof with Remote", category: "Outdoor Lighting", rating: 4.4, reviews: "1,520", mrp: "₹4,999", offerPrice: "₹2,799", savings: "44% OFF", asin: "B09WXY8912" },
  { id: 8, name: "Pick Ur Needs Solar Powered Rechargeable LED Torch Lamp", category: "Emergency & Utility", rating: 4.1, reviews: "630", mrp: "₹999", offerPrice: "₹649", savings: "35% OFF", asin: "B07NX2Y731" },
  { id: 9, name: "SARRVAD Portable Solar Generator Power Station 150Wh", category: "Portable Power", rating: 4.5, reviews: "280", mrp: "₹18,500", offerPrice: "₹14,999", savings: "19% OFF", asin: "B08HG8Y12X" },
  { id: 10, name: "Luminous Solar NXG 1100 Hybrid UPS Smart Inverter", category: "Home Appliances", rating: 4.3, reviews: "1,890", mrp: "₹9,500", offerPrice: "₹7,299", savings: "23% OFF", asin: "B01N2Z891A" },
  { id: 11, name: "Solar Universe India Digital Multimeter Setup Engineer Kit", category: "DIY Components", rating: 4.0, reviews: "190", mrp: "₹1,400", offerPrice: "₹949", savings: "32% OFF", asin: "B079WV7V46" },
  { id: 12, name: "IFITech Outdoor Solar Wall Security Motion Lights (Set of 2)", category: "Outdoor Lighting", rating: 4.2, reviews: "2,410", mrp: "₹2,200", offerPrice: "₹1,299", savings: "41% OFF", asin: "B01M0X9012" },
  { id: 13, name: "Gesto High Power Solar Flood Light 200W IP66 Waterproof", category: "Outdoor Lighting", rating: 4.3, reviews: "1,140", mrp: "₹5,500", offerPrice: "₹3,199", savings: "42% OFF", asin: "B0B5XYZ891" },
  { id: 14, name: "Wipro Always On Rechargeable Solar Emergency LED Lantern", category: "Emergency & Utility", rating: 4.4, reviews: "3,110", mrp: "₹2,100", offerPrice: "₹1,449", savings: "31% OFF", asin: "B07QW12Y34" },
  { id: 15, name: "EcoFlow RIVER 2 Portable Power Station 256Wh LiFePO4", category: "Portable Power", rating: 4.8, reviews: "750", mrp: "₹29,999", offerPrice: "₹24,499", savings: "18% OFF", asin: "B0BMLY8910" },
  { id: 16, name: "Microtek Solar Inverter SS1130 12V Dual Charging Matrix", category: "Home Appliances", rating: 4.2, reviews: "860", mrp: "₹8,900", offerPrice: "₹6,850", savings: "23% OFF", asin: "B07BFG901X" },
  { id: 17, name: "Loom Solar Panel 50 Watt - 12 Volt Mono Crystalline", category: "DIY Components", rating: 4.5, reviews: "1,430", mrp: "₹4,500", offerPrice: "₹3,250", savings: "27% OFF", asin: "B07NXG901P" },
  { id: 18, name: "V-Guard Solar Hot Water Geyser 150 Litre System", category: "Home Appliances", rating: 4.4, reviews: "210", mrp: "₹34,000", offerPrice: "₹29,999", savings: "11% OFF", asin: "B0CFG90144" },
  { id: 19, name: "Hardoll Solar Decorative Fairy String Lights (100 LED)", category: "Outdoor Lighting", rating: 4.3, reviews: "970", mrp: "₹1,699", offerPrice: "₹999", savings: "41% OFF", asin: "B07K4S2X7X" },
  { id: 20, name: "Solar Universe India 12V Charge Controller Regulator", category: "DIY Components", rating: 4.1, reviews: "540", mrp: "₹950", offerPrice: "₹599", savings: "37% OFF", asin: "B078WV7V47" },
];

// TODO: replace with your real Amazon Associates tracking ID once approved
const AFFILIATE_TAG = 'solarhues-21';

export default function SolarAffiliateStorefront() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Outdoor Lighting', 'Emergency & Utility', 'Portable Power', 'DIY Components', 'Home Appliances'];
  const filteredProducts = selectedCategory === 'All' ? AFFILIATE_PRODUCTS : AFFILIATE_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="ps-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :root{
          --ps-slate:#1e293b; --ps-slate-soft:#64748B; --ps-line:#E2E8F0; --ps-paper:#F8FAFC;
          --ps-emerald:#059669; --ps-emerald-soft:#D1FAE5; --ps-sun:#facc15; --ps-sun-dark:#EAB308;
          --ps-font-body:'Inter',-apple-system,sans-serif; --ps-font-head:'Plus Jakarta Sans','Inter',sans-serif;
        }
        .ps-page{ min-height:100vh; background:var(--ps-paper); color:var(--ps-slate); font-family:var(--ps-font-body); -webkit-font-smoothing:antialiased; }

        .ps-header{ background:#fff; border-bottom:1px solid var(--ps-line); padding:18px 32px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .ps-header-left{ display:flex; align-items:center; gap:16px; }
        .ps-back{ display:flex; align-items:center; gap:5px; font-size:12.5px; font-weight:700; color:var(--ps-slate-soft); text-decoration:none; }
        .ps-back:hover{ color:var(--ps-slate); }
        .ps-divider-v{ width:1px; height:16px; background:var(--ps-line); }
        .ps-brand{ display:flex; align-items:center; gap:9px; font-family:var(--ps-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; }
        .ps-dots{ display:flex; gap:4px; }
        .ps-dot{ width:9px; height:9px; border-radius:50%; }
        .ps-badge{
          font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--ps-emerald);
          background:var(--ps-emerald-soft); border:1px solid #A7F3D0; padding:7px 12px; border-radius:10px;
          display:flex; align-items:center; gap:6px;
        }

        .ps-main{ max-width:1200px; margin:0 auto; padding:40px 32px 70px; }
        .ps-toolbar{ display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; border-bottom:1px solid var(--ps-line); padding-bottom:20px; margin-bottom:28px; }
        .ps-title{ font-family:var(--ps-font-head); font-size:26px; font-weight:800; letter-spacing:-0.01em; margin:0; }
        .ps-subtitle{ font-size:13px; color:var(--ps-slate-soft); font-weight:500; margin-top:4px; }

        .ps-filters{ display:flex; flex-wrap:wrap; gap:8px; }
        .ps-filter-btn{
          font-family:var(--ps-font-body); font-size:12.5px; font-weight:700; padding:9px 14px; border-radius:10px;
          border:1px solid var(--ps-line); background:#fff; color:var(--ps-slate-soft); cursor:pointer;
        }
        .ps-filter-btn:hover{ border-color:var(--ps-slate-soft); }
        .ps-filter-btn.active{ background:var(--ps-slate); border-color:var(--ps-slate); color:#fff; }

        .ps-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:20px; }

        .ps-card{ background:#fff; border:1px solid var(--ps-line); border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:14px; transition:box-shadow 0.15s, transform 0.15s; }
        .ps-card:hover{ box-shadow:0 6px 20px rgba(30,41,59,0.08); transform:translateY(-2px); }

        .ps-thumb{
          width:100%; height:150px; background:linear-gradient(135deg, var(--ps-emerald-soft), #F8FAFC); border:1px solid var(--ps-line);
          border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; position:relative; text-align:center; padding:14px;
        }
        .ps-thumb-cat{ position:absolute; top:10px; left:10px; font-size:9.5px; font-weight:700; color:var(--ps-emerald); background:#fff; border:1px solid #A7F3D0; padding:3px 8px; border-radius:6px; }
        .ps-thumb-icon{ font-size:26px; }
        .ps-thumb-label{ font-size:10.5px; font-weight:700; color:var(--ps-slate-soft); }
        .ps-thumb-asin{ font-size:9px; color:#94A3B8; font-family:monospace; }

        .ps-name{ font-size:13px; font-weight:700; line-height:1.4; min-height:36px; margin:0; }
        .ps-rating{ display:flex; align-items:center; gap:5px; font-size:11.5px; color:var(--ps-slate-soft); font-weight:600; }
        .ps-rating-star{ display:flex; align-items:center; gap:2px; color:#EAB308; font-weight:700; }

        .ps-buy-row{ border-top:1px solid #F1F5F9; padding-top:14px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .ps-price-line{ display:flex; align-items:baseline; gap:7px; }
        .ps-offer{ font-family:var(--ps-font-head); font-size:17px; font-weight:800; }
        .ps-mrp{ font-size:12px; color:#94A3B8; text-decoration:line-through; font-weight:600; }
        .ps-savings{ display:inline-block; margin-top:4px; font-size:10px; font-weight:800; color:var(--ps-emerald); background:var(--ps-emerald-soft); padding:2px 7px; border-radius:6px; }

        .ps-buy-btn{
          background:var(--ps-sun); color:var(--ps-slate); font-weight:700; font-size:12.5px; text-decoration:none;
          padding:10px 14px; border-radius:9px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;
        }
        .ps-buy-btn:hover{ background:var(--ps-sun-dark); }

        .ps-disclosure{
          margin-top:40px; background:#fff; border:1px solid var(--ps-line); border-radius:12px; padding:18px 20px;
          font-size:12px; color:var(--ps-slate-soft); line-height:1.65;
        }
        .ps-disclosure strong{ color:var(--ps-slate); }

        @media (max-width:640px){
          .ps-header{ padding:16px 20px; }
          .ps-main{ padding:28px 18px 56px; }
          .ps-grid{ grid-template-columns:1fr 1fr; gap:12px; }
        }
        @media (max-width:420px){
          .ps-grid{ grid-template-columns:1fr; }
        }
      `}</style>

      <header className="ps-header">
        <div className="ps-header-left">
          <a href="/" className="ps-back"><ArrowLeft size={15} /> Back to home</a>
          <div className="ps-divider-v" />
          <div className="ps-brand">
            <span className="ps-dots">
              <span className="ps-dot" style={{ background: '#facc15' }} />
              <span className="ps-dot" style={{ background: '#fbbf24' }} />
              <span className="ps-dot" style={{ background: '#059669' }} />
            </span>
            SolarHues Shop
          </div>
        </div>
        <span className="ps-badge"><ShoppingBag size={13} /> Amazon verified links</span>
      </header>

      <main className="ps-main">
        <div className="ps-toolbar">
          <div>
            <h1 className="ps-title">Curated clean-energy gear</h1>
            <p className="ps-subtitle">Top-reviewed solar hardware and gadgets for sustainable living.</p>
          </div>
          <div className="ps-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`ps-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="ps-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="ps-card">
              <div className="ps-thumb">
                <span className="ps-thumb-cat">{product.category}</span>
                <span className="ps-thumb-icon">⚡</span>
                <span className="ps-thumb-label">Amazon marketplace</span>
                <span className="ps-thumb-asin">ASIN: {product.asin}</span>
              </div>

              <div>
                <h3 className="ps-name">{product.name}</h3>
                <div className="ps-rating" style={{ marginTop: 6 }}>
                  <span className="ps-rating-star"><Star size={12} fill="currentColor" /> {product.rating}</span>
                  <span>({product.reviews} reviews)</span>
                </div>
              </div>

              <div className="ps-buy-row">
                <div>
                  <div className="ps-price-line">
                    <span className="ps-offer">{product.offerPrice}</span>
                    <span className="ps-mrp">{product.mrp}</span>
                  </div>
                  <span className="ps-savings">{product.savings}</span>
                </div>
                <a
                  href={`https://www.amazon.in/dp/${product.asin}?tag=${AFFILIATE_TAG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ps-buy-btn"
                >
                  Buy <ArrowRight size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="ps-disclosure">
          <strong>As an Amazon Associate, SolarHues earns from qualifying purchases.</strong> SolarHues
          participates in the Amazon Services LLC Associates Program, an affiliate advertising
          program designed to provide a means for sites to earn advertising fees by advertising
          and linking to Amazon.in.
        </div>
      </main>
    </div>
  );
}
