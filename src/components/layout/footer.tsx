import React from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/seo.config";
import {
  RiInstagramLine,
  RiTelegramLine,
  RiWhatsappLine,
  RiTwitterXLine,
  RiMailLine,
} from "@remixicon/react";

import { NewsletterForm } from "@/components/common/newsletter-form";

export function Footer() {
  return (
    <footer className="w-full bg-transparent text-foreground/80 py-10 sm:py-14 transition-colors relative z-10">
      <div className="container max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-stretch">
          {/* Left Column: Brand, Mission & Contact */}
          <div className="flex flex-col justify-between gap-6 h-full">
            <div className="flex flex-col gap-4 max-w-xl">
              <Link href="/" className="inline-block" aria-label="Traders Community">
                {/* Light Mode Logo */}
                <Image
                  src="/logo_black.png"
                  alt="Traders Community Logo"
                  width={170}
                  height={45}
                  className="h-8 sm:h-10 w-auto object-contain dark:hidden"
                />
                {/* Dark Mode Logo */}
                <Image
                  src="/logo.png"
                  alt="Traders Community Logo"
                  width={170}
                  height={45}
                  className="h-8 sm:h-10 w-auto object-contain hidden dark:block"
                />
              </Link>

              <div className="text-xs sm:text-sm leading-relaxed text-muted-foreground space-y-2.5">
                <p className="font-semibold text-foreground">Trader’s Community</p>
                <p>
                  Trader’s Community is a financial education and market research brand dedicated to helping traders and investors enhance their understanding of the Indian stock market. We publish free analytical content and reports on companies within the Nifty 500 index, along with a premium learning channel focused on derivatives market concepts and strategies.
                </p>
                <p>
                  Disclaimer: Trader’s Community is not registered with SEBI. All content is shared for educational purposes only and should not be considered investment advice.
                </p>
              </div>
            </div>

            <div className="pt-1 mt-auto">
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary-hover font-medium transition-colors"
              >
                <RiMailLine className="h-4 w-4" />
                <span>{siteConfig.email}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Social Links, Newsletter & Copyright */}
          <div className="flex flex-col justify-between gap-6 h-full">
            {/* Connect With Us (Above) */}
            <div className="flex flex-col gap-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Connect With Us
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href={siteConfig.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/80 hover:text-primary hover:border-primary/40 hover:bg-surface-hover transition-all"
                >
                  <RiInstagramLine className="h-5 w-5" />
                </a>

                <a
                  href={siteConfig.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/80 hover:text-primary hover:border-primary/40 hover:bg-surface-hover transition-all"
                >
                  <RiTelegramLine className="h-5 w-5" />
                </a>

                <a
                  href={siteConfig.socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/80 hover:text-primary hover:border-primary/40 hover:bg-surface-hover transition-all"
                >
                  <RiWhatsappLine className="h-5 w-5" />
                </a>

                <a
                  href={siteConfig.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X / Twitter"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/80 hover:text-primary hover:border-primary/40 hover:bg-surface-hover transition-all"
                >
                  <RiTwitterXLine className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Newsletter Form (Below) */}
            <div className="w-full">
              <NewsletterForm />
            </div>

            {/* Copyright */}
            <div className="text-xs text-muted-foreground mt-auto pt-1">
              <p>All rights reserved © {new Date().getFullYear()} Trader’s Community.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
