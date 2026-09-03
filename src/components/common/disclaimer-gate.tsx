"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  RiErrorWarningLine,
  RiArrowRightLine,
  RiArrowDownLine,
  RiCheckLine,
  RiInformationLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";

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
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checked, setChecked] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check localStorage safely after mounting on client (with 24h expiration)
  useEffect(() => {
    setMounted(true);
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
          // If stored is legacy plain "true" without timestamp, require fresh acknowledgment
          isAcknowledgedAndValid = false;
        }
      }
    } catch {
      // Storage blocked / private mode — show gate to ensure compliance
      isAcknowledgedAndValid = false;
    }

    if (!isAcknowledgedAndValid) {
      setOpen(true);
    }
  }, []);

  // Check if content naturally fits or if user has scrolled to the bottom
  const checkScrollPosition = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // If container fits without scrolling, or user scrolled within 30px of bottom
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 30;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  // Run scroll check after modal renders
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        checkScrollPosition();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

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
      // Ignore storage errors (private browsing) — allow session access
    }

    setOpen(false);
  };

  const handleExit = () => {
    // Navigate away from the website
    window.location.replace("https://www.google.com");
  };

  // Prevent SSR hydration mismatch
  if (!mounted || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-body"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="flex w-full max-w-2xl h-[88vh] sm:h-[84vh] max-h-[760px] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/40 bg-card text-foreground shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-150">
        {/* Compact Header */}
        <div className="flex items-center gap-3 border-b border-border/80 bg-surface/60 px-4 py-3 sm:px-6 sm:py-3.5 shrink-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 dark:bg-primary/15 dark:text-primary dark:border-primary/30">
            <RiErrorWarningLine className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="disclaimer-title"
              className="text-sm sm:text-base font-bold text-foreground leading-tight truncate"
            >
              Regulatory Disclaimer &amp; User Acknowledgement
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              Please review all 8 compliance points before proceeding.
            </p>
          </div>
        </div>

        {/* Maximized Scrollable Body */}
        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
          <div
            id="disclaimer-body"
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex-1 overflow-y-auto px-4 py-3.5 sm:px-6 sm:py-4 text-xs sm:text-sm leading-relaxed overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(16,185,129,0.35)_transparent]"
          >
            {/* Compact Welcome Line */}
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              <span className="font-semibold text-primary">Welcome to Traders Community.</span> Before accessing our research and content, please review and acknowledge the following regulatory declarations:
            </p>

            {/* 8 Compliance Points */}
            <ol className="space-y-2.5 sm:space-y-3">
              {disclaimerPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-[11px] text-primary border border-primary/30 mt-0.5 select-none">
                    {index + 1}
                  </span>
                  <span className="text-foreground/90 leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-[11px] sm:text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-3 pb-1">
              By proceeding, you confirm that you understand the risks associated with financial markets and agree to use all materials solely for educational and informational purposes.
            </p>
          </div>

          {/* Bottom Gradient Fade (Indicates content extends below) */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t from-card via-card/80 to-transparent transition-opacity duration-200",
              hasScrolledToBottom ? "opacity-0" : "opacity-100"
            )}
          />

          {/* Calm Static Indicator Pill (Zero Bouncing / No Jumpy Animations) */}
          {!hasScrolledToBottom && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
              <button
                type="button"
                onClick={scrollToBottom}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/95 border border-primary/40 text-primary text-[11px] font-medium backdrop-blur-md shadow-md shadow-black/20 hover:bg-primary hover:text-black transition-colors cursor-pointer"
              >
                <span>Scroll down for more points</span>
                <RiArrowDownLine className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Compact Footer with Notice, Checkbox & Actions */}
        <div className="border-t border-border/80 bg-surface/70 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col gap-2.5 shrink-0">
          {/* Scroll Status Notice */}
          {!hasScrolledToBottom ? (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-500">
              <RiInformationLine className="h-3.5 w-3.5 shrink-0" />
              <span>Please scroll to the bottom of the disclaimer to enable the checkbox.</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
              <RiCheckLine className="h-3.5 w-3.5 shrink-0" />
              <span>All 8 points reviewed. Please confirm your acknowledgement below.</span>
            </div>
          )}

          {/* Checkbox (Disabled until scrolled to bottom) */}
          <label
            htmlFor="disclaimer-ack"
            className={cn(
              "flex items-start gap-2.5 select-none text-xs transition-opacity",
              hasScrolledToBottom
                ? "cursor-pointer text-foreground/90 font-medium"
                : "cursor-not-allowed text-muted-foreground/60 opacity-60"
            )}
          >
            <input
              id="disclaimer-ack"
              type="checkbox"
              disabled={!hasScrolledToBottom}
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary",
                hasScrolledToBottom ? "cursor-pointer" : "cursor-not-allowed"
              )}
            />
            <span className="leading-snug">
              I have read, understood, and agreed to the disclaimer above. I acknowledge that Traders Community is not a SEBI-registered Investment Adviser or Research Analyst.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleExit}
              className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-card px-4 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <span>Exit Website</span>
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={!checked || !hasScrolledToBottom}
              aria-disabled={!checked || !hasScrolledToBottom}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-5 text-xs font-semibold transition-all duration-150",
                checked && hasScrolledToBottom
                  ? "bg-primary text-black hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98] shadow-md shadow-primary/25 cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              )}
            >
              <span>I Understand &amp; Continue</span>
              <RiArrowRightLine className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerGate;
