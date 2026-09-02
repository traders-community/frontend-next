
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = constructMetadata({
  title: "About Us",
  description:
    "Learn about Traders Community — our mission to empower traders and investors with stock market education, Nifty 500 research, and derivatives trading strategies.",
  canonicalUrl: "/about",
});

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
        About Traders Community
      </h1>
      <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">
        Trader’s Community is a financial education and market research brand dedicated to helping traders and investors enhance their understanding of the Indian stock market.
      </p>
    </div>
  );
}