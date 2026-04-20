export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
        <h1 className="text-2xl font-bold mb-3">You’re offline</h1>

        <p className="text-sm text-gray-600 mb-4">
          Goldzone can still use your last saved calculator prices if the app
          was opened before while connected.
        </p>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            Connect to the internet for the latest live gold prices.
          </p>
        </div>
      </div>
    </div>
  );
}