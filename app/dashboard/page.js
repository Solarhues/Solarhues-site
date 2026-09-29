'use client';
import React from 'react';
import { useAuth } from '../layout';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_heg2iW28ly1fTI5BRJ_0Cg_9lURldPF';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function CustomerDashboard() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await sb.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="center">
        <p style={{ fontFamily: "'Inter', sans-serif", color: '#CBD5E1' }}>Securing credential pathways...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="top">
          <a href="/" className="brand">
            <span className="hue-dots">
              <span></span><span></span><span></span>
            </span>
            SolarHues
          </a>
        </div>
        <div className="center">
          <div className="kicker" style={{ color: '#FCA5A5' }}>Access Restriction</div>
          <h1 style={{ marginBottom: '16px' }}>Secure Portal Wall</h1>
          <p className="sub" style={{ marginBottom: '24px' }}>You must be authenticated via a passwordless Magic Link to enter your private metrics hub.</p>
          <a href="/login" className="pill-status" style={{ background: 'var(--sun)', color: '#1e293b', fontWeight: '700' }}>
            Go to Login Portal
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="top">
        <a href="/" className="brand">
          <span className="hue-dots">
            <span></span><span></span><span></span>
          </span>
          SolarHues
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/calculator" className="pill-status">Calculator</a>
          <a href="/products" className="pill-status">Products</a>
          <button 
            onClick={handleLogout} 
            className="pill-status" 
            style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444', color: '#FCA5A5', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="center" style={{ display: 'block', maxWidth: '800px', margin: '0 auto', padding: '40px 24px', textAlign: 'left' }}>
        <div className="kicker">Verified Account Hub</div>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
          Welcome back, <span className="hue">{user.email.split('@')[0]}</span>
        </h1>
        <p className="sub" style={{ marginTop: '0', marginBottom: '40px' }}>
          Account Reference ID: <span style={{ color: '#94A3B8', fontFamily: 'monospace' }}>{user.id.substring(0, 8)}...</span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Authentication Method</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', fontFamily: 'Space Grotesk' }}>Passwordless OTP</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Quote Request</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--sun)', fontFamily: 'Space Grotesk' }}>1 Pipeline Live</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Status</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--emerald)', fontFamily: 'Space Grotesk' }}>KYC Approved</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '28px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', color: '#fff' }}>Your Solar Pipeline</h3>
          <p style={{ fontSize: '14px', color: '#CBD5E1', margin: '0 0 24px 0' }}>Track the bids and vetting progress of localized EPC engineers assigned to your profile matching your solar requirement metrics.</p>

          <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '20px', borderLeft: '4px solid var(--sun)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>5 kW Residential Rooftop Grid Matrix</span>
              <span style={{ fontSize: '12px', background: 'rgba(250, 204, 21, 0.1)', color: 'var(--sun)', border: '1px solid var(--sun)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                Matching Installers
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
              <div>Assigned Target Area: <strong style={{ color: '#fff' }}>Zone Checked</strong></div>
              <div>Est. Payback Window: <strong style={{ color: 'var(--emerald)' }}>4.2 Years</strong></div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0', fontStyle: 'italic' }}>
              *System Notice: 3 verified EPC vendors within your regional territory are currently analyzing your roof geometry. Quotes will compile automatically in this layout.
            </p>
          </div>
        </div>
      </div>

      <div className="bottom" style={{ marginTop: 'auto' }}>
        <div>© 2026 SolarHues. All rights reserved.</div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </>
  );
}
