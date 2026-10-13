'use client';

import Link from 'next/link';
import Logo from '../../components/Logo';

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
    color: '#f8fafc',
    background:
      'radial-gradient(circle at top left, rgba(250, 204, 21, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(5, 150, 105, 0.2), transparent 42%), #1e293b',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    width: 'min(1120px, calc(100% - 32px))',
    minWidth: 0,
    margin: '0 auto',
  },
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    padding: '22px 0 38px',
  },
  brand: {
    color: '#facc15',
    fontSize: '1.2rem',
    fontWeight: 800,
    textDecoration: 'none',
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '42px',
    padding: '9px 15px',
    border: '1px solid rgba(250, 204, 21, 0.7)',
    borderRadius: '999px',
    color: '#facc15',
    fontSize: '0.9rem',
    fontWeight: 700,
    textAlign: 'center',
    textDecoration: 'none',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    alignItems: 'start',
    gap: '28px',
    padding: '26px 0 56px',
  },
  heroCopy: {
    minWidth: 0,
    padding: '20px 0',
  },
  eyebrow: {
    margin: '0 0 12px',
    color: '#facc15',
    fontSize: '0.78rem',
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: '700px',
    margin: 0,
    color: '#f8fafc',
    fontSize: 'clamp(2.6rem, 6vw, 4.8rem)',
    fontWeight: 800,
    letterSpacing: '-0.05em',
    lineHeight: 1.03,
    overflowWrap: 'break-word',
  },
  description: {
    maxWidth: '650px',
    margin: '22px 0 30px',
    color: '#cbd5e1',
    fontSize: '1.08rem',
    lineHeight: 1.7,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '52px',
    padding: '13px 20px',
    borderRadius: '999px',
    background: '#facc15',
    color: '#422006',
    fontWeight: 800,
    textAlign: 'center',
    textDecoration: 'none',
  },
  panel: {
    minWidth: 0,
    padding: '28px',
    border: '1px solid rgba(148, 163, 184, 0.22)',
    borderRadius: '24px',
    background: 'rgba(15, 23, 42, 0.88)',
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
    gap: '16px',
    margin: '24px 0',
    paddingLeft: '22px',
    color: '#e2e8f0',
    lineHeight: 1.55,
  },
  note: {
    margin: 0,
    paddingTop: '18px',
    borderTop: '1px solid rgba(148, 163, 184, 0.18)',
    color: '#94a3b8',
    fontSize: '0.9rem',
    lineHeight: 1.55,
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
    paddingBottom: '54px',
  },
  step: {
    minWidth: 0,
    padding: '26px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '18px',
    background: 'rgba(15, 23, 42, 0.72)',
  },
  stepNumber: {
    color: '#facc15',
    fontSize: '1.55rem',
    fontWeight: 800,
  },
  stepTitle: {
    margin: '15px 0 10px',
    color: '#f8fafc',
    fontSize: '1.35rem',
    fontWeight: 800,
  },
  stepText: {
    margin: 0,
    color: '#cbd5e1',
    lineHeight: 1.65,
  },
};

export default function VendorApplyPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <Logo />

          <Link href="/vendor-apply/form" style={styles.navLink}>
            Apply as installer
          </Link>
        </nav>

        <section style={styles.hero}>
          <div style={styles.heroCopy}>
            <p style={styles.eyebrow}>For solar installers</p>

            <h1 style={styles.title}>
              Grow your rooftop-solar business with qualified local leads.
            </h1>

            <p style={styles.description}>
              Apply to join SolarHues as a verified installer. Manage quote
              requests, send transparent proposals, and keep customers informed
              as installation work progresses.
            </p>

            <Link href="/vendor-apply/form" style={styles.button}>
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
            <span style={styles.stepNumber}>01</span>
            <h2 style={styles.stepTitle}>Apply</h2>
            <p style={styles.stepText}>
              Share your business profile, service areas, and credentials.
            </p>
          </article>

          <article style={styles.step}>
            <span style={styles.stepNumber}>02</span>
            <h2 style={styles.stepTitle}>Verify</h2>
            <p style={styles.stepText}>
              SolarHues reviews your application and supporting documents.
            </p>
          </article>

          <article style={styles.step}>
            <span style={styles.stepNumber}>03</span>
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
