import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'SolarHues — Marketplace',
  description: "India's solar escrow marketplace. Size your rooftop system and compare verified installers.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="wrap">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
