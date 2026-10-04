"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { RiFlashlightLine } from "@remixicon/react";
import { Product, ProductVariation } from "@/types";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

interface ProductStickyBarProps {
  product: Product;
  selectedVariation: ProductVariation;
  onOpenCheckout: () => void;
  triggerElementId?: string;
}

export function ProductStickyBar({
  product,
  selectedVariation,
  onOpenCheckout,
  triggerElementId = "main-buy-button",
}: ProductStickyBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    const handleScroll = () => {
      const triggerEl = document.getElementById(triggerElementId);
      if (triggerEl) {
        const rect = triggerEl.getBoundingClientRect();
        // Visible when main buy button has scrolled out above viewport
        setIsVisible(rect.bottom < 0);
      } else {
        // Fallback: visible after scrolling 450px
        setIsVisible(window.scrollY > 450);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const rafId = requestAnimationFrame(handleScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [triggerElementId]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 inset-x-0 z-[9999] bg-white dark:bg-[#070d1b] border-t border-border/80 dark:border-border/60 shadow-[0_-4px_25px_rgba(0,0,0,0.14)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.6)] py-3 px-4 sm:px-6"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Thumbnail & Essential Product Info */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/80 shadow-xs">
                <Image
                  src={product.featuredImage}
                  alt={product.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 truncate">
                    {selectedVariation.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Price & Subscribe CTA Button */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="text-right">
                <div className="text-base sm:text-lg font-extrabold text-foreground font-heading">
                  ₹{selectedVariation.sellingPrice.toLocaleString("en-IN")}
                </div>
                {selectedVariation.actualPrice > selectedVariation.sellingPrice && (
                  <div className="text-[11px] text-muted-foreground line-through">
                    ₹{selectedVariation.actualPrice.toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={onOpenCheckout}
                className="gap-2 text-black font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 cursor-pointer h-10 px-4 sm:px-6 rounded-xl transition-all"
              >
                <RiFlashlightLine className="h-4 w-4" />
                <span className="hidden sm:inline">Subscribe Now</span>
                <span className="sm:hidden">Subscribe</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
