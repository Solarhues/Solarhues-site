import React from 'react';

// SolarHues Amazon Affiliate Storefront
// Fully corrected component structure matching the <main> tag closure expected by the build.

const products = [
  { id: 'B0h7n0fSS', name: 'Solar PV Multimeter & Tester', category: 'Testing Tools', link: 'https://link.amazon/B0h7n0fSS' },
  { id: 'B08a5DGwu', name: 'MC4 Solar Panel Cable Connectors', category: 'Accessories', link: 'https://link.amazon/B08a5DGwu' },
  { id: 'B00PGqijw', name: 'Automatic Solar Street Light Controller', category: 'Controllers', link: 'https://link.amazon/B00PGqijw' },
  { id: 'B0elTZQUh', name: 'Heavy Duty DC Isolator Switch', category: 'Safety', link: 'https://link.amazon/B0elTZQUh' },
  { id: 'B069ryF1G', name: 'Solar Battery Equalizer (24V/48V)', category: 'Battery Care', link: 'https://link.amazon/B069ryF1G' },
  { id: 'B037VkQut', name: 'Digital Solar Power Meter', category: 'Testing Tools', link: 'https://link.amazon/B037VkQut' },
  { id: 'B0c6RECy6', name: 'Pure Sine Wave Inverter Connection Kit', category: 'Inverters', link: 'https://link.amazon/B0c6RECy6' },
  { id: 'B04hwnQXU', name: 'Solar Panel Cleaning Kit with Telescopic Pole', category: 'Maintenance', link: 'https://link.amazon/B04hwnQXU' },
  { id: 'B0gm29wCi', name: 'IP65 Waterproof Junction Box', category: 'Accessories', link: 'https://link.amazon/B0gm29wCi' },
  { id: 'B06c311v8', name: 'Lightning Surge Protection Device (SPD) DC', category: 'Safety', link: 'https://link.amazon/B06c311v8' },
  { id: 'B02l5Hd75', name: 'Solar Crimping Tool Kit for MC4', category: 'Tools', link: 'https://link.amazon/B02l5Hd75' },
  { id: 'B0e8rpwW2', name: 'MPPT Solar Charge Controller 60A', category: 'Controllers', link: 'https://link.amazon/B0e8rpwW2' },
  { id: 'B051iKuQg', name: 'Flexible Thin-Film Solar Panel 100W', category: 'Panels', link: 'https://link.amazon/B051iKuQg' },
  { id: 'B0gxFeZs3', name: 'Infrared Thermal Imaging Camera', category: 'Maintenance', link: 'https://link.amazon/B0gxFeZs3' },
  { id: 'B09dF8pRt', name: 'Smart Energy Meter Wi-Fi Monitored', category: 'Monitoring', link: 'https://link.amazon/B09dF8pRt' },
  { id: 'B0gcxuk9v', name: 'Solar Panel Bird Deterrent Spikes', category: 'Maintenance', link: 'https://link.amazon/B0gcxuk9v' },
  { id: 'B059FFR9l', name: 'Armored DC Solar Cable 4sqmm (100m)', category: 'Wiring', link: 'https://link.amazon/B059FFR9l' },
  { id: 'B01x2ksUV', name: 'Portable Solar Generator Camping Station', category: 'Generators', link: 'https://link.amazon/B01x2ksUV' },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#1e293b] text-slate-100 font-sans px-4 py-12">
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
    </main>
  );
}
