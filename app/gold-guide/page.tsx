export default function GoldGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-16">

      {/* HERO */}
      <section className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Gold Guide
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Learn how gold purity works, how to read hallmarks,
          and how professional evaluation determines value.
        </p>
      </section>


      {/* GOLD PURITY */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          What Is Gold Purity?
        </h2>

        <p className="text-gray-600 text-sm sm:text-base">
          Gold purity is measured in karats (K). Pure gold is 24K.
          Lower karats contain a mixture of gold and other metals
          such as copper, silver, nickel, or zinc.
        </p>

        <p className="text-gray-600 text-sm sm:text-base">
          These metals increase strength and durability because
          pure gold is naturally soft.
        </p>
      </section>


      {/* KARAT TABLE */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">
          Karat & Hallmark Reference
        </h2>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Karat</th>
                <th className="text-left px-4 py-3 font-semibold">Hallmark</th>
                <th className="text-left px-4 py-3 font-semibold">Gold %</th>
                <th className="text-left px-4 py-3 font-semibold">Other Metals %</th>
              </tr>
            </thead>

            <tbody>
              {[
                ["24K","999","99.9%","0.1%"],
                ["22K","916","91.6%","8.4%"],
                ["18K","750","75%","25%"],
                ["14K","585","58.3%","41.7%"],
                ["12K","500","50%","50%"],
                ["10K","417","41.7%","58.3%"],
                ["9K","375","37.5%","62.5%"],
              ].map((row, i) => (
                <tr key={i} className="border-b last:border-none">
                  <td className="px-4 py-3 font-medium">{row[0]}</td>
                  <td className="px-4 py-3">{row[1]}</td>
                  <td className="px-4 py-3">{row[2]}</td>
                  <td className="px-4 py-3">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


      {/* STAMP LOCATION */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Where to Find the Hallmark
        </h2>

        <ul className="list-disc pl-6 text-gray-600 text-sm sm:text-base space-y-2">
          <li>Inside ring bands</li>
          <li>Near the clasp on chains and bracelets</li>
          <li>On small metal tags attached to jewellery</li>
          <li>On earring posts or backings</li>
        </ul>

        <p className="text-gray-600 text-sm">
          Some jewellery may not have a visible hallmark.
          Professional testing is often required to confirm purity.
        </p>
      </section>


      {/* FAKE STAMPS */}
      <section className="bg-red-50 border border-red-200 p-6 rounded-2xl space-y-3">
        <h2 className="text-xl font-semibold text-red-700">
          Warning: Fake or Misleading Stamps
        </h2>

        <p className="text-sm text-red-700">
          A hallmark stamp alone does not guarantee authenticity.
          Some jewellery may carry fake, altered, or misleading stamps.
        </p>

        <p className="text-sm text-red-700">
          Gold-plated or gold-filled items may contain numbers that
          appear similar to real hallmarks but contain very little gold.
        </p>
      </section>


      {/* GOLD IS SOLD BY WEIGHT */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Gold Is Valued by Weight
        </h2>

        <p className="text-gray-600 text-sm sm:text-base">
          The value of gold is determined by two main factors:
        </p>

        <ul className="list-disc pl-6 text-gray-600 text-sm sm:text-base space-y-2">
          <li>Weight (grams)</li>
          <li>Purity (karat)</li>
        </ul>

        <p className="text-gray-600 text-sm sm:text-base">
          This means gold is effectively valued **by grams of pure gold
          contained in the item**, regardless of the jewellery design.
        </p>
      </section>


      {/* BROKEN GOLD */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Does Broken Gold Still Have Value?
        </h2>

        <p className="text-gray-600 text-sm sm:text-base">
          Yes. Broken chains, single earrings, damaged rings, and scrap
          jewellery still contain gold.
        </p>

        <p className="text-gray-600 text-sm sm:text-base">
          Gold value is determined by **weight and purity**, not whether
          the jewellery piece is complete.
        </p>
      </section>


      {/* GOLD COLORS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Why Gold Comes in Different Colors
        </h2>

        <ul className="list-disc pl-6 text-gray-600 text-sm sm:text-base space-y-2">
          <li>Rose gold contains more copper.</li>
          <li>White gold is mixed with nickel or palladium.</li>
          <li>Yellow gold contains silver and copper alloys.</li>
        </ul>

        <p className="text-gray-600 text-sm">
          Color does not determine value — purity does.
        </p>
      </section>


      {/* GLOBAL PRICING */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          How Gold Is Priced Globally
        </h2>

        <p className="text-gray-600 text-sm sm:text-base">
          Gold is traded internationally and priced in U.S. dollars
          per troy ounce (31.1035 grams).
        </p>

        <p className="text-gray-600 text-sm sm:text-base">
          Local buying rates are derived from the international
          spot price and adjusted for currency exchange and
          market conditions.
        </p>
      </section>


      {/* GOLD FACTS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Interesting Gold Facts
        </h2>

        <ul className="list-disc pl-6 text-gray-600 text-sm sm:text-base space-y-2">
          <li>Gold melts at 1,064°C (1,947°F).</li>
          <li>Gold does not rust or corrode.</li>
          <li>Nearly all gold ever mined still exists today.</li>
          <li>Gold has been used as money for over 5,000 years.</li>
          <li>Gold is one of the most chemically stable metals.</li>
        </ul>
      </section>


      {/* CTA */}
      <section className="bg-gray-900 text-white p-8 rounded-2xl text-center space-y-4">
        <h2 className="text-2xl font-semibold">
          Ready to Check Your Gold?
        </h2>

        <p className="text-gray-300 text-sm sm:text-base">
          Use our calculator to estimate value or submit your gold
          for evaluation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <a
            href="/calculator"
            className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Use Calculator
          </a>

          <a
            href="/sell"
            className="border border-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition"
          >
            Sell Gold
          </a>

        </div>
      </section>

    </div>
  );
}