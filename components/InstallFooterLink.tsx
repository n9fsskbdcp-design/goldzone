"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function InstallFooterLink() {

  const [show, setShow] = useState(false);

  useEffect(() => {

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (!isStandalone) {
      setShow(true);
    }

  }, []);

  if (!show) return null;

  return (
    <Link href="/install" className="hover:underline">
      Install App
    </Link>
  );
}