"use client";

import { useState } from "react";
import Link from "next/link";

const PRODUCTS = [
  { asin: "B07HMLQNJ3", title: "Bright Emergency Solar Lantern with Mobile Charging", category: "Lanterns", description: "Portable lantern with adjustable brightness and mobile charging, useful during power cuts." },
  { asin: "B07S83N33V", title: "XERGY Waterproof Solar Landscape Lights", category: "Garden", description: "Waterproof solar landscape lights for driveways, lawns and walkways." },
  { asin: "B088LS586M", title: "Joomer Waterproof Solar Landscape Lighting", category: "Garden", description: "Waterproof solar landscape lighting for gardens, lawns and driveways." },
  { asin: "B00BJELHS0", title: "d.light S30 Rechargeable Solar Lantern", category: "Lanterns", description: "Rechargeable solar lantern for balconies, camping and outages." },
  { asin: "B0DBLSZZCD", title: "Gesto Outdoor LED String Lights", category: "Festive", description: "Outdoor LED string lights for balconies and home decoration." },
  { asin: "B0FM46QW42", title: "fizzytech Bubble Ball String Lights", category: "Festive", description: "Decorative bubble ball string lights for festive and party setups." },
  { asin: "B0HCW49JQM", title: "Solar Outdoor Waterproof Decoration Light", category: "Garden", description: "Waterproof solar light for outdoor and garden decoration." },
  { asin: "B0GKNYSYMK", title: "BITPOTT Solar Pathway Landscape Lights", category: "Garden", description: "Solar pathway lights for gardens and outdoor landscaping." },
  { asin: "B0H11S83RT", title: "Solpex Solar Pathway Lights – Pack of 12", category: "Garden", description: "Waterproof outdoor solar pathway lights with auto on/off LED lighting for yards, lawns, patios and walkways." },
  { asin: "B09DDGYBWQ", title: "One94Store LED Serial String Lights", category: "Festive", description: "Serial LED string lights for Diwali and everyday decoration." },
  { asin: "B0H8NTGCS8", title: "One94Store Pixel String Light Pack", category: "Festive", description: "Pack of pixel string lights for festive home decoration." },
  { asin: "B0FKT3NB5W", title: "One94Store Curtain Decorative String Lights", category: "Festive", description: "Curtain-style string lights for windows, walls and festivals." },
  { asin: "B0HBPZK81B", title: "Desidiya 80 Diya Curtain Lights", category: "Festive", description: "Diya-style curtain lights for Diwali decoration." },
  { asin: "B0DJYKBJXF", title: "One94Store Rope Light, Warm White", category: "Festive", description: "Warm white rope light for balconies, railings and festive decor." },
  { asin: "B0CGNM6P1N", title: "Desidiya Festival and Party Decoration Lights", category: "Festive", description: "Decorative lights for festivals, birthdays and restaurants." },
  { asin: "B08HPDWMDV", title: "Lexton Curtain Flashing Lights, Golden", category: "Festive", description: "Golden flashing curtain lights for festival decoration." },
  { asin: "B0B5RJDWMT", title: "Philips Starlit Decoration Lights", category: "Festive", description: "Philips decorative lights for festivals and Christmas." },
  { asin: "B09HQZ7G85", title: "Philips Flexishine Flexible Decoration Lights", category: "Festive", description: "Flexible Philips decoration lights for festivals and events." }
];

const CATEGORIES = ["All", "Lanterns", "Garden", "Festive"];
const amazonUrl = (asin) => `https://www.amazon.in/dp/${asin}?tag=solarhues-21`;

export default function ProductsPage() {
  const [category, setCategory] = useState("All");
  const visibleProducts = category === "All" ? PRODUCTS : PRODUCTS.filter((item) => item.category === category);

  return (
    <main className="products-page">
      <header className="products-header">
        <Link href="/" className="brand">SolarHues</Link>
        <nav className="navigation">
          <Link href="/calculator">Calculator</Link>
          <Link href="/login">Customer login</Link>
        </nav>
      </header>

      <section className="intro">
        <p className="eyebrow">SolarHues products</p>
        <h1>Solar lights and home essentials</h1>
        <p>A selection of solar lanterns, garden lights and festive lighting available on Amazon India.</p>
      </section>

      <p className="disclosure"><strong>Affiliate disclosure:</strong> Links go to Amazon.in. As an Amazon Associate, SolarHues may earn a commission from qualifying purchases at no extra cost to you. Prices and availability are shown on Amazon.</p>

      <div className="filters" role="tablist" aria-label="Product categories">
        {CATEGORIES.map((item) => {
          const count = item === "All" ? PRODUCTS.length : PRODUCTS.filter((product) => product.category === item).length;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={category === item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item} <span>{count}</span>
            </button>
          );
        })}
      </div>

      <section className="grid" aria-label="Products">
        {visibleProducts.map((product) => (
          <article className="card" key={product.asin}>
            <span className="category">{product.category}</span>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <a className="amazon-button" href={amazonUrl(product.asin)} target="_blank" rel="sponsored noopener noreferrer">View on Amazon ↗</a>
          </article>
        ))}
      </section>

      <footer className="footer">
        <span>© 2026 SolarHues. All rights reserved.</span>
        <span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refunds">Refunds</Link></span>
      </footer>

      <style jsx>{`
        .products-page { min-height: 100vh; padding: 24px 20px 56px; background: #1e293b; color: #f8fafc; font-family: Inter, sans-serif; }
        .products-header { max-width: 1100px; margin: 0 auto 58px; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .brand { color: #fff; font: 700 1.2rem "Space Grotesk", sans-serif; text-decoration: none; }
        .navigation { display: flex; gap: 18px; }
        .navigation a, .footer a { color: #cbd5e1; text-decoration: none; }
        .navigation a:hover, .footer a:hover { color: #facc15; }
        .intro { max-width: 760px; margin: 0 auto 24px; text-align: center; }
        .eyebrow { margin: 0 0 12px; color: #6ee7b7; font-size: .78rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
        h1 { margin: 0; font: 700 clamp(2rem, 5vw, 3.2rem)/1.05 "Space Grotesk", sans-serif; letter-spacing: -.04em; }
        .intro > p:last-child { margin: 16px auto 0; max-width: 560px; color: #cbd5e1; line-height: 1.6; }
        .disclosure { max-width: 760px; margin: 0 auto 26px; padding: 13px 16px; border: 1px solid rgba(250,204,21,.3); border-radius: 12px; background: rgba(250,204,21,.08); color: #fde68a; font-size: .85rem; line-height: 1.6; }
        .disclosure strong { color: #facc15; }
        .filters { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 0 auto 28px; }
        .filters button { padding: 8px 15px; border: 1px solid rgba(255,255,255,.18); border-radius: 999px; background: transparent; color: #cbd5e1; cursor: pointer; }
        .filters button span { color: #94a3b8; }
        .filters button.active { border-color: #facc15; background: rgba(250,204,21,.1); color: #facc15; }
        .grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .card { display: flex; flex-direction: column; padding: 22px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: rgba(255,255,255,.03); }
        .card:hover { border-color: rgba(5,150,105,.7); }
        .category { align-self: flex-start; margin-bottom: 12px; padding: 3px 10px; border-radius: 999px; background: rgba(5,150,105,.18); color: #6ee7b7; font-size: .7rem; }
        h2 { margin: 0 0 9px; font: 600 1.05rem/1.3 "Space Grotesk", sans-serif; }
        .card p { flex: 1; margin: 0 0 18px; color: #94a3b8; font-size: .86rem; line-height: 1.55; }
        .amazon-button { align-self: flex-start; padding: 10px 15px; border-radius: 10px; background: #facc15; color: #1e293b; font-size: .84rem; font-weight: 700; text-decoration: none; }
        .amazon-button:hover { background: #fde047; }
        .footer { max-width: 1100px; margin: 56px auto 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,.08); display: flex; justify-content: space-between; gap: 16px; color: #64748b; font-size: .8rem; }
        .footer span:last-child { display: flex; gap: 16px; }
        @media (max-width: 800px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .products-header { margin-bottom: 42px; } .navigation { gap: 10px; font-size: .85rem; } .grid { grid-template-columns: 1fr; } .footer { flex-direction: column; text-align: center; align-items: center; } }
      `}</style>
    </main>
  );
}
