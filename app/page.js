'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
    background: '#1e293b',
    color: '#f8fafc',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    width: '100%',
    borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
    background: 'rgba(30, 41, 59, 0.98)',
  },
  nav: {
    width: 'min(1180px, calc(100% - 32px))',
    minWidth: 0,
    margin: '0 auto',
    padding: '16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#facc15',
    fontSize: '1.2rem',
    fontWeight: 800,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  dots: {
    display: 'inline-flex',
    gap: '4px',
  },
  yellowDot: {
    width: '11px',
    height: '11px',
    borderRadius: '50%',
    background: '#facc15',
  },
  limeDot: {
    width: '11px',
    height: '11px',
    borderRadius: '50%',
    background: '#84cc16',
  },
  greenDot: {
    width: '11px',
    height: '11px',
    borderRadius: '50%',
    background: '#059669',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    marginLeft: 'auto',
    overflowX: 'auto',
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40px',
    padding: '8px 13px',
    border: '1px solid rgba(148, 163, 184, 0.45)',
    borderRadius: '999px',
    color: '#f8fafc',
    fontSize: '0.88rem',
    fontWeight: 700,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  login: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40px',
    padding: '8px 13px',
    border: '1px solid #facc15',
    borderRadius: '999px',
    color: '#facc15',
    fontSize: '0.88rem',
    fontWeight: 700,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  hero: {
    padding: 'clamp(72px, 10vw, 140px) 16px clamp(78px, 11vw, 150px)',
    textAlign: 'center',
    background:
      'radial-gradient(circle at 82% 8%, rgba(5, 150, 105, 0.2), transparent 27%), radial-gradient(circle at 10% 0%, rgba(250, 204, 21, 0.1), transparent 23%), #1e293b',
  },
  heroInner: {
    width: 'min(840px, 100%)',
    margin: '0 auto',
  },
  eyebrow: {
    margin: '0 0 18px',
    color: '#6ee7b7',
    fontSize: '0.82rem',
    fontWeight: 800,
    letterSpacing: '0.13em',
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: '760px',
    margin: '0 auto',
    color: '#f8fafc',
    fontSize: 'clamp(2.6rem, 8vw, 6.2rem)',
    fontWeight: 800,
    letterSpacing: '-0.055em',
    lineHeight: 0.98,
  },
  titleAccent: {
    background: 'linear-gradient(90deg, #facc15 0%, #a3e635 45%, #34d399 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  copy: {
    maxWidth: '700px',
    margin: '28px auto 34px',
    color: '#cbd5e1',
    fontSize: 'clamp(1.04rem, 2.6vw, 1.32rem)',
    lineHeight: 1.65,
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    width: 'min(680px, 100%)',
    margin: '0 auto',
  },
  input: {
    flex: '1 1 300px',
    minWidth: 0,
    minHeight: '60px',
    padding: '0 18px',
    border: '1px solid rgba(148, 163, 184, 0.62)',
    borderRadius: '14px',
    outline: 'none',
    background: 'rgba(51, 65, 85, 0.72)',
    color: '#f8fafc',
    fontSize: '1rem',
  },
  submit: {
    flex: '1 1 190px',
    minHeight: '60px',
    padding: '0 22px',
    border: 0,
    borderRadius: '14px',
    background: '#facc15',
    color: '#422006',
    fontSize: '1rem',
    fontWeight: 800,
  },
  error: {
    margin: '12px 0 0',
    color: '#fecaca',
    fontSize: '0.9rem',
  },
  benefits: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '14px 26px',
    margin: '32px 0 0',
    padding: 0,
    color: '#cbd5e1',
    fontSize: '0.96rem',
    fontWeight: 700,
    listStyle: 'none',
  },
  benefit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
  },
  dotGreen: {
    width: '11px',
    height: '11px',
    borderRadius: '50%',
    background: '#10b981',
  },
  dotYellow: {
    width: '11px',
    height: '11px',
    borderRadius: '50%',
    background: '#facc15',
  },
  dotBlue: {
    width: '11px',
    height: '11px',
    borderRadius: '50%',
    background: '#38bdf8',
  },
  how: {
    padding: 'clamp(68px, 10vw, 120px) 16px',
    background: '#1e293b',
    textAlign: 'center',
  },
  sectionInner: {
    width: 'min(1000px, 100%)',
    margin: '0 auto',
  },
  sectionTitle: {
    margin: 0,
    fontSize: 'clamp(2.2rem, 5vw, 4rem)',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
    marginTop: '40px',
    textAlign: 'left',
  },
  step: {
    minWidth: 0,
    padding: '28px',
    border: '1px solid rgba(148, 163, 184, 0.22)',
    borderRadius: '20px',
    background: 'rgba(51, 65, 85, 0.5)',
  },
  stepNumber: {
    color: '#10b981',
    fontSize: '1.45rem',
    fontWeight: 800,
  },
  stepTitle: {
    margin: '18px 0 12px',
    color: '#f8fafc',
    fontSize: '1.4rem',
    fontWeight: 800,
    lineHeight: 1.15,
  },
  stepText: {
    margin: 0,
    color: '#cbd5e1',
    fontSize: '0.98rem',
    lineHeight: 1.65,
  },
  footer: {
    borderTop: '1px solid rgba(148, 163, 184, 0.16)',
    background: '#172033',
  },
  footerInner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    width: 'min(1180px, calc(100% - 32px))',
    margin: '0 auto',
    padding: '26px 0',
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  footerLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '18px',
  },
  footerLink: {
    color: '#cbd5e1',
    textDecoration: 'none',
  },
};

export default function HomePage() {
  const router = useRouter();
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');

  function handleChange(event) {
    setPincode(event.target.value.replace(/\D/g, '').slice(0, 6));
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
