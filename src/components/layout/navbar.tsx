"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  RiMenuLine,
  RiCloseLine,
  RiCustomerService2Line,
  RiArrowRightUpLine,
} from "@remixicon/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/common/contact-modal";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Threshold for activating sticky pill mode
      setIsScrolled(window.scrollY > 25);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Explore", href: "/explore" },
    { label: "Graphy", href: "https://traderscommunity.graphy.com/" }
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 ease-in-out",
          isScrolled ? "pt-3 sm:pt-4 px-4 sm:px-6" : "pt-4 pb-2 px-4 sm:px-6"
        )}
      >
        <nav
          aria-label="Main Navigation"
          className={cn(
            "transition-all duration-300 ease-in-out flex items-center justify-between mx-auto",
            isScrolled
              ? "max-w-4xl lg:max-w-5xl rounded-full bg-card/85 backdrop-blur-md border border-border/80 shadow-lg shadow-black/5 dark:shadow-black/25 px-5 py-2.5 sm:px-6"
              : "w-full max-w-7xl bg-transparent border-transparent py-2 px-1 sm:px-2"
          )}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer relative z-10 shrink-0"
            aria-label="Traders Community Home"
          >
            {/* Light Mode Logo */}
            <Image
              src="/logo_black.png"
              alt="Traders Community Logo"
              width={180}
              height={50}
              priority
              className={cn(
                "w-auto object-contain transition-all duration-200 group-hover:scale-[1.03] pointer-events-none dark:hidden",
                isScrolled ? "h-7" : "h-8 sm:h-9 md:h-8"
              )}
            />
            {/* Dark Mode Logo */}
            <Image
              src="/logo.png"
              alt="Traders Community Logo"
              width={180}
              height={50}
              priority
              className={cn(
                "w-auto object-contain transition-all duration-200 group-hover:scale-[1.03] pointer-events-none hidden dark:block",
                isScrolled ? "h-7" : "h-8 sm:h-9 md:h-8"
              )}
            />
          </Link>

          {/* Desktop Navigation Links (Simple Text Links) */}
          <div className="hidden md:flex items-center gap-7 lg:gap-8">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http://") || link.href.startsWith("https://");
              const isActive = !isExternal && pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors duration-150 cursor-pointer inline-flex items-center gap-1",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-foreground/80 hover:text-primary"
                  )}
                >
                  <span>{link.label}</span>
                  {isExternal && (
                    <RiArrowRightUpLine className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Side Controls */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => setContactOpen(true)}
              variant="primary"
              size="sm"
            >
              <RiCustomerService2Line className="h-4 w-4" />
              <span>Support</span>
            </Button>
          </div>

          {/* Mobile Right Controls: Dark/Light Mode Switcher beside Hamburger */}
          <div className="flex md:hidden items-center gap-1.5">
            <ThemeToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:text-primary hover:bg-surface-hover/60 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <RiCloseLine className="h-6 w-6" />
              ) : (
                <RiMenuLine className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel: Positioned absolutely on top of content (no content push down, no background blur) */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 z-50 w-full px-4 pt-2">
            <div className="max-w-7xl mx-auto rounded-2xl border border-border bg-card p-3 shadow-2xl text-card-foreground transition-all flex flex-col gap-1">
              {navLinks.map((link) => {
                const isExternal = link.href.startsWith("http://") || link.href.startsWith("https://");
                const isActive = !isExternal && pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 text-base font-medium rounded-xl transition-colors",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-foreground/80 hover:text-primary hover:bg-surface-hover/60"
                    )}
                  >
                    <span>{link.label}</span>
                    {isExternal && (
                      <RiArrowRightUpLine className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Link>
                );
              })}

              {/* Support as a normal link item on mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactOpen(true);
                }}
                className="text-left px-3.5 py-2.5 text-base font-medium rounded-xl text-foreground/80 hover:text-primary hover:bg-surface-hover/60 transition-colors cursor-pointer"
              >
                Support
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Support / Contact Modal Form */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </>
  );
}

export default Navbar;
