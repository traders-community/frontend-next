import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

type RevalidateType = "layout" | "page";

interface PathEntry {
  path: string;
  type?: RevalidateType;
}

interface RevalidateBody {
  secret?: unknown;
  paths?: unknown;
  tags?: unknown;
  /** Legacy single-entry fields, still accepted */
  path?: unknown;
  tag?: unknown;
  type?: unknown;
}

const MAX_ENTRIES = 50;

const isSafePath = (value: string) => value.startsWith("/") && !value.includes("..") && value.length <= 512;

const isRevalidateType = (value: unknown): value is RevalidateType => value === "layout" || value === "page";

/** Constant-time comparison so the shared secret cannot be probed byte by byte */
const secretMatches = (provided: unknown, expected: string) => {
  if (typeof provided !== "string" || provided.length === 0) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

const normalizePaths = (body: RevalidateBody): PathEntry[] => {
  const raw: unknown[] = Array.isArray(body.paths) ? body.paths : [];
  if (typeof body.path === "string") {
    raw.push(isRevalidateType(body.type) ? { path: body.path, type: body.type } : body.path);
  }

  const entries: PathEntry[] = [];
  for (const item of raw.slice(0, MAX_ENTRIES)) {
    if (typeof item === "string") {
      if (isSafePath(item)) entries.push({ path: item });
      continue;
    }
    if (item && typeof item === "object" && typeof (item as PathEntry).path === "string") {
      const { path, type } = item as PathEntry;
      if (isSafePath(path)) entries.push({ path, type: isRevalidateType(type) ? type : undefined });
    }
  }
  return entries;
};

const normalizeTags = (body: RevalidateBody): string[] => {
  const raw: unknown[] = Array.isArray(body.tags) ? body.tags : [];
  if (typeof body.tag === "string") raw.push(body.tag);
  return raw
    .slice(0, MAX_ENTRIES)
    .filter((tag): tag is string => typeof tag === "string" && tag.length > 0 && tag.length <= 256);
};

/**
 * On-demand cache invalidation, called by the backend after admin mutations
 * (see backend/utils/revalidate.js). Requires the shared REVALIDATION_TOKEN.
 */
export async function POST(request: NextRequest) {
  // Prefer the server-only name; fall back to NEXT_PUBLIC_* so existing local envs keep working
  const expectedSecret =
    process.env.REVALIDATION_TOKEN || process.env.NEXT_PUBLIC_REVALIDATION_TOKEN;
  if (!expectedSecret) {
    return NextResponse.json(
      { success: false, message: "Revalidation is not configured on this deployment." },
      { status: 503 }
    );
  }

  const body: RevalidateBody = await request.json().catch(() => ({}));

  if (!secretMatches(body.secret, expectedSecret)) {
    return NextResponse.json({ success: false, message: "Invalid secret token" }, { status: 401 });
  }

  const paths = normalizePaths(body);
  const tags = normalizeTags(body);

  if (paths.length === 0 && tags.length === 0) {
    return NextResponse.json(
      { success: false, message: "Provide at least one path or tag to revalidate." },
      { status: 400 }
    );
  }

  try {
    for (const { path, type } of paths) {
      if (type) {
        revalidatePath(path, type);
      } else {
        revalidatePath(path);
      }
    }
    for (const tag of tags) {
      // Next.js 16 requires a cache-life profile as the second argument
      revalidateTag(tag, "max");
    }
  } catch (err) {
    console.error("[revalidate] Failed to revalidate:", err);
    return NextResponse.json(
      { success: false, message: "Cache revalidation failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    revalidated: true,
    paths: paths.map((entry) => entry.path),
    tags,
    now: Date.now(),
  });
}
