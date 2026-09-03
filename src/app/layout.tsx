import type { Metadata } from "next";
import { IBM_Plex_Sans, Manrope, Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { constructMetadata } from "@/lib/seo/metadata";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { GoogleAnalytics } from "@/components/common/google-analytics";
import { AppToastContainer } from "@/components/common/toast-provider";
import { ScrollToTop } from "@/components/common/scroll-to-top";
import { DisclaimerGate } from "@/components/common/disclaimer-gate";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmPlexSans.variable} ${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/icon.png?v=2" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/icon.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png?v=2" />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-full font-sans bg-background text-foreground transition-colors duration-150 selection:bg-primary/20 selection:text-primary flex flex-col relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <DisclaimerGate />
          <ScrollToTop />
          <Navbar />
          <main className="flex-1 relative z-10">
            {children}
          </main>
          <Footer />
          <AppToastContainer />
        </ThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}