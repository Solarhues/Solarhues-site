import { Space_Grotesk, Inter } from 'next/font/google';
import Link from 'next/link';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const products = [
  { title: 'Solar product 1', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B0h7n0fSS' },
  { title: 'Solar product 2', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B08a5DGwu' },
  { title: 'Solar product 3', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B00PGqijw' },
  { title: 'Solar product 4', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B0elTZQUh' },
  { title: 'Solar product 5', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B069ryF1G' },
  { title: 'Solar product 6', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B037VkQut' },
  { title: 'Solar product 7', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B0c6RECy6' },
  { title: 'Solar product 8', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B04hwnQXU' },
  { title: 'Solar product 9', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B0gm29wCi' },
  { title: 'Solar product 10', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B06c311v8' },
  { title: 'Solar product 11', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B02l5Hd75' },
  { title: 'Solar product 12', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B0e8rpwW2' },
  { title: 'Solar product 13', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B051iKuQg' },
  { title: 'Solar product 14', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B0gxFeZs3' },
  { title: 'Solar product 15', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B09dF8pRt' },
  { title: 'Solar product 16', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B0gcxuk9v' },
  { title: 'Solar product 17', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B059FFR9l' },
  { title: 'Solar product 18', description: 'Explore this solar and home-energy product on Amazon.', url: 'https://link.amazon/B01x2ksUV' }
];

export default function ProductsPage() {
  return (
    <main className={`${spaceGrotesk.variable} ${inter.variable} products-page`}>
      <div className="products-shell">
        <header className="products-header">
          <div>
            <p className="eyebrow">SolarHues marketplace</p>
            <h1>Solar products for your home</h1>
            <p className="intro">
              Helpful solar and backup-power essentials, selected for homeowners exploring cleaner,
              more reliable energy.
            </p>
          </div>
          <Link className="back-link" href="/">Back to SolarHues</Link>
        </header>

        <section className="notice" aria-label="Affiliate disclosure">
          <strong>Affiliate disclosure:</strong> Product links open Amazon. SolarHues may earn a
          commission from qualifying purchases at no additional cost to you.
        </section>

        <section className="product-grid" aria-label="Solar products">
          {products.map((product, index) => (
            <article className="product-card" key={product.url}>
              <div className="product-number">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <h2>{product.title}</h2>
                <p>{product.description}</p>
                <a
                  className="product-link"
                  href={product.url}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                >
                  View on Amazon <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>

      <style jsx global>{`;
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #1e293b; color: #f8fafc; }
        .products-page { min-height: 100vh; font-family: var(--font-inter), sans-serif; background: #1e293b; }
        .products-shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 64px 0 80px; }
        .products-header { display: flex; justify-content: space-between; gap: 32px; align-items: flex-end; margin-bottom: 32px; }
        .eyebrow { margin: 0 0 12px; color: #facc15; font-size: 0.78rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
        h1, h2 { font-family: var(--font-space-grotesk), sans-serif; }
        h1 { max-width: 700px; margin: 0; font-size: clamp(2.4rem, 6vw, 4.7rem); line-height: .98; letter-spacing: -.055em; }
        .intro { max-width: 620px; margin: 20px 0 0; color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; }
        .back-link { color: #facc15; font-size: .92rem; text-decoration: none; white-space: nowrap; }
        .back-link:hover, .product-link:hover { color: #fde68a; }
        .notice { margin-bottom: 34px; padding: 16px 18px; border: 1px solid rgba(250,204,21,.3); border-radius: 12px; background: rgba(250,204,21,.08); color: #fde68a; line-height: 1.6; }
        .notice strong { color: #facc15; }
        .product-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .product-card { display: flex; gap: 16px; min-height: 190px; padding: 24px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: rgba(255,255,255,.03); transition: transform .2s ease, border-color .2s ease, background .2s ease; }
        .product-card:hover { transform: translateY(-3px); border-color: rgba(5,150,105,.65); background: rgba(5,150,105,.08); }
        .product-number { flex: 0 0 auto; color: #059669; font-family: var(--font-space-grotesk), sans-serif; font-size: .85rem; font-weight: 700; }
        .product-card h2 { margin: 0 0 10px; font-size: 1.2rem; line-height: 1.15; }
        .product-card p { margin: 0 0 22px; color: #94a3b8; font-size: .92rem; line-height: 1.55; }
        .product-link { color: #facc15; font-size: .9rem; font-weight: 700; text-decoration: none; }
        @media (max-width: 900px) { .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .products-shell { padding-top: 40px; } .products-header { display: block; } .back-link { display: inline-block; margin-top: 22px; } .product-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
