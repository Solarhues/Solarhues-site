import React from 'react';
import Link from 'next/link';

// SolarHues Amazon Affiliate Storefront
// Updated with the new requested product list, matching the dark theme guidelines 
// (slate background #1e293b, translucent cards, emerald/yellow accents).
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
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-sans px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Recommended Solar Equipment & Accessories
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Explore handpicked, high-quality tools, maintenance kits, and components to optimize and maintain your rooftop solar installation.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-xl p-6 transition-all duration-200 hover:border-emerald-500/50 flex flex-col justify-between"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {product.category}
                  </span>
                  <span className="text-xs text-slate-500">ID: {product.id}</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-100 mb-2 line-clamp-2">
                  {product.name}
                </h2>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Verified Partner Link</span>
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  View on Amazon
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center text-xs text-slate-500 border-t border-white/5 pt-6">
          SolarHues participates in the Amazon Associates Program. We may earn a small commission from qualifying purchases made through these links at no extra cost to you.
        </div>
      </div>
    </div>
  );
}
      `}</style>
    </main>
  );
}
