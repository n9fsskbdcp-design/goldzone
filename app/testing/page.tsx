"use client";
import Link from "next/link";

export default function TestingService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-12 bg-white text-gray-900">

      {/* Header */}

      <section className="space-y-4">

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Professional Gold Testing Service
        </h1>

        <p className="text-sm text-gray-700">
          Testing is performed using calibrated equipment and standard
          gold verification methods to ensure fair and transparent results.
        </p>

        <p className="text-sm text-gray-700">
          Typical response time: <strong>1–3 hours</strong>
        </p>

      </section>


      {/* What We Do */}

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">

        <h2 className="text-xl font-semibold">
          What’s Included
        </h2>

        <ul className="list-disc pl-5 text-sm sm:text-base text-gray-800 space-y-2">

          <li>Accurate weight measurement (grams)</li>

          <li>Karat verification</li>

          <li>Professional purity assessment</li>

          <li>Transparent payout calculation</li>

          <li>Digital certificate of testing results</li>

        </ul>

      </section>


      {/* Testing Fee Policy */}

      <section className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-3">

        <h2 className="text-xl font-semibold">
          Testing Fee Policy
        </h2>

        <p className="text-sm sm:text-base text-gray-800">
          In some cases a small professional testing fee may apply depending
          on the evaluation required.
        </p>

        <p className="text-sm sm:text-base text-gray-800">
          <strong>
            If you decide to proceed with the sale after testing,
            the testing fee is fully refunded.
          </strong>
        </p>

        <p className="text-sm text-gray-700">
          If you choose not to sell after the testing process,
          the testing fee may apply depending on the evaluation performed.
        </p>

        <p className="text-sm text-gray-700">
          This helps ensure serious evaluations while keeping the
          process fair for everyone.
        </p>

      </section>


      {/* Meeting Process */}

      <section className="space-y-3">

        <h2 className="text-xl font-semibold">
          Meeting & Mobile Service
        </h2>

        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
          Goldzone operates by appointment at secure meeting locations
          across St Lucia.
        </p>

        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
          Mobile evaluations may also be arranged depending on the
          circumstances and location.
        </p>


      </section>


      {/* CTA */}

      <section className="text-center space-y-4">

        <p className="text-sm text-gray-800">
          Ready to have your gold professionally tested?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <Link
            href="/sell"
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Request Evaluation
          </Link>

          <Link
            href="/calculator"
            className="border border-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
          >
            Use Calculator First
          </Link>

        </div>

      </section>

    </div>
  );
}