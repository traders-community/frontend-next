"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiShieldCheckLine,
  RiArrowRightLine,
  RiArrowDownLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import { modalBackdropVariants, modalCardVariants } from "@/lib/motion";
import { useMounted } from "@/hooks/use-mounted";

const ACK_KEY = "tc_disclaimer_ack_v1";
const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const disclaimerPoints = [
  "Traders Community is NOT a SEBI-registered Investment Adviser (IA), Research Analyst (RA), Portfolio Manager, or any other SEBI-regulated intermediary.",
  "All content available on this website, including but not limited to market commentary, stock analysis, company reports, earnings summaries, financial data, charts, technical analysis, educational articles, model portfolios, watchlists, webinars, videos, PDFs, and other research materials, is provided solely for educational and informational purposes.",
  "Nothing published on this website should be construed as investment advice, trading advice, financial advice, a recommendation, solicitation, or an offer to buy or sell any security, derivative, commodity, mutual fund, or financial instrument.",
  "Any references to stocks, indices, sectors, market trends, trading opportunities, or investment strategies are intended only to illustrate market concepts and should not be treated as recommendations.",
  "Users are solely responsible for conducting their own research, due diligence, and risk assessment before making any investment or trading decisions.",
  "Trading and investing in financial markets involve substantial risk, including the possible loss of capital. Past performance, historical data, and market analysis do not guarantee future results.",
  "Traders Community, its owners, employees, affiliates, contributors, and representatives shall not be liable for any loss, damage, or consequences arising directly or indirectly from the use of information provided on this website.",
  'By clicking "I Understand & Continue," you acknowledge that you have read, understood, and agreed to this disclaimer and accept full responsibility for your investment and trading decisions.',
];

export function DisclaimerGate() {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checked, setChecked] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check localStorage safely after mounting on client (with 24h expiration)
  useEffect(() => {
    const timer = setTimeout(() => {
      let isAcknowledgedAndValid = false;

      try {
        const stored = localStorage.getItem(ACK_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed.timestamp === "number") {
              const elapsed = Date.now() - parsed.timestamp;
              if (elapsed < EXPIRATION_MS) {
                isAcknowledgedAndValid = true;
              }
            }
          } catch {
            isAcknowledgedAndValid = false;
          }
        }
      } catch {
        isAcknowledgedAndValid = false;
      }

      if (!isAcknowledgedAndValid) {
        setOpen(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Compulsory scroll check: triggered strictly on user scroll
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Must reach within 25px of bottom to unlock
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 25;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  // Lock background body scroll while the gate is active
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
    setHasScrolledToBottom(true);
  };

  const handleAccept = () => {
    if (!checked || !hasScrolledToBottom) return;

    try {
      const payload = {
        acknowledged: true,
        timestamp: Date.now(),
      };
      localStorage.setItem(ACK_KEY, JSON.stringify(payload));
    } catch {
      // Storage blocked fallback
    }

    setOpen(false);
  };

  const handleExit = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <AnimatePresence>
      {mounted && open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-hidden"
        >
          {/* Backdrop: Smooth Blur Fade */}
          <motion.div
            key="disclaimer-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            key="disclaimer-card"
            variants={modalCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 flex w-full max-w-2xl h-[88vh] sm:h-[82vh] max-h-[720px] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl shadow-black/60"
          >
            {/* Clean Header */}
            <div className="flex items-center gap-3 border-b border-border/70 bg-card/95 px-4 sm:px-6 py-3 sm:py-3.5 shrink-0">
              <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <RiShieldCheckLine className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  id="disclaimer-title"
                  className="text-sm sm:text-base font-bold text-foreground leading-snug"
                >
                  User Acknowledgement
                </h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">
                  Please review all 8 points before accessing Traders Community.
                </p>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              <div
                id="disclaimer-body"
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 sm:px-6 py-3.5 sm:py-4 space-y-3 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(16,185,129,0.35)_transparent]"
              >
                {/* 8 Intact Legal Points */}
                <div className="space-y-2">
                  {disclaimerPoints.map((point, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-border/60 bg-surface/30 hover:bg-surface/50 transition-colors flex items-start gap-2.5 sm:gap-3"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-[10px] sm:text-[11px] border border-primary/25 select-none mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-xs sm:text-[13px] text-foreground/90 leading-relaxed min-w-0 flex-1">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Fade Gradient */}
              <div
                aria-hidden="true"
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-card via-card/80 to-transparent transition-opacity duration-200",
                  hasScrolledToBottom ? "opacity-0" : "opacity-100"
                )}
              />

              {/* Calm Scroll Down Cue */}
              {!hasScrolledToBottom && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/95 border border-primary/40 text-primary text-[11px] font-semibold backdrop-blur-md shadow-md shadow-black/30 hover:bg-primary hover:text-black transition-all cursor-pointer"
                  >
                    <span>Scroll to bottom</span>
                    <RiArrowDownLine className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Compact Footer */}
            <div className="border-t border-border/70 bg-surface/60 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col gap-2.5 shrink-0">
              {/* Checkbox Acknowledgment (Unlocks when scrolled to bottom) */}
              <label
                htmlFor="disclaimer-ack"
                className={cn(
                  "flex items-start gap-2.5 select-none text-xs transition-opacity",
                  hasScrolledToBottom
                    ? "cursor-pointer text-foreground font-medium"
                    : "cursor-not-allowed text-muted-foreground/70 opacity-60"
                )}
              >
                <input
                  id="disclaimer-ack"
                  type="checkbox"
                  disabled={!hasScrolledToBottom}
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className={cn(
                    "mt-0.5 h-4 w-4 rounded border-border accent-primary shrink-0",
                    hasScrolledToBottom ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                />
                <span className="leading-snug text-[11px] sm:text-xs">
                 I have read and understood the disclaimer and acknowledge that Traders Community is not a SEBI-registered Investment Adviser or Research Analyst.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExit}
                  className="w-full sm:w-auto inline-flex h-9.5 sm:h-9 items-center justify-center rounded-xl border border-border/80 bg-card px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                >
                  Exit Website
                </button>

                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={!checked || !hasScrolledToBottom}
                  aria-disabled={!checked || !hasScrolledToBottom}
                  className={cn(
                    "w-full sm:w-auto inline-flex h-9.5 sm:h-9 items-center justify-center gap-1.5 rounded-xl px-5 text-xs font-semibold whitespace-nowrap transition-all",
                    checked && hasScrolledToBottom
                      ? "bg-primary text-black hover:bg-primary/90 shadow-md shadow-primary/20 cursor-pointer"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  )}
                >
                  <span>I Understand &amp; Continue</span>
                  <RiArrowRightLine className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DisclaimerGate;
