"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "tertiary";
  size?: "sm" | "md" | "lg" | "icon";
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-secondary hover:bg-primary-hover shadow-sm shadow-primary/20",
  secondary:
    "bg-secondary text-white hover:bg-secondary-hover shadow-xs",
  outline:
    "border border-border bg-card text-foreground hover:bg-surface-hover hover:border-primary/40",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-hover",
  tertiary:
    "bg-tertiary text-white hover:bg-tertiary-hover shadow-xs",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "min-h-9 px-3.5 py-1.5 text-xs rounded-full",
  md: "min-h-11 px-6 py-2.5 text-sm rounded-full",
  lg: "min-h-12 px-8 py-3 text-base rounded-full",
  icon: "h-9 w-9 p-0 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none transition-colors duration-200";

    const combinedClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    const motionProps = !disabled
      ? {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.97 },
          transition: { duration: 0.14, ease: EASE.outCubic },
        }
      : {};

    if (href) {
      return (
        <motion.div
          className="inline-flex"
          {...motionProps}
        >
          <Link
            href={href}
            className={combinedClasses}
          >
            {children}
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        className={combinedClasses}
        {...motionProps}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
