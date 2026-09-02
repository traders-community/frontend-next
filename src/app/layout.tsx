import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { constructMetadata } from "@/lib/seo/metadata";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { GoogleAnalytics } from "@/components/common/google-analytics";
import { AppToastContainer } from "@/components/common/toast-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
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
      className={`${outfit.variable} h-full antialiased`}
    >
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-full font-sans bg-background text-foreground transition-colors duration-150 selection:bg-primary/20 selection:text-primary flex flex-col relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
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