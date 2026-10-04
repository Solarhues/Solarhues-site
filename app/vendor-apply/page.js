'use client';

import Link from 'next/link';

export default function VendorApplyPage() {
  return (
    <main className="vendor-apply-page">
      <nav className="vendor-apply-nav">
        <Link href="/" className="vendor-apply-brand">
          SolarHues
        </Link>

        <Link href="/vendor-login" className="vendor-apply-login">
          Installer sign in
        </Link>
      </nav>

      <section className="vendor-apply-hero">
        <div className="vendor-apply-copy">
          <p className="vendor-apply-eyebrow">For solar installers</p>

          <h1>Grow your rooftop-solar business with qualified local leads.</h1>

          <p>
            Apply to join SolarHues as a verified installer. Manage quote
            requests, send transparent proposals, and update customers as
            installation work progresses.
          </p>

          <Link href="/vendor-login" className="vendor-apply-primary">
            Start installer application
          </Link>
        </div>

        <aside className="vendor-apply-panel">
          <p className="vendor-apply-panel-label">What you can expect</p>

          <ul>
            <li>Local leads based on your verified service area</li>
            <li>Structured quote requests with roof and bill details</li>
            <li>Private document verification</li>
            <li>Clear customer project-tracking workflow</li>
          </ul>

          <p className="vendor-apply-note">
            Approval is required before an installer can receive leads.
          </p>
        </aside>
      </section>

      <section className="vendor-apply-steps">
        <article>
          <span>01</span>
          <h2>Apply</h2>
          <p>Share your business profile, service areas, and credentials.</p>
        </article>

        <article>
          <span>02</span>
          <h2>Verify</h2>
          <p>SolarHues reviews your application and supporting documents.</p>
        </article>

        <article>
          <span>03</span>
          <h2>Quote and deliver</h2>
          <p>Respond to matched requests and keep customers informed.</p>
        </article>
      </section>
    </main>
  );
}
