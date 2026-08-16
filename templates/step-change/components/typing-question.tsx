"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero search bar that types out each question, holds, deletes and moves on.
 * Falls back to the first question as static text when the list is empty or the
 * visitor prefers reduced motion.
 */
export function ScTypingQuestion({ questions }: { questions: string[] }) {
  const [typed, setTyped] = useState("");
  const [index, setIndex] = useState(0);
  const charRef = useRef(0);
  const phaseRef = useRef<"typing" | "hold" | "deleting">("typing");
  const holdRef = useRef(0);

  useEffect(() => {
    if (questions.length === 0) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTyped(questions[0]);
      return;
    }

    const timer = setInterval(() => {
      const q = questions[index % questions.length];
      if (phaseRef.current === "typing") {
        charRef.current += 1;
        if (charRef.current >= q.length) {
          phaseRef.current = "hold";
          holdRef.current = 0;
        }
        setTyped(q.slice(0, charRef.current));
      } else if (phaseRef.current === "hold") {
        holdRef.current += 1;
        if (holdRef.current > 34) phaseRef.current = "deleting";
      } else {
        charRef.current -= 3;
        if (charRef.current <= 0) {
          charRef.current = 0;
          phaseRef.current = "typing";
          setTyped("");
          setIndex((i) => i + 1);
          return;
        }
        setTyped(q.slice(0, charRef.current));
      }
    }, 60);

    return () => clearInterval(timer);
  }, [questions, index]);

  if (questions.length === 0) return null;

  return (
    <div className="w-[min(100%,680px)] bg-[#273533] border border-white/[0.12] rounded-[26px] px-6 py-[22px] flex items-center gap-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] text-right">
      <span aria-hidden className="text-[#9CAFA5] text-lg shrink-0">
        &#8981;
      </span>
      <span className="text-[clamp(16px,2.1vw,21px)] font-medium text-[#EFEFEF] min-h-[1.5em] overflow-hidden whitespace-nowrap text-ellipsis">
        {typed}
        <span
          aria-hidden
          className="inline-block w-0.5 h-[1.1em] bg-[#74DF93] mr-1 align-text-bottom animate-blink"
        />
      </span>
    </div>
  );
}
