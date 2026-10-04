'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Space_Grotesk, Inter } from 'next/font/google';

const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'] });
const inter = Inter({ subsets: ['latin'] });

const steps = [
  { n: '01', t: 'Size your system', d: 'Enter your pincode, roof area and monthly bill to see system size, cost after subsidy and payback.' },
  { n: '02', t: 'Compare quotes', d: 'Verified installers near you send quotes. You shortlist up to three.' },
  { n: '03', t: 'Pay in stages', d: 'Your money is held at each stage and released only after you confirm the work.' },
];

export default function Home() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  function go(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      setErr('Enter a valid 6-digit pincode.');
      return;
    }
    router.push(`/calculator?pin=${pin}`);
  }

  return (
    <div className={`page ${inter.className}`}>
      <header className="nav">
        <Link href="/" className={`brand ${grotesk.className}`}>
          <span className="dots"><i /><i /><i /></span>SolarHues
        </Link>
        <nav className="links">
          <Link href="/calculator">Calculator</Link>
          <Link href="/products">Products</Link>
          <Link href="/vendor-apply">For Installers</Link>
          <Link href="/login" className="cta">Customer login →</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="kicker">India&apos;s solar escrow marketplace</p>
          <h1 className={grotesk.className}>
            Find the right <span className="grad">shade of solar</span> for your roof.
          </h1>
          <p className="sub">
            Check what rooftop solar would cost you, how much you would save, and how long it takes to pay
            back. Then compare quotes from verified installers near you.
          </p>
          <form onSubmit={go} className="pinform">
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter your 6-digit pincode"
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setErr(''); }}
              aria-label="Pincode"
            />
            <button type="submit">Analyze roof →</button>
          </form>
          {err && <p className="err">{err}</p>}
          <ul className="chips">
            <li><b style={{ background: '#059669' }} />Verified installers</li>
            <li><b style={{ background: '#facc15' }} />Staged escrow payments</li>
            <li><b style={{ background: '#38bdf8' }} />Subsidy-aware sizing</li>
          </ul>
        </section>

        <section className="how">
          <h2 className={grotesk.className}>How it works</h2>
          <div className="grid">
            {steps.map((s) => (
              <div className="card" key={s.n}>
                <span className={`num ${grotesk.className}`}>{s.n}</span>
                <h3 className={grotesk.className}>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="foot">
        <span>© 2026 SolarHues. All rights reserved.</span>
        <span className="flinks">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refunds</Link>
        </span>
      </footer>

      <style jsx>{`
        .page { min-height: 100vh; display: flex; flex-direction: column; background: #1e293b; color: #f8fafc; }
        .nav { display: flex; justify-content: space-between; align-items: center; padding: 20px clamp(16px, 5vw, 48px); }
        .brand { display: flex; align-items: center; gap: 10px; color: #fff; font-size: 1.3rem; font-weight: 700; text-decoration: none; }
        .dots { display: flex; gap: 4px; }
        .dots i { width: 9px; height: 9px; border-radius: 50%; background: #facc15; }
        .dots i:nth-child(2) { background: #84cc16; }
        .dots i:nth-child(3) { background: #059669; }
        .links { display: flex; align-items: center; gap: 10px; }
        .links :global(a) { padding: 8px 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; color: #e2e8f0; font-size: 0.9rem; text-decoration: none; }
        .links :global(a:hover) { border-color: #facc15; }
        .links :global(a.cta) { border-color: #facc15; color: #facc15; }
        .hero { max-width: 760px; margin: 0 auto; padding: clamp(48px, 10vh, 110px) 20px 64px; text-align: center; }
        .kicker { margin: 0 0 18px; color: #6ee7b7; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
        h1 { margin: 0; font-size: clamp(2.4rem, 6vw, 4.2rem); line-height: 1.05; letter-spacing: -0.03em; }
        .grad { background: linear-gradient(90deg, #facc15, #34d399); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .sub { max-width: 560px; margin: 22px auto 34px; color: #cbd5e1; font-size: 1.1rem; line-height: 1.65; }
        .pinform { display: flex; gap: 10px; max-width: 460px; margin: 0 auto; }
        .pinform input { flex: 1; min-width: 0; padding: 16px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.05); color: #fff; font-size: 1rem; outline: none; }
        .pinform input:focus { border-color: #facc15; }
        .pinform button { padding: 16px 24px; border: none; border-radius: 12px; background: #facc15; color: #1e293b; font-weight: 700; font-size: 1rem; cursor: pointer; white-space: nowrap; }
        .pinform button:hover { background: #fde047; }
        .err { margin: 12px 0 0; color: #fca5a5; font-size: 0.9rem; }
        .chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 24px; margin: 28px 0 0; padding: 0; list-style: none; color: #94a3b8; font-size: 0.9rem; }
        .chips li { display: flex; align-items: center; gap: 8px; }
        .chips b { width: 8px; height: 8px; border-radius: 50%; }
        .how { max-width: 1000px; width: 100%; margin: 0 auto; padding: 24px 20px 72px; }
        .how h2 { margin: 0 0 24px; text-align: center; font-size: 1.7rem; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .card { padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
        .num { color: #059669; font-weight: 700; }
        .card h3 { margin: 10px 0 8px; font-size: 1.15rem; }
        .card p { margin: 0; color: #94a3b8; line-height: 1.6; font-size: 0.95rem; }
        .foot { margin-top: auto; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 20px clamp(16px, 5vw, 48px); border-top: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 0.85rem; }
        .flinks { display: flex; gap: 18px; }
        .flinks :global(a) { color: #94a3b8; text-decoration: none; }
        .flinks :global(a:hover) { color: #facc15; }
        @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } .hide-sm { display: none !important; } .pinform { flex-direction: column; } }
      `}</style>
    </div>
  );
}
