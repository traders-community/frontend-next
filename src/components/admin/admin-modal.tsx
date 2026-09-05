"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RiCloseLine, RiExternalLinkLine } from "@remixicon/react";
import { ConfirmationModal } from "./confirmation-modal";
import { cn } from "@/lib/utils";

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  externalHref?: string;
  externalTitle?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  children: React.ReactNode;
  isDirty?: boolean;
  discardTitle?: string;
  discardDescription?: string;
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  externalHref,
  externalTitle = "Open in separate page",
  size = "2xl",
  children,
  isDirty = false,
  discardTitle = "Discard unsaved changes?",
  discardDescription = "You have unsaved changes in this form. Are you sure you want to close? Any unsaved input will be lost.",
}: AdminModalProps) {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Handle request to close
  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Confirm discard
  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen && !showDiscardConfirm) {
        if (isDirty) {
          setShowDiscardConfirm(true);
        } else {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showDiscardConfirm, isDirty, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
    "2xl": "max-w-3xl",
    "3xl": "max-w-4xl",
    "4xl": "max-w-5xl",
  }[size];

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={handleRequestClose}
      >
        {/* Backdrop Overlay - Clicking outside requests close */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal Window Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative w-full max-h-[90vh] flex flex-col bg-card text-card-foreground border border-border/80 rounded-2xl sm:rounded-3xl shadow-2xl z-40 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200",
            sizeClasses
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 shrink-0 bg-card/80 backdrop-blur-sm">
            <div className="min-w-0 pr-4">
              <h2
                id="admin-modal-title"
                className="text-lg sm:text-xl font-bold text-foreground truncate"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Header Right Action Icons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* External Full Page Link Button */}
              {externalHref && (
                <Link
                  href={externalHref}
                  title={externalTitle}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors"
                >
                  <RiExternalLinkLine className="h-5 w-5" />
                </Link>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={handleRequestClose}
                title="Close modal"
                aria-label="Close modal"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors cursor-pointer"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>
        </div>
      </div>

      {/* Confirmation Modal when user closes with unsaved changes */}
      <ConfirmationModal
        isOpen={showDiscardConfirm}
        title={discardTitle}
        description={discardDescription}
        confirmText="Discard & Close"
        cancelText="Keep Editing"
        confirmVariant="warning"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>
  );
}

export default AdminModal;
