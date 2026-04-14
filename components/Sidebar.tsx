"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setIsLoggedIn(!!user);
      setUserEmail(user?.email ?? null);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!mounted) return;
        setRole(profile?.role ?? null);
      } else {
        setRole(null);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        const user = session?.user ?? null;
        setIsLoggedIn(!!user);
        setUserEmail(user?.email ?? null);

        if (user) {
          supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()
            .then(({ data }) => {
              if (!mounted) return;
              setRole(data?.role ?? null);
            });
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    setIsLoggedIn(false);
    setUserEmail(null);
    setRole(null);
    router.push("/");
    router.refresh();
  };

  const closeMenu = () => setOpen(false);

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
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-950 text-white flex items-center justify-between px-4 py-3 z-40 shadow-sm select-none">
        <span className="font-semibold tracking-wide">Goldzone</span>

        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <Link
              href="/login"
              onClick={closeMenu}
              className="text-sm text-gray-300 hover:text-white"
            >
              Login
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-gray-300 hover:text-white"
            >
              Logout
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-2xl"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

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
        <div className="md:hidden flex justify-between items-center mb-8">
          <h1 className="text-lg font-semibold tracking-wide">Goldzone</h1>

          <button
            type="button"
            onClick={closeMenu}
            className="text-2xl"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="hidden md:block mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">Goldzone</h1>

          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Transparent pricing.
            <br />
            Market-aligned gold buying.
          </p>
        </div>

        <nav className="flex flex-col space-y-2">
          <Link href="/" onClick={closeMenu} className={linkClass("/")}>
            {activeIndicator("/")}
            Home
          </Link>

          <Link
            href="/calculator"
            onClick={closeMenu}
            className={linkClass("/calculator")}
          >
            {activeIndicator("/calculator")}
            Calculator
          </Link>

          <Link
            href="/sell"
            onClick={closeMenu}
            className={linkClass("/sell")}
          >
            {activeIndicator("/sell")}
            Sell Gold Now
          </Link>

          <Link
            href="/how-it-works"
            onClick={closeMenu}
            className={linkClass("/how-it-works")}
          >
            {activeIndicator("/how-it-works")}
            How It Works
          </Link>

          <Link
            href="/testing"
            onClick={closeMenu}
            className={linkClass("/testing")}
          >
            {activeIndicator("/testing")}
            Testing Service
          </Link>

          <Link
            href="/gold-guide"
            onClick={closeMenu}
            className={linkClass("/gold-guide")}
          >
            {activeIndicator("/gold-guide")}
            Gold Guide
          </Link>

          <Link
            href="/faq"
            onClick={closeMenu}
            className={linkClass("/faq")}
          >
            {activeIndicator("/faq")}
            FAQ
          </Link>

          <Link
            href="/contact"
            onClick={closeMenu}
            className={linkClass("/contact")}
          >
            {activeIndicator("/contact")}
            Contact Us
          </Link>
        </nav>

        {isLoggedIn && (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-1">
              Buyer Area
            </p>

            <nav className="flex flex-col space-y-2">
              <Link
                href="/buyer-dashboard"
                onClick={closeMenu}
                className={linkClass("/buyer-dashboard")}
              >
                {activeIndicator("/buyer-dashboard")}
                Buyer Dashboard
              </Link>

              <Link
                href="/commission-calculator"
                onClick={closeMenu}
                className={linkClass("/commission-calculator")}
              >
                {activeIndicator("/commission-calculator")}
                Commission Calculator
              </Link>

              {role === "admin" && (
                <>
                  <Link
                    href="/admin/requests"
                    onClick={closeMenu}
                    className={linkClass("/admin/requests")}
                  >
                    {activeIndicator("/admin/requests")}
                    Sell Requests
                  </Link>

                  <Link
  href="/admin/sales"
  onClick={closeMenu}
  className={linkClass("/admin/sales")}
>
  {activeIndicator("/admin/sales")}
  Admin Sales
</Link>

 <Link
                    href="/admin/money"
                    onClick={closeMenu}
                    className={linkClass("/admin/money")}
                  >
                    {activeIndicator("/admin/money")}
                    Money Overview
                  </Link>

<Link
  href="/admin/revenue-calculator"
  onClick={closeMenu}
  className={linkClass("/admin/revenue-calculator")}
>
  {activeIndicator("/admin/revenue-calculator")}
  Revenue Calculator
</Link>
                </>
              )}
            </nav>
          </div>
        )}

        <div className="mt-8 border-t border-gray-800 pt-5 text-xs">
          {isLoggedIn ? (
            <div className="space-y-3">
              <div className="text-gray-400 leading-relaxed">
                <p className="text-gray-500 mb-1">Signed in as</p>
                <p className="text-white break-all">{userEmail}</p>
                {role === "admin" && (
                  <p className="text-amber-400 mt-1">Admin</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="text-gray-300 hover:text-white underline underline-offset-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-500">Buyer access</p>
              <Link
                href="/login"
                onClick={closeMenu}
                className="text-gray-300 hover:text-white underline underline-offset-2"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        <div className="hidden md:block text-xs text-gray-600 mt-10 leading-relaxed">
          <p>Buying rates update frequently</p>
          <p>based on live gold market conditions.</p>
        </div>
      </aside>
    </>
  );
}