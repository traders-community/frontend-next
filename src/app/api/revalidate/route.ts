import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

async function handleRevalidation(
  path?: string | null,
  tag?: string | null,
  type?: "layout" | "page" | null,
  secret?: string | null
) {
  const expectedSecret = process.env.REVALIDATION_TOKEN || "tc-secret-revalidate-token";

  if (secret !== expectedSecret) {
    return NextResponse.json({ success: false, message: "Invalid secret token" }, { status: 401 });
  }

  if (path && typeof path === "string") {
    if (type === "layout" || type === "page") {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }
    return NextResponse.json({ success: true, revalidated: true, path, now: Date.now() });
  }

  if (tag && typeof tag === "string") {
    // Next.js 16 requires a second profile parameter (e.g. "max" or cacheLife config)
    revalidateTag(tag, "max");
    return NextResponse.json({ success: true, revalidated: true, tag, now: Date.now() });
  }

  return NextResponse.json(
    { success: false, message: "Missing 'path' or 'tag' parameter to revalidate" },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path, tag, type, secret } = body;
    return await handleRevalidation(path, tag, type, secret);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Error during cache revalidation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path");
    const tag = searchParams.get("tag");
    const type = searchParams.get("type") as "layout" | "page" | null;
    const secret = searchParams.get("secret");

    return await handleRevalidation(path, tag, type, secret);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Error during cache revalidation" },
      { status: 500 }
    );
  }
}
