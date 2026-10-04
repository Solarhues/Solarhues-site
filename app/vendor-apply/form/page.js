'use client';

import { useState } from 'react';
import Link from 'next/link';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '7px',
  padding: '13px 14px',
  border: '1px solid #475569',
  borderRadius: '10px',
  outline: 'none',
  background: '#1e293b',
  color: '#f8fafc',
  font: 'inherit',
};

const labelStyle = {
  display: 'block',
  color: '#e2e8f0',
  fontSize: '0.88rem',
  fontWeight: 700,
};

const pageStyle = {
  minHeight: '100vh',
  padding: '24px',
  color: '#f8fafc',
  background:
    'radial-gradient(circle at top right, rgba(5, 150, 105, 0.22), transparent 36%), #1e293b',
  fontFamily: 'Inter, Arial, sans-serif',
};

export default function VendorApplicationPage() {
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    yearsInBusiness: '',
    serviceRadiusKm: '50',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Database saving will be added after this form flow is confirmed.
    setSubmitted(true);
  }

  return (
    <main style={pageStyle}>
      <div
        style={{
          width: 'min(760px, 100%)',
          margin: '0 auto',
        }}
      >
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '34px',
          }}
        >
          <Link
            href="/"
            style={{
              color: '#facc15',
              fontFamily: '"Space Grotesk", Arial, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            SolarHues
          </Link>

          <Link
            href="/vendor-apply"
            style={{
              color: '#cbd5e1',
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            ← Installer information
          </Link>
        </nav>

        <section
          style={{
            padding: 'clamp(22px, 5vw, 40px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '24px',
            background: 'rgba(15, 23, 42, 0.88)',
            boxShadow: '0 24px 70px rgba(2, 6, 23, 0.35)',
          }}
        >
          {submitted ? (
            <div>
              <p
                style={{
                  margin: '0 0 10px',
                  color: '#facc15',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Application received
              </p>

              <h1
                style={{
                  margin: 0,
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                }}
              >
                Thanks for your interest.
              </h1>

              <p
                style={{
                  margin: '16px 0 26px',
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                }}
              >
                Your installer application has been recorded as a draft. The
                next step will be document verification and SolarHues approval
                before you can receive customer leads.
              </p>

              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '13px 18px',
                  borderRadius: '999px',
                  background: '#facc15',
                  color: '#422006',
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                Return to SolarHues
              </Link>
            </div>
          ) : (
            <>
              <p
                style={{
                  margin: '0 0 10px',
                  color: '#facc15',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Installer application
              </p>

              <h1
                style={{
                  margin: 0,
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  lineHeight: 1.08,
                }}
              >
                Tell us about your solar installation business.
              </h1>

              <p
                style={{
                  margin: '15px 0 28px',
                  color: '#cbd5e1',
                  lineHeight: 1.65,
                }}
              >
                Submit your basic business details. Applications are reviewed
                before an installer can receive marketplace leads.
              </p>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '18px',
                }}
              >
                <label style={labelStyle}>
                  Company name
                  <input
                    style={inputStyle}
                    name="companyName"
                    value={form.companyName}
                    onChange={updateField}
                    placeholder="Example Solar Private Limited"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Contact person
                  <input
                    style={inputStyle}
                    name="contactName"
                    value={form.contactName}
                    onChange={updateField}
                    placeholder="Full name"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Business email
                  <input
                    style={inputStyle}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@company.com"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Mobile number
                  <input
                    style={inputStyle}
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="10-digit mobile number"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  City
                  <input
                    style={inputStyle}
                    name="city"
                    value={form.city}
                    onChange={updateField}
                    placeholder="Example: Bengaluru"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  State
                  <input
                    style={inputStyle}
                    name="state"
                    value={form.state}
                    onChange={updateField}
                    placeholder="Example: Karnataka"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Primary service pincode
                  <input
                    style={inputStyle}
                    inputMode="numeric"
                    name="pincode"
                    value={form.pincode}
                    onChange={updateField}
                    placeholder="6-digit pincode"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Years in business
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    name="yearsInBusiness"
                    value={form.yearsInBusiness}
                    onChange={updateField}
                    placeholder="Example: 5"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Service radius in km
                  <input
                    style={inputStyle}
                    type="number"
                    min="1"
                    name="serviceRadiusKm"
                    value={form.serviceRadiusKm}
                    onChange={updateField}
                    required
                  />
                </label>

                <label
                  style={{
                    ...labelStyle,
                    gridColumn: '1 / -1',
                  }}
                >
                  Briefly describe your installation experience
                  <textarea
                    style={{
                      ...inputStyle,
                      minHeight: '120px',
                      resize: 'vertical',
                    }}
                    name="message"
                    value={form.message}
                    onChange={updateField}
                    placeholder="System sizes, cities served, brands installed, certifications, past project experience, etc."
                  />
                </label>

                <div
                  style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '4px',
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      border: 0,
                      borderRadius: '999px',
                      padding: '14px 20px',
                      background: '#facc15',
                      color: '#422006',
                      font: 'inherit',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Submit application
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
