'use client';
import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-6 sm:p-12 selection:bg-yellow-100 max-w-4xl mx-auto space-y-6">
      <header className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-black text-gray-900">Privacy Policy</h1>
        <p className="text-xs text-amber-800 font-bold uppercase tracking-wider mt-1">Effective Date: September 28, 2026</p>
      </header>

      <section className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
        <p>
          Welcome to Solarhues, accessible at <strong>https://solarhues.com</strong>. We function as a clean energy marketplace aggregator matching property buyers with verified installers. This policy details how we secure your data parameters.
        </p>
        
        <h2 className="text-lg font-black text-gray-900 pt-2">1. Data Capture Metrics</h2>
        <p>
          We store structural property footprints including 6-digit Pincodes, electric DISCOM names, sanctioned loads, average billing slabs, and structural roof layouts. Personal contact identifiers are verified using secure OTP handshakes.
        </p>

        <h2 className="text-lg font-black text-gray-900 pt-2">2. Zero Third-Party Selling Rule</h2>
        <p>
          Your physical location details and project load metrics are never sold to external marketing brokers. Data records are shared exclusively with a maximum of three local installers explicitly selected by the consumer.
        </p>

        <h2 className="text-lg font-black text-gray-900 pt-2">3. Corporate Support Gateway</h2>
        <p>
          For registration clearance logs or data management updates, address our operational support team at <strong>hello@solarhues.com</strong>.
        </p>
      </section>
    </div>
  );
}
