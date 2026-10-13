import './globals.css';
import { Providers } from './providers';
import Logo from '../components/Logo';

export const metadata = {
  title: 'SolarHues — Marketplace',
  description:
    "India's rooftop solar marketplace. Size your rooftop system and compare installers.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            padding: '10px 16px',
            background: '#0f172a',
            borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
          }}
        >
          <Logo />
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
