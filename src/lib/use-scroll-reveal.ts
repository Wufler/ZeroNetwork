"use client";

import { type MotionProps, useReducedMotion } from "motion/react";

// Shared entrance for homepage sections and cards, independent of their height.
export function useScrollReveal(): MotionProps {
  const reduceMotion = useReducedMotion();

  return {
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: "some", margin: "0px 0px -64px 0px" },
    transition: {
      duration: reduceMotion ? 0 : 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  };
}
