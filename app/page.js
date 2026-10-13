'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from '../components/Logo';

export default function HomePage() {
  const router = useRouter();
  const [pincode, setPincode] = useState('');
  const [message, setMessage] = useState('');

  function handlePincodeChange(event) {
    const numbersOnly = event.target.value.replaceAll(' ', '').replaceAll('-', '');

    let cleanedValue = '';

    for (let index = 0; index < numbersOnly.length; index += 1) {
      const character = numbersOnly[index];

      if (character >= '0' && character <= '9') {
        cleanedValue += character;
      }
    }

    setPincode(cleanedValue.slice(0, 6));
    setMessage('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    const numberValue = Number(pincode);

    if (
      pincode.length !== 6 ||
      Number.isNaN(numberValue) ||
      numberValue < 100000 ||
      numberValue > 999999
    ) {
      setMessage('Please enter a valid 6-digit Indian pincode.');
      return;
    }

    router.push('/calculator?pin=' + pincode);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        background: '#1e293b',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <header
        style={{
          width: '100%',
          borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
          background: '#1e293b',
        }}
      >
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            width: 'calc(100% - 32px)',
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '16px 0',
          }}
        >
          <Link
            href="/"
            style={{
              color: '#facc15',
              fontSize: '1.2rem',
              fontWeight: 800,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            SolarHues
          </Link>

          <div
            style={{
              display: 'flex',
              flex: '1 1 380px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <Link
              href="/calculator"
              style={{
                padding: '9px 13px',
                border: '1px solid #64748b',
                borderRadius: '999px',
                color: '#f8fafc',
                fontSize: '0.88rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Calculator
            </Link>

            <Link
              href="/products"
              style={{
                padding: '9px 13px',
                border: '1px solid #64748b',
                borderRadius: '999px',
                color: '#f8fafc',
                fontSize: '0.88rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Products
            </Link>

            <Link
              href="/vendor-apply"
              style={{
                padding: '9px 13px',
                border: '1px solid #64748b',
                borderRadius: '999px',
                color: '#f8fafc',
                fontSize: '0.88rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              For installers
            </Link>
          </div>

          <Link
            href="/login"
            style={{
              padding: '9px 13px',
              border: '1px solid #facc15',
              borderRadius: '999px',
              color: '#facc15',
              fontSize: '0.88rem',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Customer login →
          </Link>
        </nav>
      </header>

      <section
        style={{
          padding: '96px 16px 110px',
          textAlign: 'center',
          background:
            'radial-gradient(circle at top right, rgba(5, 150, 105, 0.24), transparent 36%), #1e293b',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '820px',
            margin: '0 auto',
          }}
        >
          <p
            style={{
              margin: '0 0 16px',
              color: '#6ee7b7',
              fontSize: '0.84rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            India&apos;s rooftop solar marketplace
          </p>

          <h1
            style={{
              margin: 0,
              color: '#f8fafc',
              fontSize: 'clamp(2.8rem, 8vw, 6rem)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              lineHeight: 1,
            }}
          >
            Find the right{' '}
            <span
              style={{
                color: '#facc15',
              }}
            >
              shade of solar
            </span>{' '}
            for your roof.
          </h1>

          <p
            style={{
              maxWidth: '680px',
              margin: '26px auto 34px',
              color: '#cbd5e1',
              fontSize: 'clamp(1.04rem, 2.5vw, 1.3rem)',
              lineHeight: 1.65,
            }}
          >
            Estimate rooftop-solar system size, likely costs, and savings. Then
            compare quotes from installers serving your area.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              width: '100%',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="Enter your 6-digit pincode"
              value={pincode}
              onChange={handlePincodeChange}
              maxLength="6"
              style={{
                flex: '1 1 300px',
                minWidth: 0,
                minHeight: '60px',
                padding: '0 18px',
                border: '1px solid #64748b',
                borderRadius: '14px',
                outline: 'none',
                background: '#334155',
                color: '#f8fafc',
                fontSize: '1rem',
              }}
            />

            <button
              type="submit"
              style={{
                flex: '1 1 190px',
                minHeight: '60px',
                padding: '0 22px',
                border: 0,
                borderRadius: '14px',
                background: '#facc15',
                color: '#422006',
                fontSize: '1rem',
                fontWeight: 800,
              }}
            >
              Analyze roof →
            </button>
          </form>

          {message ? (
            <p
              style={{
                margin: '12px 0 0',
                color: '#fecaca',
              }}
            >
              {message}
            </p>
          ) : null}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px 24px',
              marginTop: '32px',
              color: '#cbd5e1',
              fontWeight: 700,
            }}
          >
            <span>● Compare installer quotes</span>
            <span>● Clear project milestones</span>
            <span>● Subsidy-aware sizing</span>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '82px 16px',
          background: '#1e293b',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1040px',
            margin: '0 auto',
          }}
        >
          <p
            style={{
              margin: '0 0 14px',
              color: '#6ee7b7',
              fontSize: '0.84rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Simple process
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 800,
            }}
          >
            How it works
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
              marginTop: '38px',
              textAlign: 'left',
            }}
          >
            <article
              style={{
                padding: '26px',
                border: '1px solid #475569',
                borderRadius: '18px',
                background: '#273449',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#10b981',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                }}
              >
                01
              </p>
              <h3 style={{ margin: '16px 0 10px', fontSize: '1.35rem' }}>
                Size your system
              </h3>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.65 }}>
                Enter your pincode, roof area, and electricity bill to view an
                indicative system size, cost, and payback estimate.
              </p>
            </article>

            <article
              style={{
                padding: '26px',
                border: '1px solid #475569',
                borderRadius: '18px',
                background: '#273449',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#10b981',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                }}
              >
                02
              </p>
              <h3 style={{ margin: '16px 0 10px', fontSize: '1.35rem' }}>
                Compare quotes
              </h3>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.65 }}>
                Request and compare quotations from installers that serve your
                location, then choose the option that suits you.
              </p>
            </article>

            <article
              style={{
                padding: '26px',
                border: '1px solid #475569',
                borderRadius: '18px',
                background: '#273449',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#10b981',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                }}
              >
                03
              </p>
              <h3 style={{ margin: '16px 0 10px', fontSize: '1.35rem' }}>
                Track your project
              </h3>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.65 }}>
                Follow your estimate, selected installer, and project
                milestones from one customer dashboard.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: '26px 16px',
          borderTop: '1px solid #334155',
          background: '#172033',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '16px',
            width: '100%',
            maxWidth: '1180px',
            margin: '0 auto',
            color: '#94a3b8',
          }}
        >
          <span>© 2026 SolarHues. All rights reserved.</span>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <Link href="/privacy" style={{ color: '#cbd5e1' }}>
              Privacy
            </Link>
            <Link href="/terms" style={{ color: '#cbd5e1' }}>
              Terms
            </Link>
            <Link href="/refunds" style={{ color: '#cbd5e1' }}>
              Refunds
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
