"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {

  const [prices,setPrices] = useState<Record<string,number>>({})
  const [updatedAt,setUpdatedAt] = useState("")
  const [loading,setLoading] = useState(true)

  const [showInstall,setShowInstall] = useState(false)
  const [deferredPrompt,setDeferredPrompt] = useState<any>(null)

  /* Detect if already installed */

  useEffect(()=>{

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true

    if(!isStandalone){
      setShowInstall(true)
    }

  },[])

  /* Capture install event */

  useEffect(()=>{

    const handler = (e:any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt",handler)

    return ()=>window.removeEventListener("beforeinstallprompt",handler)

  },[])

  const handleInstall = async () => {

    if(!deferredPrompt) return

    deferredPrompt.prompt()

    await deferredPrompt.userChoice

    setDeferredPrompt(null)

  }

  /* Load gold prices */

  useEffect(()=>{

    const loadPrices = () => {
      fetch("/api/prices")
        .then(res=>res.json())
        .then(data=>{
          setPrices(data.prices)
          setUpdatedAt(data.updatedAt)
          setLoading(false)
        })
        .catch(console.error)
    }

    loadPrices()

    const interval = setInterval(loadPrices,600000)

    return ()=>clearInterval(interval)

  },[])

  return (
  <>
  <div className="max-w-xl mx-auto px-4 py-8 pb-24 bg-white text-gray-900 rounded-xl">

  {/* HERO */}

  <section className="mb-6">

  <h1 className="text-2xl sm:text-3xl font-bold mb-3">
  Sell Your Gold with Confidence
  </h1>

  <p className="text-sm sm:text-base text-gray-700">
  Live gold pricing aligned with international market conditions.
  Professional gold buying service in St Lucia.
  </p>

  </section>


  {/* GOLD PRICE */}

  <section className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">

  <h2 className="text-lg font-semibold mb-2">
  Gold Price Today
  </h2>

  <p className="text-sm text-gray-700">
  Based on international gold spot prices
  </p>

  {loading ? (
  <div className="h-7 w-40 mt-2 bg-gray-200 rounded animate-pulse"/>
  ) : (
  <p className="text-xl font-semibold mt-2">
  {Number(prices["24"]).toFixed(2)} XCD / gram (24K)
  </p>
  )}

  {updatedAt && (
  <p className="text-xs text-gray-500 mt-2">
  Updated: {new Date(updatedAt).toLocaleString()}
  </p>
  )}

  </section>


  {/* BUYING PRICES */}

  <section className="bg-white rounded-xl shadow-sm p-5 space-y-3 mb-8 border border-gray-200">

  <h2 className="text-lg font-semibold">
  Current Buying Prices
  </h2>

  {Object.entries(prices).map(([karat,price])=>(
  <div key={karat} className="flex justify-between border-b border-gray-200 last:border-b-0 py-2">

  <span className="font-medium">{karat}K Gold</span>

  <span className="font-semibold">
  {Number(price).toFixed(2)} XCD / gram
  </span>

  </div>
  ))}

  </section>


  {/* HOW IT WORKS */}

  <section className="mb-8">

  <h2 className="text-lg font-semibold mb-4">
  How It Works
  </h2>

  <div className="space-y-3 text-sm text-gray-700">

  <p>
  <strong>1.</strong> Estimate your payout using our{" "}
  <Link href="/calculator" className="underline">
  gold calculator
  </Link>.
  </p>

  <p>
  <strong>2.</strong> Submit your gold for evaluation.
  </p>

  <p>
  <strong>3.</strong> Receive payment once weight and purity are verified.
  </p>

  </div>

  </section>


  {/* INSTALL APP — MOVED TO BOTTOM */}

  {showInstall && (

  <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

  <h2 className="text-lg font-semibold mb-2">
  Install Goldzone App
  </h2>

  <p className="text-sm text-gray-700 mb-4">
  Add Goldzone to your phone for quick access to the calculator and selling service.
  </p>

  {deferredPrompt ? (

  <button
  onClick={handleInstall}
  className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition"
  >
  Install App
  </button>

  ) : (

  <div className="space-y-2 text-sm text-gray-700">

  <p><strong>Android:</strong> Tap browser menu ⋮ → Add to Home Screen</p>

  <p><strong>iPhone:</strong> Tap Share → Add to Home Screen</p>

  </div>

  )}

  </section>

  )}


  {/* DESKTOP CTA */}

  <div className="hidden lg:block mt-8">
    <Link
      href="/sell"
      className="block text-center bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-black transition"
    >
      Sell Your Gold
    </Link>
  </div>

  </div>


  {/* STICKY CTA FOR MOBILE */}

  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 lg:hidden">

  <Link
  href="/sell"
  className="block text-center bg-gray-900 text-white py-3 rounded-lg font-semibold"
  >
  Sell Gold
  </Link>

  </div>

  </>
  )
}