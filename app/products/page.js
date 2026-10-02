'use client';

import { useState } from 'react';
import Link from 'next/link';

const TAG = 'solarhues-21';

const CATEGORIES = [
  { id: 'All', label: 'All products' },
  { id: 'Lanterns', label: 'Solar lanterns' },
  { id: 'Garden', label: 'Solar garden lights' },
  { id: 'Festive', label: 'Festive and decor lights' },
];

const PRODUCTS = [
  { asin: 'B07HMLQNJ3', title: "Bright Emergency Solar Lantern with Mobile Charging", category: 'Lanterns', desc: "Portable lantern with adjustable brightness and mobile charging, handy during power cuts." },
  { asin: 'B088LS586M', title: "XERGY Waterproof Solar Landscape Lights", category: 'Garden', desc: "Waterproof solar landscape lights for driveways, lawns and walkways." },
  { asin: 'B088LS586M', title: "Joomer Waterproof Solar Landscape Lighting", category: 'Garden', desc: "Waterproof solar landscape lighting for gardens, lawns and driveways." },
  { asin: 'B00BJELHS0', title: "d.light S30 Rechargeable Solar Lantern", category: 'Lanterns', desc: "Rechargeable solar lantern for balconies, camping and outages." },
  { asin: 'B0DBLSZZCD', title: "Gesto Outdoor LED String Lights", category: 'Festive', desc: "Outdoor LED string lights for balconies and home decoration." },
  { asin: 'B0FM46QW42', title: "fizzytech Bubble Ball String Lights", category: 'Festive', desc: "Decorative bubble ball string lights for festive and party setups." },
  { asin: 'B0HCW49JQM', title: "Solar Outdoor Waterproof Decoration Light", category: 'Garden', desc: "Waterproof solar light for outdoor and garden decoration." },
  { asin: 'B0GKNYSYMK', title: "BITPOTT Solar Pathway Landscape Lights", category: 'Garden', desc: "Solar pathway lights for gardens and outdoor landscaping." },
  { asin: 'B0H11S83RT', title: "Solpex Solar Pathway Lights – Pack of 12", category: 'Garden', desc: "Waterproof outdoor solar pathway lights with auto on/off LED lighting for yards, lawns, patios and walkways." },
  { asin: 'B09DDGYBWQ', title: "One94Store LED Serial String Lights", category: 'Festive', desc: "Serial LED string lights for Diwali and everyday decoration." },
  { asin: 'B0H8NTGCS8', title: "One94Store Pixel String Light Pack", category: 'Festive', desc: "Pack of pixel string lights for festive home decoration." },
  { asin: 'B0FKT3NB5W', title: "One94Store Curtain Decorative String Lights", category: 'Festive', desc: "Curtain-style string lights for windows, walls and festivals." },
  { asin: 'B0HBPZK81B', title: "Desidiya 80 Diya Curtain Lights", category: 'Festive', desc: "Diya-style curtain lights for Diwali decoration." },
  { asin: 'B0DJYKBJXF', title: "One94Store Rope Light, Warm White", category: 'Festive', desc: "Warm white rope light for balconies, railings and festive decor." },
  { asin: 'B0CGNM6P1N', title: "Desidiya Festival and Party Decoration Lights", category: 'Festive', desc: "Decorative lights for festivals, birthdays and restaurants." },
  { asin: 'B08HPDWMDV', title: "Lexton Curtain Flashing Lights, Golden", category: 'Festive', desc: "Golden flashing curtain lights for festival decoration." },
  { asin: 'B0B5RJDWMT', title: "Philips Starlit Decoration Lights", category: 'Festive', desc: "Philips decorative lights for festivals and Christmas." },
  { asin: 'B09HQZ7G85', title: "Philips Flexishine Flexible Decoration Lights", category: 'Festive', desc: "Flexible Philips decoration lights for festivals and events." }
];

const productLink = (asin) => `https://www.amazon.in/dp/${asin}?tag=${TAG}`;

export default function ProductsPage() {
  const [category, setCategory] = useState('All');
  const products = category === 'All'
    ? PRODUCTS
    : PRODUCTS.filter((product) => product.category === category);

  const categoryLabel = (id) => CATEGORIES.find((item) => item.id === id)?.label || id;

  return (
    <>
      <header className="top">
        <Link href="/" className="brand">
          <span className="hue-dots"><span></span><span></span><span></span></span>
          SolarHues
        </Link>
        <nav style={{ display: 'flex', gap: '10px' }} aria-label="Main navigation">
          <Link href="/calculator" className="pill-status">Calculator</Link>
          <Link href="/login" className="pill-status">Customer login →</Link>
        </nav>
      </header>

      <main className="products-page">
        <section className="products-heading">
          <p className="kicker">SolarHues products</p>
          <h1>Solar lights and home essentials</h1>
          <p className="sub">
            A selection of solar lanterns, garden lights and festive lighting available on Amazon India.
          </p>
        </section>

        <p className="disclosure\>
          <strong>Affiliate disclosure:</strong> Links on this page go to Amazon.in. As an Amazon Associate,
          SolarHues may earn a commission from qualifying purchases at no extra cost to you. Prices and
          availability are shown on Amazon.
        </p>

       <div
  className="filters"
  role="tablist"
  aria-label="Product categories"
>
  {CATEGORIES.map((item) => {
    const count =
      item.id === 'All'
        ? PRODUCTS.length
        : PRODUCTS.filter(
            (product) => product.category === item.id
          ).length;

    return (
      <button
        key={item.id}
        type="button"
        role="tab"
        aria-selected={category === item.id}
        className={category === item.id ? 'active' : ''}
        onClick={() => setCategory(item.id)}
      >
        {item.label} <span>{count}</span>
      </button>
    );
  })}
</div>

        <section className="product-grid" aria-label="Products">
          {products.map((product) => (
            <article className="product-card" key={product.asin}>
              <span className="category">{categoryLabel(product.category)}</span>
              <h2>{product.title}</h2>
              <p>{product.desc}</p>
              <a
                className="amazon-button"
                href={productLink(product.asin)}
                target="_blank"
                rel="sponsored noopener noreferrer"
              >
                View on Amazon ↗
              </a>
            </article>
          ))}
        </section>
      </main>

      <footer className="bottom">
        <span>© 2026 SolarHues. All rights reserved.</span>
        <span className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refunds</Link>
        </span>
      </footer>

      <style jsx>{`        .products-page { width: 100%; max-width: 1100px; margin: 0 auto; padding: 24px 20px 64px; }
        .products-heading { max-width: 720px; margin: 0 auto 24px; text-align: center; }
        .products-heading h1 { font-size: clamp(1.9rem, 5vw, 2.8rem); }
        .products-heading .sub { margin: 12px auto 0; }
        .disclosure { max-width: 760px; margin: 0 auto 24px; padding: 12px 16px; border: 1px solid rgba(250,204,21,.3); border-radius: 12px; background: rgba(250,204,21,.08); color: #fde68a; font-size: 13px; line-height: 1.6; }
        .disclosure strong { color: #facc15; }
        .filters { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 28px; }
        .filters button { padding: 8px 16px; border: 1px solid rgba(255,255,255,.18); border-radius: 999px; background: transparent; color: #cbd5e1; font-size: 13px; cursor: pointer; }
        .filters button span { margin-left: 4px; color: #94a3b8; }
        .filters button.active { border-color: #facc15; background: rgba(250,204,21,.08); color: #facc15; }
        .product-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .product-card { display: flex; flex-direction: column; padding: 22px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: rgba(255,255,255,.03); transition: border-color .2s ease, transform .2s ease; }
        .product-card:hover { border-color: rgba(5,150,105,.7); transform: translateY(-3px); }
        .category { align-self: flex-start; margin-bottom: 12px; padding: 3px 10px; border-radius: 999px; background: rgba(5,150,105,.18); color: #6ee7b7; font-size: 11px; font-weight: 600; }
        .product-card h2 { margin: 0 0 8px; font-size: 1.05rem; line-height: 1.3; }
        .product-card p { flex: 1; margin: 0 0 18px; color: #94a3b8; font-size: 13.5px; line-height: 1.55; }
        .amazon-button { align-self: flex-start; padding: 10px 16px; border-radius: 10px; background: #facc15; color: #1e293b; font-size: 13.5px; font-weight: 700; }
        .amazon-button:hover { background: #fde047; }
        @media (max-width: 900px) { .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 600px) { .product-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
