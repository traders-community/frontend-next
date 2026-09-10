import type { Variants, Transition } from "motion/react";

/**
 * Standardized easing curves tailored for high-performance, polished web interactions.
 */
export const EASE = {
  outCubic: [0.22, 1, 0.36, 1] as const,
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOutCubic: [0.65, 0, 0.35, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
};

/**
 * Reusable physics and easing presets.
 * Durations adjusted for a more graceful, intentional, and visible feel (+100-200ms).
 */
export const TRANSITIONS: Record<string, Transition> = {
  snappySpring: {
    type: "spring",
    stiffness: 380,
    damping: 30,
    mass: 0.9,
  },
  gentleSpring: {
    type: "spring",
    stiffness: 240,
    damping: 24,
  },
  smooth: {
    duration: 0.44,
    ease: EASE.outCubic,
  },
  fast: {
    duration: 0.28,
    ease: EASE.outCubic,
  },
  page: {
    duration: 0.36,
    ease: EASE.outCubic,
  },
  modal: {
    duration: 0.42,
    ease: EASE.outExpo,
  },
};

/**
 * Standardized production-level animation variants.
 * Slowed down by ~150-180ms for an elegant, premium feel.
 */
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.38, ease: EASE.outCubic },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.24, ease: EASE.smooth },
  },
};

export const fadeInUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.46, ease: EASE.outCubic },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.26, ease: EASE.smooth },
  },
};

export const fadeInDownVariants: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: EASE.outCubic },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.24, ease: EASE.smooth },
  },
};

export const scaleFadeVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.38, ease: EASE.outExpo },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.22, ease: EASE.smooth },
  },
};

/**
 * Container variants for staggered child entrances (e.g. grids and lists).
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: EASE.outCubic },
  },
};

/**
 * Modal dialog variants:
 * - Backdrop: Clean fade in/out
 * - Card: Elegant fade-in-up with slight scale
 */
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.32, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

export const modalCardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE.outCubic },
  },
  exit: {
    opacity: 0,
    y: 14,
    transition: { duration: 0.22, ease: EASE.smooth },
  },
};

/**
 * Dropdown menu variants (e.g. navbar mobile menu, popovers).
 */
export const dropdownMenuVariants: Variants = {
  initial: { opacity: 0, y: -8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: EASE.outCubic },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: EASE.smooth },
  },
};

/**
 * Accordion content collapse/expand animation variants.
 */
export const accordionVariants: Variants = {
  initial: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  animate: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.38, ease: EASE.outCubic },
      opacity: { duration: 0.26, delay: 0.06 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: EASE.outCubic },
      opacity: { duration: 0.18 },
    },
  },
};

/**
 * Clean subtle crossfade for page transitions without moving the whole page container.
 */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: EASE.outCubic },
  },
};

/**
 * Tactile micro-interaction presets.
 */
export const microInteractions = {
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.97 },
    transition: { duration: 0.16, ease: EASE.outCubic },
  },
  pill: {
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.96 },
    transition: { duration: 0.14, ease: EASE.outCubic },
  },
  card: {
    whileHover: { y: -5 },
    transition: { duration: 0.28, ease: EASE.outCubic },
  },
  icon: {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 },
    transition: { duration: 0.14 },
  },
};
