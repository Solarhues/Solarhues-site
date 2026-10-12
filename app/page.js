'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');

  function handlePincodeChange(event) {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);

    if (error) {
      setError('');
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError('Please enter a valid 6-digit Indian pincode.');
      return;
    }

    router.push(`/calculator?pin=${pincode}`);
  }

  return (
    <main className="sh-home">
      <header className="sh-header">
        <div className="sh-nav">
          <Link href="/" className="sh-brand" aria-label="SolarHues home">
            <span className="sh-brand-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            SolarHues
          </Link>

          <nav className="sh-nav-links" aria-label="Primary navigation">
            <Link href="/calculator">Calculator</Link>
            <Link href="/products">Products</Link>
            <Link href="/vendor-apply">For installers</Link>
          </nav>

          <Link href="/login" className="sh-login-link">
            Customer login <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <section className="sh-hero">
        <div className="sh-hero-inner">
          <p className="sh-eyebrow">India&apos;s rooftop solar marketplace</p>

          <h1>
            Find the right <span>shade of solar</span> for your roof.
          </h1>

          <p className="sh-hero-copy">
            Estimate rooftop-solar system size, likely costs, and savings.
            Then compare quotes from installers serving your area.
          </p>

          <form className="sh-pin-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="home-pincode">
              Your 6-digit pincode
            </label>

            <input
              id="home-pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="Enter your 6-digit pincode"
              value={pincode}
              onChange={handlePincodeChange}
              maxLength="6"
            />

            <button type="submit">Analyze roof <span>→</span></button>
          </form>

          {error ? <p className="sh-form-error">{error}</p> : null}

          <ul className="sh-benefits">
            <li><span className="sh-dot green" />Compare installer quotes</li>
            <li><span className="sh-dot yellow" />Clear project milestones</li>
            <li><span className="sh-dot blue" />Subsidy-aware sizing</li>
          </ul>
        </div>
      </section>

      <section className="sh-how">
        <div className="sh-section-wrap">
          <p className="sh-eyebrow">Simple process</p>
          <h2>How it works</h2>

          <div className="sh-steps">
            <article className="sh-step">
              <span className="sh-step-number">01</span>
              <h3>Size your system</h3>
              <p>
                Enter your pincode, roof area, and electricity bill to view an
                indicative system size, cost, and payback estimate.
              </p>
            </article>

            <article className="sh-step">
              <span className="sh-step-number">02</span>
              <h3>Compare quotes</h3>
              <p>
                Request and compare quotations from installers that serve your
                location, then choose the option that suits you.
              </p>
            </article>

            <article className="sh-step">
              <span className="sh-step-number">03</span>
              <h3>Track your project</h3>
              <p>
                Follow your estimate, selected installer, and project
                milestones from one customer dashboard.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer className="sh-footer">
        <div className="sh-footer-inner">
          <p>© 2026 SolarHues. All rights reserved.</p>

          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/refunds">Refunds</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
