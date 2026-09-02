"use client";

import React from "react";
import { toast } from "react-toastify";
import {
  RiShareLine,
  RiWhatsappLine,
  RiTwitterXLine,
  RiLinkedinBoxLine,
  RiFacebookBoxLine,
  RiMailLine,
} from "@remixicon/react";

interface SocialShareProps {
  title: string;
  subTitle?: string;
}

export function SocialShare({ title, subTitle }: SocialShareProps) {
  const getSharePayload = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle = title || "Trading Research Article";
    const shareText = subTitle || shareTitle;
    return { url, title: shareTitle, text: shareText };
  };

  const handleNativeShare = async () => {
    const { title: shareTitle, text, url } = getSharePayload();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text, url });
        toast.success("Article link shared");
      } catch {
        // User dismissed the native dialog
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Article URL copied to clipboard");
      } catch {
        openShareDialog("twitter");
      }
    } else {
      openShareDialog("twitter");
    }
  };

  const openShareDialog = (provider: "facebook" | "twitter" | "whatsapp" | "linkedin" | "email") => {
    const { title: shareTitle, text, url } = getSharePayload();
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text || shareTitle);

    let shareUrl = "";

    switch (provider) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        window.location.href = shareUrl;
        return;
    }

    const width = 640;
    const height = 480;
    const left = typeof window !== "undefined" ? window.screenX + (window.innerWidth - width) / 2 : 0;
    const top = typeof window !== "undefined" ? window.screenY + (window.innerHeight - height) / 2 : 0;

    window.open(
      shareUrl,
      "share-dialog",
      `toolbar=0,status=0,width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <section aria-label="Social sharing" className="w-full mt-10 pt-6 border-t border-border/60">
      <p className="text-sm font-semibold mb-3.5 text-primary">
        Share this article
      </p>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Native share button */}
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Share article"
          title="Share / Copy Link"
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors shadow-sm cursor-pointer"
        >
          <RiShareLine className="w-4 h-4" />
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={() => openShareDialog("whatsapp")}
          aria-label="Share on WhatsApp"
          title="WhatsApp"
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors shadow-sm cursor-pointer"
        >
          <RiWhatsappLine className="w-4 h-4" />
        </button>

        {/* Twitter / X */}
        <button
          type="button"
          onClick={() => openShareDialog("twitter")}
          aria-label="Share on X (Twitter)"
          title="X / Twitter"
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card hover:border-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm cursor-pointer"
        >
          <RiTwitterXLine className="w-4 h-4" />
        </button>

        {/* LinkedIn */}
        <button
          type="button"
          onClick={() => openShareDialog("linkedin")}
          aria-label="Share on LinkedIn"
          title="LinkedIn"
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card hover:border-blue-500 hover:text-blue-500 hover:bg-blue-500/10 transition-colors shadow-sm cursor-pointer"
        >
          <RiLinkedinBoxLine className="w-4 h-4" />
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={() => openShareDialog("facebook")}
          aria-label="Share on Facebook"
          title="Facebook"
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card hover:border-blue-600 hover:text-blue-600 hover:bg-blue-600/10 transition-colors shadow-sm cursor-pointer"
        >
          <RiFacebookBoxLine className="w-4 h-4" />
        </button>

        {/* Email */}
        <button
          type="button"
          onClick={() => openShareDialog("email")}
          aria-label="Share via Email"
          title="Email"
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors shadow-sm cursor-pointer"
        >
          <RiMailLine className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

export default SocialShare;
