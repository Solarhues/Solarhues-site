'use client';
import React, { useState } from 'react';
import { ShoppingBag, Star, ArrowLeft } from 'lucide-react';

const ITEMS = [
  { id: 1, name: "Hardoll Waterproof Solar Garden Disk Lights (Set of 4)", cat: "Outdoor Lighting", r: 4.5, rev: "1,240", mrp: "₹2,499", off: "₹1,499", sv: "40% OFF", url: "https://link.amazon" },
  { id: 2, name: "Urja Lite Portable Solar Emergency LED Lantern with USB Port", cat: "Emergency & Utility", r: 4.3, rev: "820", mrp: "₹1,800", off: "₹1,149", sv: "36% OFF", url: "https://link.amazon" },
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
    <div style={{minHeight:'100vh',background:'#1e293b',color:'#fff',fontFamily:'sans-serif',padding:'24px'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.1)',paddingBottom:'16px'}}>
        <a href="/" style={{color:'#94A3B8',textDecoration:'none',display:'flex',alignItems:'center',gap:'4px'}}><ArrowLeft size={16}/> Back</a>
        <div style={{fontWeight:'700',fontSize:'20px'}}>SolarHues Store</div>
        <div style={{fontSize:'12px',background:'rgba(5,150,105,0.2)',color:'#6EE7B7',padding:'6px 12px',borderRadius:'20px'}}><ShoppingBag size={12}/> Affiliate Shop</div>
      </header>
      
      <div style={{margin:'24px 0',display:'flex',gap:'8px',flexWrap:'wrap'}}>
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{background:cat===c?'#facc15':'rgba(255,255,255,0.05)',color:cat===c?'#1e293b':'#94A3B8',border:'none',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'600'}}>{c}</button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap: '20px'}}>
        {filtered.map((p) => (
          <div key={p.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'16px',display:'flex',flexDirection:'column',justifyContent:'space-between',minHeight:'280px'}}>
            <div>
              <span style={{fontSize:'11px',color:'#94E4C2',fontWeight:'700',textTransform:'uppercase'}}>{p.cat}</span>
              <h3 style={{fontSize:'14px',margin:'8px 0',lineHeight:'1.4',color:'#fff',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</h3>
              <div style={{display:'flex',gap:'6px',fontSize:'12px',color:'#64748B'}}><Star size={12} fill="#facc15" stroke="#facc15"/> <span style={{color:'#facc15',fontWeight:'700'}}>{p.r}</span> ({p.rev})</div>
            </div>
            <div style={{marginTop:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255,255,255,0.02)',padding:'10px',borderRadius:'8px',marginBottom:'12px'}}>
                <div><div style={{fontSize:'16px',fontWeight:'700',color:'#fff'}}>{p.off}</div><div style={{fontSize:'11px',color:'#64748B',textDecoration:'line-through'}}>{p.mrp}</div></div>
                <span style={{fontSize:'11px',color:'#6EE7B7',background:'rgba(5,150,105,0.15)',padding:'4px 8px',borderRadius:'4px',fontWeight:'700'}}>{p.sv}</span>
              </div>
              <a href={`${p.url}?tag=${TAG}`} target="_blank" rel="noopener noreferrer" style={{display:'block',width:'100%',textAlign:'center',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',padding:'10px 0',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'13px'}}>View on Amazon</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}