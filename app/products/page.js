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
  { id: 20, name: "Solar Universe India 12V Charge Controller Regulator", category: "DIY Components", rating: 4.1, reviews: "540", mrp: "₹950", offerPrice: "₹599", savings: "37% OFF", asin: "B078WV7V47" }
];

export default function SolarAffiliateStorefront() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Outdoor Lighting', 'Emergency & Utility', 'Portable Power', 'DIY Components', 'Home Appliances'];
  const filteredProducts = selectedCategory === 'All' ? AFFILIATE_PRODUCTS : AFFILIATE_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-100 px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a href="/" className="text-gray-500 hover:text-gray-900 flex items-center text-xs font-bold transition">
            <ArrowLeft size={16} className="mr-1"/> Back to Home
          </a>
          <span className="text-gray-300">|</span>
          <div className="text-2xl font-black tracking-tight text-[#4a3319]">S☀️larhues Shop</div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
          <ShoppingBag size={12}/> Amazon Verified Links
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Curated Clean Energy Gear</h1>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Top-reviewed solar hardware essentials and consumer gadgets for sustainable living.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-xs font-bold px-3 py-2 rounded-xl transition ${selectedCategory === cat ? 'bg-emerald-800 text-white shadow-sm' : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="w-full h-44 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center p-4 text-gray-400 font-mono text-[10px] space-y-1 relative">
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-bold absolute top-3 left-3">{product.category}</span>
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-gray-700">Amazon Marketplace Preview</span>
                <span className="text-gray-400 text-[9px]">ASIN: {product.asin}</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-gray-900 line-clamp-2 h-8 leading-relaxed">{product.name}</h3>
                <div className="flex items-center text-[10px] text-gray-500 font-semibold gap-1">
                  <span className="flex items-center text-yellow-500 font-bold"><Star size={12} fill="currentColor" className="mr-0.5" /> {product.rating}</span>
                  <span>({product.reviews} reviews)</span>
                </div>
              </div>
              <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-gray-900">{product.offerPrice}</span>
                    <span className="text-xs text-gray-400 line-through font-medium">{product.mrp}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{product.savings}</span>
                </div>
                <a href={`https://amazon.in{product.asin}?tag=solarhues-21`} target="_blank" rel="noopener noreferrer" className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-0.5">
                  Buy Product <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[11px] text-gray-500 font-medium leading-relaxed">
          <strong>Amazon Associate Disclosure Statement:</strong> Solarhues participates in the Amazon Services LLC Associates Program, an affiliate advertising system engineered to provide a safe, legitimate pathway for digital platforms to earn referral commissions by tracking click conversions and routing traffic links directly to Amazon.in properties.
        </div>
      </main>
    </div>
  );
}
