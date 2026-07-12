"use client";

import { useEffect, useRef } from "react";

/**
 * Animated count-up for numeric stat values (public page only — in edit mode
 * the template renders an EditableText instead). Non-numeric values render
 * as-is without animation.
 */
export function StatNumber({
  value,
  suffix,
  className,
}: {
  value: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const target = parseInt(value, 10);
  const numeric = Number.isFinite(target) && String(target) === value.trim();

  useEffect(() => {
    const el = ref.current;
    if (!el || !numeric || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          const t0 = performance.now();
          const dur = 1200;
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + (p === 1 ? suffix || "" : "");
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [numeric, target, suffix]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
