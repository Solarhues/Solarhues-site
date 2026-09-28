'use client';
import React, { useState } from 'react';
import { ShoppingBag, Calculator, ShieldCheck, ArrowRight, Star, TreePine, Sun, Leaf, IndianRupee, AlertTriangle } from 'lucide-react';

export default function SolarhuesDynamicCalculator() {
  const [pincode, setPincode] = useState('');
  const [roofType, setRoofType] = useState('Concrete Slab');
  const [roofArea, setRoofArea] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [calculatorResults, setCalculatorResults] = useState(null);

  // 🧮 DYNAMIC MATHEMATICAL LOGIC CALCULATOR ENGINE
  const calculateSolarMetrics = (e) => {
    e.preventDefault();
    
    const bill = parseFloat(monthlyBill);
    const area = parseFloat(roofArea);

    if (!bill || !area) {
      alert("Please fill in both your average monthly electricity bill and available roof area.");
      return;
    }

    // 1. Estimate monthly electrical units (kWh) consumed based on standard urban metro tariff of ₹8 per unit
    const estimatedUnits = bill / 8;

    // 2. System Sizing Matrix: 1 kW of solar capacity generates roughly 120 units per month in India
    let recommendedSize = estimatedUnits / 120;
    
    // Round to nearest 0.5 kW grid rating for clean commercial installer matching
    recommendedSize = Math.round(recommendedSize * 2) / 2;
    if (recommendedSize < 1) recommendedSize = 1;

    // 3. Physical Footprint Check: 1 kW of solar panels requires roughly 100 Sq. Ft of clear terrace space
    const requiredSpace = recommendedSize * 100;
    const isSpaceSufficient = area >= requiredSpace;

    // 4. Plant Financial Cost Estimate (Set at an industry baseline of ₹65,000 per kW)
    const estimatedCost = recommendedSize * 65000;

    // 5. Monthly Savings & ROI Timeline Breakdowns
    const monthlySavings = recommendedSize * 120 * 8;
    const paybackYears = estimatedCost / (monthlySavings * 12);

    // 6. Environmental Carbon Projections Matrix
    const annualGeneration = recommendedSize * 120 * 12;
    const co2Saved = Math.round(annualGeneration * 0.82); // 0.82 kg CO2 offset per kWh in India
    const treesEquivalent = Math.round(co2Saved / 22); // 1 mature tree absorbs ~22 kg CO2 annually

    setCalculatorResults({
      systemSize: recommendedSize,
      requiredArea: requiredSpace,
      spaceCheck: isSpaceSufficient,
      plantCost: estimatedCost,
      payback: paybackYears.toFixed(1),
      co2: co2Saved,
      trees: treesEquivalent
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      
      {/* 1. MINIMALIST DASHBOARD HEADER */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-black tracking-tight text-[#4a3319] flex items-center">
          S<span className="text-yellow-500 font-extrabold relative -top-0.5 px-0.5">☀️</span>larhues
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-bold text-gray-600">
          <a href="/" className="hover:text-amber-950 transition">Home</a>
          <a href="/privacy" className="hover:text-amber-950 transition">Privacy</a>
          <a href="/terms" className="hover:text-amber-950 transition">Terms of Service</a>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
          Platform Calculator
        </span>
      </header>

      {/* 2. MAIN APPLICATION INTERACTION GRID */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* INPUT PANEL MODULE FOR URBAN HOMEOWNERS */}
        <form onSubmit={calculateSolarMetrics} className="lg:col-span-5 bg-gray-50/50 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-1.5">
              <Calculator size={20} className="text-[#4a3319]"/> Solar Calculator Engine
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Input your utility metrics to analyze property viability</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">6-Digit Pincode</label>
              <input 
                type="text" 
                maxLength={6} 
                required 
                placeholder="e.g. 400001" 
                value={pincode} 
                onChange={(e) => setPincode(e.target.value)} 
                className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white font-bold focus:outline-none focus:border-amber-800" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Terrace Type</label>
              <select 
                value={roofType} 
                onChange={(e) => setRoofType(e.target.value)} 
                className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white font-bold focus:outline-none focus:border-amber-800"
              >
                <option value="Concrete Slab">Concrete Slab</option>
                <option value="Metal Sheet">Metal Sheet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Total Available Roof Area (Sq. Ft)</label>
            <input 
              type="number" 
              required 
              placeholder="Enter square footage..." 
              value={roofArea} 
              onChange={(e) => setRoofArea(e.target.value)} 
              className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white font-bold focus:outline-none focus:border-amber-800" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Average Monthly Electricity Bill (₹)</label>
            <input 
              type="number" 
              required 
              placeholder="Enter monthly bill value..." 
              value={monthlyBill} 
              onChange={(e) => setMonthlyBill(e.target.value)} 
              className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white font-bold focus:outline-none focus:border-amber-800" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#4a3319] hover:bg-[#322211] text-white text-sm font-bold py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1"
          >
            Run Feasibility Calculations <ArrowRight size={16}/>
          </button>
        </form>

        {/* OUTPUT ANALYSIS LOGS DISPLAY */}
        <div className="lg:col-span-7 space-y-6">
          {calculatorResults ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* PRIMARY LOAD SUMMARY PANEL */}
              <div className="bg-gradient-to-br from-amber-50/40 to-white border border-yellow-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Recommended Solar Capacity</h3>
                    <div className="text-4xl font-black text-gray-900 mt-1">
                      {calculatorResults.systemSize} <span className="text-lg font-bold text-gray-400">kW Plant</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase">Estimated Plant Cost</span>
                    <div className="text-xl font-black text-emerald-800 flex items-center sm:justify-end gap-0.5">
                      <IndianRupee size={16} />{calculatorResults.plantCost.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* PHYSICAL BOUNDARY VIABILITY WARNING CHECK */}
                <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${calculatorResults.spaceCheck ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <p className="text-xs font-semibold text-gray-600">
                    {calculatorResults.spaceCheck 
                      ? `Feasibility Match: Your terrace space is fully clear for layout setup (Requires ${calculatorResults.requiredArea} Sq. Ft).`
                      : `Space Limitation Warning: This system capacity size requires roughly ${calculatorResults.requiredArea} Sq. Ft of open area.`}
                  </p>
                </div>
              </div>

              {/* SAVINGS TIMELINE & CARBON MATRIX TILES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                  <div className="text-gray-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Sun size={12} className="text-amber-600"/> ROI Payback
                  </div>
                  <div className="text-2xl font-black text-gray-900 mt-2">
                    {calculatorResults.payback} <span className="text-xs font-bold text-gray-400">Years</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                  <div className="text-gray-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
