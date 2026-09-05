"use client";

import React, { useEffect } from "react";
import { RiAlertFill, RiDeleteBinLine, RiCloseLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop overlay - Notice: clicking backdrop does NOT dismiss dialog to prevent accidental clicks */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-card text-card-foreground border border-border/80 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-7 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Close Button on Top Right */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <RiCloseLine className="h-5 w-5" />
        </button>

        {/* Icon & Content */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-2xl shrink-0",
              confirmVariant === "danger"
                ? "bg-red-500/10 text-red-500 dark:bg-red-500/15"
                : confirmVariant === "warning"
                ? "bg-amber-500/10 text-amber-500 dark:bg-amber-500/15"
                : "bg-primary/10 text-primary dark:bg-primary/15"
            )}
          >
            {confirmVariant === "danger" ? (
              <RiDeleteBinLine className="h-6 w-6" />
            ) : (
              <RiAlertFill className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3
              id="confirm-dialog-title"
              className="text-base sm:text-lg font-bold text-foreground leading-tight"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-foreground bg-surface hover:bg-surface/80 border border-border/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs disabled:opacity-50",
              confirmVariant === "danger"
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                : confirmVariant === "warning"
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                : "bg-primary hover:bg-primary-hover text-white shadow-primary/20"
            )}
          >
            {isLoading && (
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
