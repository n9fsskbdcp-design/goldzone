"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (path: string) =>
    `relative px-4 py-3 rounded-lg transition text-sm ${
      pathname === path
        ? "bg-gray-800 text-white font-semibold"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  const activeIndicator = (path: string) =>
    pathname === path ? (
      <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r" />
    ) : null;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-950 text-white flex items-center justify-between px-4 py-3 z-40 shadow-sm select-none">
        <span className="font-semibold tracking-wide">
          Goldzone
        </span>

        <button
          onClick={() => setOpen(true)}
          className="text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-72 md:w-64
          bg-gray-950 text-white px-6 py-8
          transform transition-transform duration-300 ease-out
          z-50 overflow-y-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >

        {/* Mobile Close Header */}
        <div className="md:hidden flex justify-between items-center mb-8">
          <h1 className="text-lg font-semibold tracking-wide">
            Goldzone
          </h1>

          <button
            onClick={() => setOpen(false)}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Desktop Brand Header */}
        <div className="hidden md:block mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            Goldzone
          </h1>

          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Transparent pricing.<br />
            Market-aligned gold buying.
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2">

          <Link href="/" onClick={() => setOpen(false)} className={linkClass("/")}>
            {activeIndicator("/")}
            Home
          </Link>

          <Link href="/calculator" onClick={() => setOpen(false)} className={linkClass("/calculator")}>
            {activeIndicator("/calculator")}
            Calculator
          </Link>

          <Link href="/sell" onClick={() => setOpen(false)} className={linkClass("/sell")}>
            {activeIndicator("/sell")}
            Sell Gold Now
          </Link>

          <Link href="/how-it-works" onClick={() => setOpen(false)} className={linkClass("/how-it-works")}>
            {activeIndicator("/how-it-works")}
            How It Works
          </Link>

          <Link href="/testing" onClick={() => setOpen(false)} className={linkClass("/testing")}>
            {activeIndicator("/testing")}
            Testing Service
          </Link>

          <Link href="/gold-guide" onClick={() => setOpen(false)} className={linkClass("/gold-guide")}>
            {activeIndicator("/gold-guide")}
            Gold Guide
          </Link>

          <Link href="/faq" onClick={() => setOpen(false)} className={linkClass("/faq")}>
            {activeIndicator("/faq")}
            FAQ
          </Link>

          <Link href="/contact" onClick={() => setOpen(false)} className={linkClass("/contact")}>
            {activeIndicator("/contact")}
            Contact Us
          </Link>

        </nav>

        {/* Footer Info */}
        <div className="hidden md:block text-xs text-gray-600 mt-12 leading-relaxed">
          <p>Buying rates update frequently</p>
          <p>based on live gold market conditions.</p>
        </div>

      </aside>
    </>
  );
}