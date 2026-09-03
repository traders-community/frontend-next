"use client";

import React, { useState } from "react";
import { RiArrowDownSLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "faq-1",
    question: "What is Trader’s Community?",
    answer:
      "Trader’s Community is a financial education and market research brand dedicated to helping traders and investors enhance their understanding of the Indian stock market through objective, data-driven analytical content.",
  },
  {
    id: "faq-2",
    question: "What kind of research do you publish?",
    answer:
      "We publish free analytical reports on companies within the Nifty 500 index. Our research covers fundamental business drivers, quarterly earnings breakdowns, valuation metrics, and balance sheet insights.",
  },
  {
    id: "faq-3",
    question: "What is covered in the derivatives learning channel?",
    answer:
      "Our learning channel focuses on derivatives market concepts, including futures mechanics, options pricing, volatility behavior, option Greeks, and systematic risk management frameworks.",
  },
  {
    id: "faq-4",
    question: "Are your research reports and blog articles free to read?",
    answer:
      "Yes. All analytical content, company reports, and educational articles on our website are 100% free and openly accessible to everyone.",
  },
  {
    id: "faq-5",
    question: "How can I access your structured courses or external catalogue?",
    answer:
      "You can visit our Explore page or check our official Graphy store to access structured video courses and comprehensive learning tracks.",
  },
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <div
            key={faq.id}
            className={cn(
              "rounded-2xl border transition-all duration-200 overflow-hidden",
              isOpen
                ? "border-primary/50 bg-card/95 shadow-md shadow-primary/5"
                : "border-border/80 bg-card/60 hover:border-border hover:bg-card/80"
            )}
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              aria-expanded={isOpen}
              aria-controls={`${faq.id}-content`}
              className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left select-none cursor-pointer"
            >
              <span className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                {faq.question}
              </span>
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface transition-transform duration-300 ease-in-out",
                  isOpen
                    ? "rotate-180 border-primary/40 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <RiArrowDownSLine className="h-4 w-4" />
              </div>
            </button>

            {/* Smooth CSS Grid Height Physics Animation */}
            <div
              id={`${faq.id}-content`}
              role="region"
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FaqAccordion;
