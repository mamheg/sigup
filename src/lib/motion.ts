import type { Variants, Transition } from "motion/react";

/**
 * Shared motion vocabulary. One source of truth so every screen animates the
 * same way. Specs from Emil Kowalski's design-eng guidance + the polish skill.
 */

// Strong ease-out for most UI movement.
export const easeSmooth = [0.23, 1, 0.32, 1] as const;

// Enter: opacity + small rise + slight blur, settling out.
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: easeSmooth },
  },
};

// Route transition — soft cross-fade with a subtle rise/exit.
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: easeSmooth } as Transition,
};

// Card hover lift (pair with a shadow bump in the class). Guard hover:hover in CSS.
export const hoverLift = {
  whileHover: { y: -4 },
  transition: { duration: 0.2, ease: easeSmooth } as Transition,
};

// Contextual icon swap — spring, bounce must be 0.
export const iconSwap = {
  initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  transition: { type: "spring", duration: 0.3, bounce: 0 } as Transition,
};
