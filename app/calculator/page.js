'use client';
import React, { useState } from 'react';
import { Calculator, ArrowRight, Sun, Leaf, TreePine, IndianRupee } from 'lucide-react';

export default function SolarhuesDynamicCalculator() {
  const [pincode, setPincode] = useState('');
  const [roofType, setRoofType] = useState('Concrete Slab');
  const [roofArea, setRoofArea] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [results, setResults] = useState(null);

  const calculateSolarMetrics = (e) => {
    e.preventDefault();
    const bill = parseFloat(monthlyBill);
    const area = parseFloat(roofArea);

    if (!bill || !area) {
      alert("Please fill in both your average monthly electricity bill and available roof area.");
      return;
    }

    const estimatedUnits = bill / 8;
    let recommendedSize = Math.round((estimatedUnits / 120) * 2) / 2;
    if (recommendedSize < 1) recommendedSize = 1;

    const spaceRequired = recommendedSize * 100;
    const isSpaceOk = area >= spaceRequired;
    const costEstimate = recommendedSize * 65000;
    const monthlySavings = recommendedSize * 120 * 8;
    const payback = costEstimate / (monthlySavings * 12);
    const co2 = Math.round(recommendedSize * 120 * 12 * 0.82);
    const trees = Math.round(co2 / 22);

    setResults({
      size: recommendedSize,
      reqSpace: spaceRequired,
      spaceOk: isSpaceOk,
      cost: costEstimate,
      paybackPeriod: payback.toFixed(1),
      co2Saved: (co2 / 1000).toFixed(1),
      treesPlanted: trees
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* MINIMALIST HEADER */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-black tracking-tight text-[#4a3319]">
          S<span className="text-yellow-500 font-extrabold px-0.5">☀️</span>larhues
        </div>
        <div className="flex space-x-6 text-xs font-bold text-gray-500">
          <a href="/" className="hover:text-amber-950 transition">Home</a>
          <a href="/products" className="hover:text-amber-950 transition">Shop</a>
          <a href="/terms" className="hover:text-amber-950 transition">Terms</a>
        </div>
      </header>

      {/* CORE WORKSPACE GRID */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT COLUMN: USER INPUT PANELS */}
        <form onSubmit={calculateSolarMetrics} className="lg:col-span-5 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-1.5">
              <Calculator size={20} className="text-[#4a3319]"/> Solar Calculator Engine
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Input parameters to test project feasibility</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">6-Digit Pincode</label>
              <input type="text" maxLength={6} required placeholder="e.g. 400001" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white font-bold focus:outline-none focus:border-amber-800" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Terrace Type</label>
              <select value={roofType} onChange={(e) => setRoofType(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white font-bold focus:outline-none focus:border-amber-800">
                <option value="Concrete Slab">Concrete Slab</option>
                <option value="Metal Sheet">Metal Sheet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Terrace Area (Sq. Ft)</label>
            <input type="number" required placeholder="Enter open roof space..." value={roofArea} onChange={(e) => setRoofArea(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white font-bold focus:outline-none focus:border-amber-800" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monthly Bill Amount (₹)</label>
            <input type="number" required placeholder="Enter average bill..." value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white font-bold focus:outline-none focus:border-amber-800" />
          </div>

          <button type="submit" className="w-full bg-[#4a3319] hover:bg-[#322211] text-white text-sm font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-1">
            Calculate Feasibility <ArrowRight size={16}/>
          </button>
        </form>

        {/* RIGHT COLUMN: CALCULATION RESULTS ENGINE */}
        <div className="lg:col-span-7 space-y-6">
          {results ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-br from-amber-50/40 to-white border border-yellow-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Recommended Solar Capacity</h3>
                    <div className="text-4xl font-black text-gray-900 mt-1">{results.size} <span className="text-lg font-bold text-gray-400">kW System</span></div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block sm:text-right">Estimated Investment</span>
                    <div className="text-xl font-black text-emerald-800 flex items-center gap-0.5 mt-1"><IndianRupee size={16} />{results.cost.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${results.spaceOk ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <p className="text-xs font-semibold text-gray-600">
                    {results.spaceOk ? `Terrace Compliance Check Confirmed: Area supports system size (Needs ${results.reqSpace} Sq. Ft).` : `Space Notice: This system configuration requires roughly ${results.reqSpace} Sq. Ft of open space.`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                  <div className="text-gray-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1"><Sun size={12} className="text-amber-600"/> Payback Window</div>
                  <div className="text-2xl font-black text-gray-900 mt-2">{results.paybackPeriod} <span className="text-xs font-bold text-gray-400">Years</span></div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                  <div className="text-gray-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1"><Leaf size={12} className="text-emerald-600"/> Carbon Offset</div>
                  <div className="text-2xl font-black text-gray-900 mt-2">{results.co2Saved} <span className="text-xs font-bold text-gray-400">Tons/Yr</span></div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                  <div className="text-gray-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1"><TreePine size={12} className="text-green-700"/> Trees Planted</div>
                  <div className="text-2xl font-black text-gray-900 mt-2">{results.treesPlanted} <span className="text-xs font-bold text-gray-400">Trees/Yr</span></div>
                </div>
              </div>

              <div className="p-4 bg-[#4a3319] text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div>
                  <h4 className="text-sm font-bold">Lock in this project design specification?</h4>
                  <p className="text-[11px] text-amber-200 font-medium">Bypass gateway commissions completely. Connect directly with top local contractors.</p>
                </div>
                <a href="/quote" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-xs px-4 py-2.5 rounded-lg text-center shadow-sm transition">
                  Request Free Quotes
                </a>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center text-gray-400 font-semibold text-sm flex flex-col items-center justify-center bg-gray-50/20">
              <Sun size={32} className="text-gray-300 mb-2" />
              Enter your properties parameters on the left to review your dynamic carbon offsets and system investment analysis.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
