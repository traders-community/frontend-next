const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://frontend-next-one-sigma.vercel.app";

export const siteConfig = {
  name: "Traders Community",
  shortName: "TC",
  tagline: "Enhancing market understanding through data-driven research and education.",
  description:
    "Traders Community is a financial education and market research brand dedicated to helping traders and investors enhance their understanding of the Indian stock market through free analytical content and educational resources.",
  url: siteUrl,
  ogImage: "/featured_img.jpg",
  locale: "en_IN",
  author: "Traders Community",
  email: "care.traderscommunity@gmail.com",
  twitterHandle: "@TradersComm",
  socialLinks: {
    instagram: "https://www.instagram.com/traders.community_?igsh=cTFoaTFycXpiZHY2",
    telegram: "https://t.me/TCfxmain",
    whatsapp: "https://chat.whatsapp.com/HEKkj5Ecjq04M0aaojlbe2?mode=ems_wa_t",
    twitter: "https://twitter.com",
  },
  keywords: [
    "Traders Community",
    "Indian Stock Market",
    "Nifty 500 Analysis",
    "Technical Analysis",
    "Derivatives Trading",
    "Stock Market Courses",
    "Trading Education",
    "Financial Research",
    "Options Trading India",
  ],
  disclaimer:
    "Trader’s Community and its team are not registered with SEBI as Research Analysts (RA) or Investment Advisors (RIA). All content is for educational purposes only.",
};
