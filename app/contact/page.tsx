export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-900">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Contact Goldzone
        </h1>

        <p className="text-gray-800 text-sm sm:text-base leading-relaxed max-w-xl">
          For serious gold selling inquiries or to schedule a professional evaluation.
          For pricing estimates, please use the Calculator or Sell page first.
        </p>
      </div>

      {/* Recommended Process */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-10">

        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recommended Process
        </h2>

        <ul className="text-sm text-gray-800 space-y-2">
          <li>1. Use the Calculator for an instant estimate.</li>
          <li>2. Submit your details via the Sell page.</li>
          <li>3. We contact you to schedule evaluation.</li>
        </ul>

        <p className="text-sm text-gray-700 mt-4">
          This ensures faster processing and structured service.
        </p>

      </div>

      {/* Direct Contact */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-10">

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Direct Contact
        </h2>

        <div className="space-y-6">

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">
              Phone
            </p>

            <p className="text-base font-medium text-gray-900">
              +1 (758) XXX-XXXX
            </p>

            <p className="text-sm text-gray-700 mt-1">
              For scheduled evaluations and confirmed selling inquiries.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">
              Email
            </p>

            <p className="text-base font-medium text-gray-900">
              info@goldzone758.com
            </p>
          </div>

        </div>

      </div>

      {/* Testing Policy */}
      <div className="text-sm text-gray-800 leading-relaxed mb-12">
        Professional gold testing may carry a service fee.
        This fee is fully rebated if you proceed with the sale.
        Final offers are confirmed after purity verification.
      </div>

      {/* CTA */}
      <div>
        <a
          href="/sell"
          className="block text-center bg-gray-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-gray-800 transition"
        >
          Submit Gold for Evaluation
        </a>
      </div>

    </div>
  );
}