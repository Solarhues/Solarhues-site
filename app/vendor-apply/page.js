'use client';

import Link from 'next/link';

const styles = {
  page: {
    minHeight: '100vh',
    padding: '24px',
    color: '#f8fafc',
    background:
      'radial-gradient(circle at top left, rgba(250, 204, 21, 0.14), transparent 34%), radial-gradient(circle at bottom right, rgba(5, 150, 105, 0.22), transparent 38%), #1e293b',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  container: {
    width: 'min(1120px, 100%)',
    margin: '0 auto',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    paddingBottom: '42px',
  },
  brand: {
    color: '#facc15',
    fontFamily: '"Space Grotesk", Arial, sans-serif',
    fontSize: '1.2rem',
    fontWeight: 800,
    textDecoration: 'none',
  },
  loginLink: {
    padding: '10px 15px',
    border: '1px solid rgba(250, 204, 21, 0.65)',
    borderRadius: '999px',
    color: '#facc15',
    fontSize: '0.9rem',
    fontWeight: 700,
    textDecoration: 'none',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)',
    gap: '28px',
    alignItems: 'stretch',
    padding: '28px 0 52px',
  },
  eyebrow: {
    margin: '0 0 12px',
    color: '#facc15',
    fontSize: '0.76rem',
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: '720px',
    margin: 0,
    fontFamily: '"Space Grotesk", Arial, sans-serif',
    fontSize: 'clamp(2.3rem, 6vw, 4.5rem)',
    lineHeight: 1.03,
  },
  description: {
    maxWidth: '650px',
    margin: '22px 0 30px',
    color: '#cbd5e1',
    fontSize: '1.08rem',
    lineHeight: 1.7,
  },
  primaryLink: {
    display: 'inline-block',
    padding: '14px 20px',
    borderRadius: '999px',
    background: '#facc15',
    color: '#422006',
    fontWeight: 800,
    textDecoration: 'none',
  },
  panel: {
    padding: '28px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '24px',
    background: 'rgba(15, 23, 42, 0.82)',
    boxShadow: '0 20px 55px rgba(2, 6, 23, 0.25)',
  },
  panelLabel: {
    margin: 0,
    color: '#facc15',
    fontSize: '0.78rem',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  list: {
    display: 'grid',
    gap: '15px',
    margin: '22px 0',
    paddingLeft: '20px',
    color: '#e2e8f0',
    lineHeight: 1.5,
  },
  note: {
    margin: 0,
    paddingTop: '18px',
    borderTop: '1px solid rgba(148, 163, 184, 0.18)',
    color: '#94a3b8',
    fontSize: '0.88rem',
    lineHeight: 1.5,
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '18px',
    paddingBottom: '48px',
  },
  step: {
    padding: '24px',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    borderRadius: '18px',
    background: 'rgba(15, 23, 42, 0.65)',
  },
  number: {
    color: '#facc15',
    fontFamily: '"Space Grotesk", Arial, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 800,
  },
  stepTitle: {
    margin: '14px 0 9px',
    fontFamily: '"Space Grotesk", Arial, sans-serif',
    fontSize: '1.3rem',
  },
  stepText: {
    margin: 0,
    color: '#cbd5e1',
    lineHeight: 1.6,
  },
};

export default function VendorApplyPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <Link href="/" style={styles.brand}>
            SolarHues
          </Link>

          <Link href="/vendor-login" style={styles.loginLink}>
            Installer sign in
          </Link>
        </nav>

        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>For solar installers</p>

            <h1 style={styles.title}>
              Grow your rooftop-solar business with qualified local leads.
            </h1>

            <p style={styles.description}>
              Apply to join SolarHues as a verified installer. Manage quote
              requests, send transparent proposals, and update customers as
              installation work progresses.
            </p>

            <Link href="/vendor-login" style={styles.primaryLink}>
              Start installer application
            </Link>
          </div>

          <aside style={styles.panel}>
            <p style={styles.panelLabel}>What you can expect</p>

            <ul style={styles.list}>
              <li>Local leads based on your verified service area</li>
              <li>Structured quote requests with roof and bill details</li>
              <li>Private document verification</li>
              <li>Clear customer project-tracking workflow</li>
            </ul>

            <p style={styles.note}>
              Approval is required before an installer can receive leads.
            </p>
          </aside>
        </section>

        <section style={styles.steps}>
          <article style={styles.step}>
            <span style={styles.number}>01</span>
            <h2 style={styles.stepTitle}>Apply</h2>
            <p style={styles.stepText}>
              Share your business profile, service areas, and credentials.
            </p>
          </article>

          <article style={styles.step}>
            <span style={styles.number}>02</span>
            <h2 style={styles.stepTitle}>Verify</h2>
            <p style={styles.stepText}>
              SolarHues reviews your application and supporting documents.
            </p>
          </article>

          <article style={styles.step}>
            <span style={styles.number}>03</span>
            <h2 style={styles.stepTitle}>Quote and deliver</h2>
            <p style={styles.stepText}>
              Respond to matched requests and keep customers informed.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
