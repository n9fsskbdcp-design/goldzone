"use client";
import Link from "next/link";

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">

      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          How It Works
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          A clear and professional process from evaluation to payment.
        </p>
      </section>

      {/* Steps */}
      <section className="space-y-8">

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">1. Estimate Your Value</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Use our{" "}
            <Link href="/calculator" className="underline">
              Gold Calculator
            </Link>{" "}
            to estimate your payout based on current buying rates.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">2. Submit Your Details</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Complete the{" "}
            <Link href="/sell" className="underline">
              Sell Gold
            </Link>{" "}
            form and upload photos for review.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">3. Book an Evaluation</h2>
          <p className="text-sm sm:text-base text-gray-600">
            We confirm a secure meeting location or mobile service appointment.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">4. Professional Testing</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Your gold is weighed and tested to verify purity.
            A testing fee may apply and is refundable if you proceed with the sale.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">5. Immediate Payment</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Once verified, an offer is presented. Payment is made upon agreement.
          </p>
        </div>

      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Ready to begin?
        </p>

        <Link
          href="/sell"
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition inline-block"
        >
          Start Selling
        </Link>
      </section>

    </div>
  );
}