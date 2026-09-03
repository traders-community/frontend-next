"use client";

import React, { useState } from "react";
import { RiSendPlaneLine, RiCheckLine } from "@remixicon/react";
import { toast } from "react-toastify";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setIsSubmitting(true);

    try {
      // Simulate network request (or link to backend newsletter endpoint)
      await new Promise((resolve) => setTimeout(resolve, 600));

      setSubscribed(true);
      toast.success("Thank you for subscribing! You will receive our latest Nifty 500 reports.");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
        Never Miss Anything
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
        Subscribe to receive our latest updates.
      </p>

      {subscribed ? (
        <div className="flex items-center gap-2 mt-1 py-2 px-3.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold w-fit">
          <RiCheckLine className="h-4 w-4" />
          <span>You&apos;re subscribed! Thank you.</span>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="relative flex items-center mt-1 w-full max-w-md">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={isSubmitting}
            className="w-full h-11 pl-4 pr-28 rounded-full border border-border bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          />
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="absolute right-1 h-9 px-4 rounded-full bg-primary text-black text-xs font-semibold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 shadow-sm shadow-primary/20"
          >
            <span>{isSubmitting ? "..." : "Subscribe"}</span>
            <RiSendPlaneLine className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}

export default NewsletterForm;
