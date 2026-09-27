'use client';
import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-6 sm:p-12 selection:bg-yellow-100 max-w-4xl mx-auto space-y-6">
      <header className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-black text-gray-900">Terms of Service</h1>
        <p className="text-xs text-amber-800 font-bold uppercase tracking-wider mt-1">Effective Date: September 28, 2026</p>
      </header>

      <section className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
        <h2 className="text-lg font-black text-gray-900">1. Aggregator Platform Mandate</h2>
        <p>
          Solarhues operates strictly as an intermediary technology framework (E-Commerce Operator). The site handles matching software services and does not physically construct or warranty solar array hardware. Engineering liability rests solely with your chosen contractor.
        </p>

        <h2 className="text-lg font-black text-gray-900 pt-2">2. Direct Customer-to-Vendor Payments</h2>
        <p>
          Users execute capital transactions directly into the installer's corporate bank details using free NEFT/IMPS/RTGS transfers. Solarhues coordinates matching data tracking, while project funds bypass inline clearing gateway percentages completely.
        </p>

        <h2 className="text-lg font-black text-gray-900 pt-2">3. Pre-Paid Wallet Management & Section 194-O</h2>
        <p>
          Installers agree to fund their digital business wallet to cover the 6% marketplace service charge. Platform access freezes automatically if wallet credits expire. The system accounts for gross logs in line with Section 194-O tax parameters.
        </p>
      </div>
    </div>
  );
}
