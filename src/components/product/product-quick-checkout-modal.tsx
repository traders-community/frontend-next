"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  RiLockLine,
  RiRefreshLine,
} from "@remixicon/react";
import { Product, ProductVariation, RazorpaySuccessResponse } from "@/types";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { modalBackdropVariants, modalCardVariants } from "@/lib/motion";
import { loadRazorpayScript } from "@/lib/razorpay";

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
  const router = useRouter();

  // Customer Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");

  // Email OTP Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Payment Processing State
  const [processingPayment, setProcessingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Close modal on Escape key press & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !processingPayment && !verifyingPayment) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, processingPayment, verifyingPayment]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle email changes (resets verification if email is edited)
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (isEmailVerified) {
      setIsEmailVerified(false);
      setEmailVerificationToken("");
      setOtpSent(false);
      setOtpCode("");
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address first.");
      return;
    }

    try {
      setSendingOtp(true);
      const res = await orderService.sendOtp(email.trim());
      if (res.data?.success) {
        setOtpSent(true);
        setCountdown(60);
        toast.success(res.data.message || "OTP code sent to your email!");
      } else {
        toast.error(res.data?.message || "Failed to send OTP code.");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Error sending verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = await orderService.verifyOtp(email.trim(), otpCode.trim());
      if (res.data?.success && res.data.emailVerificationToken) {
        setIsEmailVerified(true);
        setEmailVerificationToken(res.data.emailVerificationToken);
        setOtpSent(false);
        toast.success("Email verified successfully! You can now proceed to payment.");
      } else {
        toast.error(res.data?.message || "Invalid or expired verification code.");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to verify code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Proceed to Payment & Trigger Razorpay Modal
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all required customer details.");
      return;
    }

    if (!isEmailVerified || !emailVerificationToken) {
      toast.error("Please verify your email address with OTP before proceeding to payment.");
      return;
    }

    try {
      setProcessingPayment(true);

      // 1. Ensure Razorpay script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.warn("Razorpay script could not load directly. Attempting payment gateway connection...");
      }

      // 2. Create Order on Backend
      const orderRes = await orderService.createRazorpayOrder({
        productId: product._id,
        variationId: selectedVariation._id || selectedVariation.id || "",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        telegramUsername: telegramUsername.trim() || undefined,
        emailVerificationToken,
      });

      if (!orderRes.data?.success || !orderRes.data.orderNumber) {
        toast.error(orderRes.data?.message || "Failed to initialize order.");
        setProcessingPayment(false);
        return;
      }

      const orderData = orderRes.data;
      const razorpayKey =
        orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

      // 3. Check for window.Razorpay instance
      const RazorpayConstructor = (window as unknown as { Razorpay: unknown }).Razorpay as
        | (new (options: unknown) => { open: () => void })
        | undefined;

      // Handle Live or Sandbox Razorpay Modal
      if (RazorpayConstructor && razorpayKey && !razorpayKey.includes("placeholder")) {
        const options = {
          key: razorpayKey,
          amount: orderData.amountInPaise,
          currency: orderData.currency || "INR",
          name: "Trader's Community",
          description: `${product.title} — ${selectedVariation.title}`,
          image: "/icon.png",
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: `${firstName} ${lastName}`.trim(),
            email: email.trim(),
            contact: phone.trim(),
          },
          theme: {
            color: "#00c950",
            backdrop_color: "rgba(8, 14, 30, 0.8)",
          },
          modal: {
            ondismiss: () => {
              setProcessingPayment(false);
              toast.info("Payment window dismissed. Your order details are saved.");
            },
          },
          handler: async (response: RazorpaySuccessResponse) => {
            try {
              setVerifyingPayment(true);
              const verifyRes = await orderService.verifyRazorpayPayment({
                orderNumber: orderData.orderNumber,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.data?.success) {
                toast.success("Payment verified! Directing to access portal...");
                onClose();
                router.push(`/order/success/${orderData.orderNumber}`);
              } else {
                toast.error(verifyRes.data?.message || "Payment verification failed.");
              }
            } catch (err: unknown) {
              const error = err as { message?: string };
              toast.error(error.message || "Payment verification error.");
            } finally {
              setVerifyingPayment(false);
              setProcessingPayment(false);
            }
          },
        };

        const rzp = new RazorpayConstructor(options);
        rzp.open();
      } else {
        // Fallback for Development & Sandbox testing when placeholder keys are active
        toast.info("Simulating secure test payment verification...");
        const verifyRes = await orderService.verifyRazorpayPayment({
          orderNumber: orderData.orderNumber,
          razorpayOrderId: orderData.razorpayOrderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: "mock_signature_test",
        });

        if (verifyRes.data?.success) {
          toast.success("Test order activated! Redirecting to confirmation page...");
          onClose();
          router.push(`/order/success/${orderData.orderNumber}`);
        } else {
          toast.error(verifyRes.data?.message || "Test order processing failed.");
        }
        setProcessingPayment(false);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "An error occurred during checkout.");
      setProcessingPayment(false);
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
            onClick={() => {
              if (!processingPayment && !verifyingPayment) onClose();
            }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
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
              onClick={onClose}
              disabled={processingPayment || verifyingPayment}
              className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close modal"
            >
              <RiCloseLine className="h-5 w-5" />
            </button>

            {/* Checkout Form View */}
            <div className="space-y-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
                  <RiSparklingLine className="h-3.5 w-3.5" />
                  <span>Verified Instant Access</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                  Quick Checkout
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Confirm your details and verify your email to unlock VIP Telegram access.
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
              <form onSubmit={handleProceedToPayment} className="space-y-4">
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

                {/* Email with Inline OTP Verification */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-foreground">
                      Email Address <span className="text-primary">*</span>
                    </label>
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <RiCheckLine className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        OTP verification required
                      </span>
                    )}
                  </div>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="you@domain.com"
                        disabled={isEmailVerified}
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-hidden transition-colors ${
                          isEmailVerified
                            ? "bg-surface/50 border-emerald-500/30 text-emerald-400"
                            : "bg-surface border-border focus:border-primary"
                        }`}
                      />
                    </div>

                    {!isEmailVerified && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        disabled={sendingOtp || !email.trim()}
                        onClick={handleSendOtp}
                        className="shrink-0 text-xs px-3.5 font-semibold"
                      >
                        {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Verify Email"}
                      </Button>
                    )}
                  </div>

                  {/* Inline OTP Input Box */}
                  {otpSent && !isEmailVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground/90 font-medium">
                          Enter 6-Digit Code sent to inbox:
                        </span>
                        {countdown > 0 ? (
                          <span className="text-muted-foreground font-mono">
                            Resend in {countdown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="text-primary hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                          >
                            <RiRefreshLine className="h-3 w-3" /> Resend Code
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                          className="flex-1 px-3 py-2 text-center tracking-[6px] font-mono font-bold text-base rounded-lg border border-border bg-surface text-foreground focus:outline-hidden focus:border-primary"
                        />
                        <Button
                          type="button"
                          variant="primary"
                          size="md"
                          disabled={verifyingOtp || otpCode.length !== 6}
                          onClick={handleVerifyOtp}
                          className="text-black font-bold text-xs px-4"
                        >
                          {verifyingOtp ? "Verifying..." : "Confirm OTP"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Telegram Username <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
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
                </div>

                {/* Pricing Total Row */}
                <div className="pt-2 border-t border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Payable Amount
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

                {/* Security Guarantee Note */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-surface/50 p-2.5 rounded-xl border border-border/60">
                  <RiShieldCheckLine className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Secured by Razorpay. Official single-use Telegram link issued immediately.
                  </span>
                </div>

                {/* Submit / Proceed to Payment Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={processingPayment || verifyingPayment || !isEmailVerified}
                  className="w-full text-black font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {processingPayment || verifyingPayment ? (
                    <>
                      <RiLockLine className="h-4 w-4 animate-spin" />
                      <span>
                        {verifyingPayment
                          ? "Activating Subscription..."
                          : "Opening Payment Gateway..."}
                      </span>
                    </>
                  ) : !isEmailVerified ? (
                    <>
                      <RiLockLine className="h-4 w-4" />
                      <span>Verify Email to Unlock Payment</span>
                    </>
                  ) : (
                    <>
                      <RiLockLine className="h-4 w-4" />
                      <span>
                        Pay ₹{selectedVariation.sellingPrice.toLocaleString("en-IN")} &amp; Join
                      </span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
