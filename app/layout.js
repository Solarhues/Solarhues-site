import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'SolarHues — Marketplace',
  description:
    "India's solar escrow marketplace. Size your rooftop system and compare verified installers.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
