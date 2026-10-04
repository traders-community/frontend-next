"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  RiCloseLine,
  RiCheckLine,
  RiTelegramLine,
  RiShieldCheckLine,
  RiSparklingLine,
  RiUser3Line,
  RiMailLine,
  RiPhoneLine,
} from "@remixicon/react";
import { Product, ProductVariation, Order } from "@/types";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { modalBackdropVariants, modalCardVariants } from "@/lib/motion";

interface ProductQuickCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariation: ProductVariation;
}

export function ProductQuickCheckoutModal({
  isOpen,
  onClose,
  product,
  selectedVariation,
}: ProductQuickCheckoutModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Close modal on Escape key press & lock body scroll
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

  // Reset state on close
  const handleModalClose = () => {
    if (!submitting) {
      setCreatedOrder(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields (Name, Email, and Phone).");
      return;
    }

    try {
      setSubmitting(true);
      const res = await orderService.createPublicOrder({
        productId: product._id,
        variationId: selectedVariation._id || selectedVariation.id || "",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        telegramUsername: telegramUsername.trim() || undefined,
      });

      if (res.data?.success && res.data.order) {
        setCreatedOrder(res.data.order);
        toast.success("Order placed successfully! We will connect with you.");
      } else {
        toast.error(res.data?.message || "Failed to place order. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "An error occurred during checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  const discountPercent =
    selectedVariation.actualPrice > selectedVariation.sellingPrice
      ? Math.round(
          ((selectedVariation.actualPrice - selectedVariation.sellingPrice) /
            selectedVariation.actualPrice) *
            100
        )
      : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={handleModalClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
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
              onClick={handleModalClose}
              disabled={submitting}
              className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <RiCloseLine className="h-5 w-5" />
            </button>

            {createdOrder ? (
              /* Success / Order Confirmation View */
              <div className="text-center py-4 space-y-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  <RiCheckLine className="h-9 w-9" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-foreground font-heading">
                    Order Submitted!
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Thank you, <span className="font-semibold text-foreground">{createdOrder.firstName}</span>. Your subscription request has been received.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-border/80 bg-surface/70 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Order Reference</span>
                    <span className="font-mono font-bold text-foreground">
                      {createdOrder.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Product &amp; Plan</span>
                    <span className="font-semibold text-foreground truncate max-w-[200px]">
                      {createdOrder.productTitle} — {createdOrder.variationTitle}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Amount</span>
                    <span className="font-bold text-primary text-sm">
                      ₹{createdOrder.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-foreground/80 leading-relaxed text-left">
                  <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                    <RiShieldCheckLine className="h-4 w-4" />
                    <span>Next Steps for Instant Activation</span>
                  </div>
                  Our team has recorded your details. You will receive an email/SMS confirmation shortly with verification and private group invitation instructions.
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-black font-bold"
                    onClick={handleModalClose}
                  >
                    Got it, Thanks!
                  </Button>
                </div>
              </div>
            ) : (
              /* Checkout Form View */
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
                    <RiSparklingLine className="h-3.5 w-3.5" />
                    <span>Quick Checkout</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                    Confirm Subscription
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Complete your details below to activate your access.
                  </p>
                </div>

                {/* Product Summary Mini Card */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-border/80 bg-surface/60">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/80">
                    <Image
                      src={product.featuredImage}
                      alt={product.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-foreground/80 font-medium">
                        {selectedVariation.title}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {selectedVariation.sku}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-extrabold text-primary">
                      ₹{selectedVariation.sellingPrice.toLocaleString("en-IN")}
                    </div>
                    {selectedVariation.actualPrice > selectedVariation.sellingPrice && (
                      <div className="text-xs text-muted-foreground line-through">
                        ₹{selectedVariation.actualPrice.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkout Inputs Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        First Name <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <RiUser3Line className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-hidden focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Last Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-hidden focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Email Address <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@domain.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-hidden focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Phone Number <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <RiPhoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-hidden focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Telegram Username <span className="text-xs text-muted-foreground font-normal">(Optional for priority group access)</span>
                    </label>
                    <div className="relative">
                      <RiTelegramLine className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        placeholder="@username"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-hidden focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Pricing Total Row */}
                  <div className="pt-2 border-t border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Total Amount
                      </span>
                      <span className="text-xl font-extrabold text-foreground">
                        ₹{selectedVariation.sellingPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {discountPercent > 0 && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {discountPercent}% OFF Applied
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={submitting}
                    className="w-full text-black font-bold shadow-lg shadow-primary/20"
                  >
                    {submitting ? "Processing Checkout..." : `Confirm & Subscribe — ₹${selectedVariation.sellingPrice.toLocaleString("en-IN")}`}
                  </Button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
