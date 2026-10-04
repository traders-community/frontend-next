"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  RiCloseLine,
  RiStarFill,
  RiStarLine,
  RiSendPlaneLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { modalBackdropVariants, modalCardVariants } from "@/lib/motion";
import { productReviewService } from "@/services/product-review.service";
import { useMounted } from "@/hooks/use-mounted";

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  onSuccess?: () => void;
}

export function ProductReviewModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  onSuccess,
}: ProductReviewModalProps) {
  const mounted = useMounted();
  const [rating, setRating] = useState(5.0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Close modal on Escape key & lock body scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your purchase email.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write your review.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await productReviewService.submitProductReview(productId, {
        name: name.trim(),
        email: email.trim(),
        rating,
        comment: comment.trim(),
      });

      if (res.data?.success) {
        toast.success(
          res.data.message ||
            "Thank you! Your verified review has been submitted for approval."
        );
        setName("");
        setEmail("");
        setComment("");
        setRating(5.0);
        onClose();
        onSuccess?.();
      } else {
        toast.error(res.data?.message || "Failed to submit review.");
      }
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            key="review-modal-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            key="review-modal-card"
            variants={modalCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-auto overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={submitting}
              className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <RiCloseLine className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6 pr-8">
              <h3
                id="review-modal-title"
                className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-heading"
              >
                Write a Review
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                {productTitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Overall Rating */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Overall Rating <span className="text-primary">*</span>
                </label>

                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const effective = hoverRating || rating;
                      const fill = Math.max(
                        0,
                        Math.min(100, Math.round((effective - (star - 1)) * 100))
                      );

                      return (
                        <div
                          key={star}
                          className="relative h-8 w-8 cursor-pointer select-none"
                        >
                          {/* Empty star outline */}
                          <RiStarLine className="absolute inset-0 h-8 w-8 text-muted-foreground/30 pointer-events-none" />

                          {/* Partial or full filled star */}
                          {fill > 0 && (
                            <div
                              className="absolute inset-0 overflow-hidden text-amber-400 fill-amber-400 pointer-events-none"
                              style={{ width: `${fill}%` }}
                            >
                              <RiStarFill className="h-8 w-8 text-amber-400 fill-amber-400" />
                            </div>
                          )}

                          {/* Left half clickable area (star - 0.5) */}
                          <button
                            type="button"
                            onClick={() => setRating(star - 0.5)}
                            onMouseEnter={() => setHoverRating(star - 0.5)}
                            className="absolute inset-y-0 left-0 w-1/2 cursor-pointer z-10 opacity-0"
                            aria-label={`Rate ${star - 0.5} stars`}
                          />

                          {/* Right half clickable area (star) */}
                          <button
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            className="absolute inset-y-0 right-0 w-1/2 cursor-pointer z-10 opacity-0"
                            aria-label={`Rate ${star} stars`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <span className="text-sm font-bold text-foreground">
                    {(hoverRating || rating).toFixed(1)} out of 5 Stars
                  </span>
                </div>
              </div>

              {/* 2 & 3. Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Your Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-hidden focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Email Address <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-hidden focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* 4. Review */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Your Review <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you learn? How has this helped your trading journey?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-hidden focus:border-primary transition-colors resize-y"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting}
                  className="text-black font-semibold gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
                >
                  <RiSendPlaneLine className="h-4 w-4" />
                  <span>{submitting ? "Submitting..." : "Submit Review"}</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ProductReviewModal;
