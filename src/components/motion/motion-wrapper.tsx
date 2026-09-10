"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import {
  staggerContainerVariants,
  staggerItemVariants,
  pageTransitionVariants,
  EASE,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

interface FadeInProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Scroll or Mount Entrance component.
 * Triggers ONLY when scrolled into the viewport (margin: "-60px", once: true).
 * Duration is slowed down by 150-200ms (default 0.48s) for a visible, graceful entrance.
 */
export function FadeIn({
  direction = "up",
  delay = 0,
  duration = 0.48,
  distance = 20,
  once = true,
  className,
  children,
  ...props
}: FadeInProps) {
  let initial = { opacity: 0, y: 0 };
  if (direction === "up") initial = { opacity: 0, y: distance };
  if (direction === "down") initial = { opacity: 0, y: -distance };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration,
        delay,
        ease: EASE.outCubic,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
  delayChildren?: number;
  once?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Container component to stagger entrance of child items when scrolled into view.
 */
export function StaggerContainer({
  staggerDelay = 0.08,
  delayChildren = 0.05,
  once = true,
  className,
  children,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once, margin: "-50px" }}
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  className?: string;
  children: React.ReactNode;
}

/**
 * Child item inside a StaggerContainer.
 */
export function StaggerItem({
  className,
  children,
  ...props
}: StaggerItemProps) {
  return (
    <motion.div
      variants={staggerItemVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface PageTransitionProps extends HTMLMotionProps<"div"> {
  className?: string;
  children: React.ReactNode;
}

/**
 * Clean subtle page transition wrapper.
 */
export function PageTransition({
  className,
  children,
  ...props
}: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageTransitionVariants}
      className={cn("w-full flex-1", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
