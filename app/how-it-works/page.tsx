"use client";
import Link from "next/link";

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-12 text-gray-900">

      {/* Header */}
      <section className="space-y-4">

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          How It Works
        </h1>

        <p className="text-gray-800 text-sm sm:text-base">
          A clear and professional gold selling process in St Lucia —
          from evaluation to payment.
        </p>

        <p className="text-sm text-gray-700">
          Average evaluation response time: <strong>1–3 hours</strong>
        </p>

      </section>


      {/* Steps */}
      <section className="space-y-8">

        {/* Step 1 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            1. Estimate Your Gold Value
          </h2>

          <p className="text-sm sm:text-base text-gray-800">
            Use our{" "}
            <Link href="/calculator" className="underline hover:text-gray-900">
              Gold Calculator
            </Link>{" "}
            to estimate your payout based on current buying rates.
          </p>
        </div>


        {/* Step 2 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            2. Submit Your Details
          </h2>

          <p className="text-sm sm:text-base text-gray-800">
            Complete the{" "}
            <Link href="/sell" className="underline hover:text-gray-900">
              Sell Gold
            </Link>{" "}
            form and upload photos for review.
          </p>
        </div>


        {/* Step 3 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            3. Schedule Evaluation
          </h2>

          <p className="text-sm sm:text-base text-gray-800">
            We confirm a secure meeting location or arrange a mobile
            service appointment for evaluation.
          </p>
        </div>


        {/* Step 4 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            4. Professional Gold Testing
          </h2>

          <p className="text-sm sm:text-base text-gray-800">
            Your gold is weighed using calibrated scales and
            professionally tested to verify purity.
            A testing fee may apply and is refunded if you proceed
            with the sale.
          </p>
        </div>


        {/* Step 5 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            5. Immediate Payment
          </h2>

          <p className="text-sm sm:text-base text-gray-800">
            Once weight and purity are verified, a final offer is
            presented. Payment is issued immediately upon agreement.
          </p>
        </div>

      </section>


      {/* CTA */}
      <section className="text-center space-y-4">

        <p className="text-sm text-gray-800">
          Ready to begin?
        </p>

        <Link
          href="/sell"
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition inline-block"
        >
          Start Selling Your Gold
        </Link>

      </section>

    </div>
  );
}