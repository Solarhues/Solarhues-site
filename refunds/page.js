'use client';
import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-6 sm:p-12 selection:bg-yellow-100 max-w-4xl mx-auto space-y-6">
      <header className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-black text-gray-900">Cancellation & Refunds</h1>
        <p className="text-xs text-amber-800 font-bold uppercase tracking-wider mt-1">Effective Date: September 28, 2026</p>
      </header>

      <section className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
        <h2 className="text-lg font-black text-gray-900">1. Stage 1 Booking Reversals</h2>
        <p>
          Customers can cancel a matched booking before the physical roof survey or DISCOM file step. In this case, the installer must return 100% of the 10% advance within 7 business days, and Solarhues returns the 6% wallet credits.
        </p>

        <h2 className="text-lg font-black text-gray-900 pt-2">2. Technical Unfeasibility Clause</h2>
        <p>
          If the physical on-site survey shows that structural roof damage or permanent shade obstructions make the solar installation unsafe or impossible, the contract terminates. The customer receives a full return of their advance.
        </p>

        <h2 className="text-lg font-black text-gray-900 pt-2">3. Post-Filing Lockout Status</h2>
        <p>
          Once engineering blueprints are approved and files are submitted to the local electrical DISCOM, the project layout becomes non-refundable due to custom allocation parameters.
        </p>
      </section>
    </div>
  );
}
