"use client";

export default function InstallPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6 text-gray-900">

      <h1 className="text-3xl font-semibold">
        Install Goldzone App
      </h1>

      <p className="text-gray-700">
        Add Goldzone to your phone for quick access to the gold calculator
        and selling service.
      </p>

      <div className="space-y-6">

        <div>
          <h2 className="font-semibold text-lg mb-2">Android</h2>

          <ol className="list-decimal pl-5 text-sm space-y-2">
            <li>Open this website in Chrome</li>
            <li>Tap the menu (⋮)</li>
            <li>Select <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Install</strong></li>
          </ol>
        </div>

        <div>
          <h2 className="font-semibold text-lg mb-2">iPhone</h2>

          <ol className="list-decimal pl-5 text-sm space-y-2">
            <li>Open this website in Safari</li>
            <li>Tap the Share icon</li>
            <li>Select <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong></li>
          </ol>
        </div>

      </div>

    </div>
  );
}