import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

function getSecret(): string {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    throw new Error("REVALIDATION_SECRET environment variable is required");
  }
  return secret;
}

export async function POST(req: NextRequest) {
  try {
    const REVALIDATION_SECRET = getSecret();
    const authHeader = req.headers.get("authorization");

    if (!authHeader || authHeader !== `Bearer ${REVALIDATION_SECRET}`) {
      return NextResponse.json({ message: "Invalid or missing authorization token" }, { status: 401 });
    }

    const { type, paths, tags } = await req.json();

    if (!type && !paths && !tags) {
      return NextResponse.json(
        { message: "Provide at least one of: type, paths, or tags" },
        { status: 400 }
      );
    }

    const results: { revalidated: string[]; failed: string[] } = {
      revalidated: [],
      failed: [],
    };

    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        try {
          revalidatePath(path);
          results.revalidated.push(path);
        } catch {
          results.failed.push(path);
        }
      }
    }

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        try {
          revalidateTag(tag);
          results.revalidated.push(`tag:${tag}`);
        } catch {
          results.failed.push(`tag:${tag}`);
        }
      }
    }

    if (type === "tools") {
      try {
        revalidatePath("/tools");
        revalidatePath("/");
        revalidateTag("tools");
        results.revalidated.push("/tools", "/", "tag:tools");
      } catch {
        results.failed.push("tools-revalidation");
      }
    }

    if (type === "categories") {
      try {
        revalidatePath("/categories");
        revalidateTag("categories");
        results.revalidated.push("/categories", "tag:categories");
      } catch {
        results.failed.push("categories-revalidation");
      }
    }

    if (type === "all") {
      try {
        revalidatePath("/", "layout");
        results.revalidated.push("/layout");
      } catch {
        results.failed.push("full-revalidation");
      }
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now(),
      results,
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { message: "Revalidation failed", error: String(error) },
      { status: 500 }
    );
  }
}
