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

        .ps-header{
