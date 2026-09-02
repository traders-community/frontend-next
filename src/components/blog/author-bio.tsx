import React from "react";
import Image from "next/image";
import { AdminProfile } from "@/types";
import {
  RiMailLine,
  RiPhoneLine,
  RiGlobalLine,
  RiUserLine,
} from "@remixicon/react";

interface AuthorBioProps {
  profile?: AdminProfile | null;
}

export function AuthorBio({ profile }: AuthorBioProps) {
  const displayName = profile?.displayName || "Yash Adhiya";
  const bio =
    profile?.bio ||
    "Research analyst and educator passionate about Indian equities, market structure, and disciplined risk management.";

  return (
    <section
      aria-label="About the author"
      className="w-full mt-12 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-6 sm:p-7 shadow-sm transition-colors"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        {/* Avatar */}
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/40 bg-muted">
          {profile?.avatar ? (
            <Image
              src={profile.avatar}
              alt={`${displayName} avatar`}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized={profile.avatar.startsWith("http://localhost") || profile.avatar.startsWith("data:")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary">
              <RiUserLine className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary">
            Written by
          </p>
          <h3 className="mt-1 text-lg sm:text-xl font-bold text-foreground">
            {displayName}
          </h3>

          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {bio}
          </p>

          {/* Contact & Social Links */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {profile?.contactEmail && (
              <a
                href={`mailto:${profile.contactEmail}`}
                aria-label="Email author"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background/60 text-foreground/80 hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors"
                title="Email"
              >
                <RiMailLine className="w-4 h-4" />
              </a>
            )}

            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                aria-label="Call author"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background/60 text-foreground/80 hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors"
                title="Phone"
              >
                <RiPhoneLine className="w-4 h-4" />
              </a>
            )}

            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit author website"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background/60 text-foreground/80 hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors"
                title="Website"
              >
                <RiGlobalLine className="w-4 h-4" />
              </a>
            )}

            {(profile?.socialLinks || []).map((social) => (
              <a
                key={`${social.platform}-${social.url}`}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit author on ${social.platform}`}
                className="inline-flex min-h-9 items-center rounded-lg border border-border/80 bg-background/60 px-3 text-xs font-medium text-foreground/80 hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {social.platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthorBio;
