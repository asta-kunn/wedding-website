"use client";

import { useEffect, useRef, useState } from "react";

import { watchScrollAnimation } from "./animScroll";

/** Arah animasi, sepadan dengan kelas tema-19: kekiri, kekanan, naik, turun, membesar, muncul. */
export type AnimVariant = "left" | "right" | "up" | "down" | "grow" | "fade";

/**
 * Scroll-reveal meniru animation-scroll.js milik tema-19: elemen "hidup" begitu
 * masuk 88% tinggi layar, dan kembali ke posisi awal kalau sudah turun lagi di
 * bawah layar — jadi animasinya main ulang tiap kali discroll, bukan sekali jalan.
 * Perhitungan ambangnya ada di animScroll.ts. Diam kalau prefers-reduced-motion.
 */
export default function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: AnimVariant;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMotion(false);
      return;
    }
    const el = ref.current;
    if (!el) return;
    return watchScrollAnimation(el, setAnimated);
  }, []);

  return (
    <div
      ref={ref}
      data-anim={motion ? variant : undefined}
      className={`${animated ? "is-anim" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
