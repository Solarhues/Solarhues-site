'use client';
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ⚙️ NATIVE INTEGRATION FROM YOUR INDEX.HTML PARAMETERS
const SUPABASE_URL = 'https://qcnvqmomlzvlkquryreb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_heg2iW28ly1fTI5BRJ_0Cg_9lURldPF';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function SolarhuesComingSoon() {
  const [email, setEmail] = useState('');
  const [btnText, setBtnText] = useState('Notify me');
  const [isDisabled, setIsDisabled] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgClass, setMsgClass] = useState('hidden');

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setMsgText('');
    setMsgClass('hidden');

    // Email regex validation match from your index script
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMsgClass('block text-red-400 text-sm mt-3 font-semibold');
      setMsgText('Enter a valid email address.');
      return;
    }

    setIsDisabled(true);
    setBtnText('Joining...');

    try {
      // Direct database row insertion match to your 'waitlist_signups' table
      const { error } = await sb.from('waitlist_signups').insert({ email });

      if (error) throw error;

      setEmail('');
      setMsgClass('block text-emerald-400 text-sm mt-3 font-semibold');
      setMsgText("You're on the list — we'll email you at launch.");
    } catch (error) {
      if (error.code === '23505') {
        setMsgClass('block text-emerald-400 text-sm mt-3 font-semibold');
        setMsgText("You're already on the list!");
      } else {
        setMsgClass('block text-red-400 text-sm mt-3 font-semibold');
        setMsgText('Something went wrong — please try again.');
      }
    } finally {
      setIsDisabled(false);
      setBtnText('Notify me');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden text-white bg-[#1e293b] font-sans selection:bg-yellow-500 selection:text-[#1e293b]">
      
      {/* 🔮 ON-BRAND DRIFTING RADIAL GRADIENT WASH */}
      <div className="fixed inset-[-10%] pointer-events-none z-0 blur-[60px] opacity-40 bg-[radial-gradient(circle_at_15%_20%,rgba(5,150,105,0.35),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(250,204,21,0.25),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(5,150,105,0.2),transparent_50%)] animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* TOP BRAND BAR */}
        <header className="flex items-center justify-between px-8 py-7">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight font-display">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            </div>
            SolarHues
          </div>
          <span className="text-xs text-[#CBD5E1] border border-white/20 px-3 py-1.5 rounded-full font-medium">
            Launching soon
          </span>
        </header>

        {/* HERO CALL TO ACTION CENTER COLUMN */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 max-w-4xl mx-auto">
          <span className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[#94E4C2] mb-4.5">
            India's solar marketplace
          </span>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-[1.14] font-display">
            Find the right <span className="bg-gradient-to-r from-[#facc15] to-[#059669] bg-clip-text text-transparent">shade of solar</span> for your roof.
          </h1>
          
          <p className="text-base text-[#CBD5E1] max-w-lg mt-4.5 leading-[1.65] font-medium">
            SolarHues is almost ready — enter your pin code, get a real system size and payback estimate, and compare quotes from verified installers near you. We'll email you the moment we're live.
          </p>

          {/* THE CONVERTED WAITLIST ROW */}
          <div className="mt-9 w-full max-w-[420px] text-left">
            <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:ring-offset-1 focus:ring-offset-[#1e293b]"
              />
              <button 
                type="submit"
                disabled={isDisabled}
                className="px-5 py-3 rounded-xl bg-[#facc15] hover:bg-[#EAB308] text-[#1e293b] font-bold text-sm whitespace-nowrap transition disabled:opacity-60 cursor-pointer"
              >
                {btnText}
              </button>
            </form>
            <div className="text-[12.5px] text-[#8FA0B5] mt-2.5 text-center sm:text-left">No spam — just one email when we launch.</div>
            <div className={msgClass}>{msgText}</div>
          </div>

          {/* VALUE PROP BADGES */}
          <div className="flex flex-wrap justify-center gap-7 mt-12 max-w-[560px]">
            {[
              "Instant sizing calculator",
              "Compare verified vendors",
              "Managed, milestone-based payments"
            ].map((feature, idx) => (
              <div key={idx} className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]" />
                {feature}
              </div>
            ))}
          </div>
        </main>

        {/* BOTTOM UTILITY FOOTER */}
        <footer className="px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-[12.5px] text-[#64748B] border-t border-white/5 gap-2.5">
          <span>© 2026 SolarHues</span>
          <a href="mailto:hello@solarhues.com" className="text-[#94A3B8] hover:text-white transition">
            hello@solarhues.com
          </a>
             {/* DIRECT UTILITY NAVIGATION LINKS FOOTER */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[11px] font-bold text-gray-400 tracking-wide gap-3">
        <span>© {new Date().getFullYear()} Solarhues Network. All Rights Reserved.</span>
        
        <div className="flex flex-wrap justify-center gap-4 text-[#94A3B8]">
          <a href="/calculator" className="hover:text-white transition">Solar Calculator</a>
          <a href="/products" className="hover:text-white transition">Affiliate Shop</a>
          <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition">Terms of Service</a>
          <a href="/refunds" className="hover:text-white transition">Refund & Cancellations</a>
        </div>

        <a href="mailto:hello@solarhues.com" className="text-[#94A3B8] hover:text-white transition">
          hello@solarhues.com
        </a>
      </footer>

