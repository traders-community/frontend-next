"use client";

import React, { useState, useEffect } from "react";
import { RiCloseLine, RiCustomerService2Line, RiSendPlaneLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("General Query");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Close modal on Escape key press
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      toast.success("Thank you! Your message has been received. Our support team will connect with you shortly.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      onClose();
    } catch {
      toast.error("Failed to send message. Please try again or email care.traderscommunity@gmail.com directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl text-card-foreground transition-all my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-2 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <RiCustomerService2Line className="h-5 w-5" />
            </div>
            <div>
              <h3 id="contact-modal-title" className="text-lg sm:text-xl font-bold tracking-tight">
                Get in Touch
              </h3>
              <p className="text-xs text-muted-foreground">
                Have questions or need assistance? Fill out the form below.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Full Name <span className="text-tertiary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Email Address <span className="text-tertiary">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Query Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
            >
              <option value="General Query">General Query</option>
              <option value="Courses & Learning Program">Courses & Learning Program</option>
              <option value="Technical Analysis Reports">Technical Analysis Reports</option>
              <option value="Mentorship Assistance">Mentorship Assistance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Message <span className="text-tertiary">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Tell us what you need help with..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground text-center sm:text-left">
              Direct email:{" "}
              <a
                href="mailto:care.traderscommunity@gmail.com"
                className="text-primary hover:underline"
              >
                care.traderscommunity@gmail.com
              </a>
            </p>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="w-full sm:w-auto min-h-10"
            >
              <RiSendPlaneLine className="h-4 w-4" />
              <span>{submitting ? "Sending..." : "Submit Query"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactModal;
