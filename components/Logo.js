import Link from 'next/link';

export default function Logo({ size = 38 }) {
  return (
    <Link
      href="/"
      aria-label="SolarHues home"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        color: '#f8fafc',
        fontSize: '1.15rem',
        fontWeight: 800,
        textDecoration: 'none',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="250 200 300 305"
        width={size}
        height={size}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sh-sun" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <linearGradient id="sh-leaf" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>

        <g transform="translate(0, -30)">
          <path d="M385 240 L415 240 L408 340 L392 340 Z" fill="url(#sh-sun)" />
          <path d="M301 275 L322 254 L386 326 L375 337 Z" fill="url(#sh-sun)" />
          <path d="M499 275 L478 254 L414 326 L425 337 Z" fill="url(#sh-sun)" />
          <path d="M260 365 L260 395 L360 388 L360 372 Z" fill="url(#sh-sun)" />
          <path d="M540 365 L540 395 L440 388 L440 372 Z" fill="url(#sh-sun)" />

          <path
            d="M412 320 L370 385 L405 385 L388 440 L430 375 L395 375 Z"
            fill="#ffffff"
            opacity="0.92"
          />

          <g transform="translate(0, 5)">
            <path d="M400 380 C320 390 280 470 400 520 Z" fill="url(#sh-leaf)" />
            <path
              d="M400 380 C480 390 520 470 400 520 Z"
              fill="url(#sh-leaf)"
              opacity="0.9"
            />
            <path
              d="M400 380 C360 410 360 490 400 520 C440 490 440 410 400 380 Z"
              fill="#1e293b"
              opacity="0.35"
            />
          </g>
        </g>
      </svg>

      <span>SolarHues</span>
    </Link>
  );
}
