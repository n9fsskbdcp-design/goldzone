"use client";

import { useEffect, useRef, useState } from "react";

function listenForWaitingServiceWorker(
  registration: ServiceWorkerRegistration,
  onUpdateFound: () => void
) {
  if (registration.waiting) {
    onUpdateFound();
    return;
  }

  const handleUpdateFound = () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener("statechange", () => {
      if (
        installingWorker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        onUpdateFound();
      }
    });
  };

  registration.addEventListener("updatefound", handleUpdateFound);
}

export default function ServiceWorkerRegister() {
  const [showUpdate, setShowUpdate] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registrationRef.current = registration;

        listenForWaitingServiceWorker(registration, () => {
          setShowUpdate(true);
        });

        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 1000);
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });

    const handleControllerChange = () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  const handleRefresh = () => {
    const registration = registrationRef.current;
    if (!registration?.waiting) return;

    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-medium text-gray-900">Update available</p>
      <p className="mt-1 text-sm text-gray-600">
        A newer version of Goldzone is ready.
      </p>

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleRefresh}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          Refresh
        </button>

        <button
          onClick={() => setShowUpdate(false)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Later
        </button>
      </div>
    </div>
  );
}