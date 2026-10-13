import Link from 'next/link';

export default function Logo({ height = 40 }) {
  return (
    <Link
      href="/"
      aria-label="SolarHues home"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '12px',
        background: '#f8f9f1',
        textDecoration: 'none',
      }}
    >
      <img
        src="/solarhues-logo.png"
        alt="SolarHues"
        style={{
          display: 'block',
          height: height + 'px',
          width: 'auto',
        }}
      />
    </Link>
  );
}
