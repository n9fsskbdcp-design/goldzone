export default function PurityGuide() {
  const purityData = [
    { karat: "24K", gold: 99.9, other: 0.1, note: "Investment-grade gold. Very soft." },
    { karat: "22K", gold: 91.6, other: 8.4, note: "High-purity jewelry gold." },
    { karat: "18K", gold: 75.0, other: 25.0, note: "Balance of purity and durability." },
    { karat: "14K", gold: 58.3, other: 41.7, note: "Durable everyday jewelry." },
    { karat: "12K", gold: 50.0, other: 50.0, note: "Equal mix of gold and alloys." },
    { karat: "10K", gold: 41.7, other: 58.3, note: "More durable, lower gold content." },
    { karat: "9K", gold: 37.5, other: 62.5, note: "Common in some markets, lower gold content." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">
        Gold Purity Guide
      </h1>

      <p className="text-gray-600 text-sm sm:text-base mb-8">
        Gold purity is measured in karats (K). The higher the karat,
        the greater the percentage of pure gold in the item.
        The remaining percentage consists of other metals such as copper,
        silver, nickel, or zinc, which increase durability.
      </p>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">

        <table className="min-w-full text-sm">

          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Karat</th>
              <th className="text-left px-4 py-3 font-semibold">Gold Content</th>
              <th className="text-left px-4 py-3 font-semibold">Other Metals</th>
              <th className="text-left px-4 py-3 font-semibold">Typical Use</th>
            </tr>
          </thead>

          <tbody>
            {purityData.map((item) => (
              <tr key={item.karat} className="border-b last:border-none">
                <td className="px-4 py-3 font-medium">
                  {item.karat}
                </td>
                <td className="px-4 py-3">
                  {item.gold}%
                </td>
                <td className="px-4 py-3">
                  {item.other}%
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {item.note}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Explanation Section */}
      <div className="mt-8 space-y-4 text-sm text-gray-600">

        <p>
          <strong>Important:</strong> Karat refers to purity, not weight.
          A 10g item of 24K gold contains significantly more pure gold
          than a 10g item of 14K gold.
        </p>

        <p>
          Goldzone buying rates are structured based on verified purity
          and live gold market conditions. Final payout is confirmed after
         testing and inspection.
        </p>

      </div>

    </div>
  );
}