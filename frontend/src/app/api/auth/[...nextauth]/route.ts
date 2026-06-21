import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function proxyRequest(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/auth", "/auth");
  const targetUrl = `${API_BASE_URL}${path}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
      redirect: "manual",
    });

    const body = await response.text();

    const proxyResponse = new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
    });

    response.headers.forEach((value, key) => {
      if (!["content-encoding", "content-length", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
        proxyResponse.headers.set(key, value);
      }
    });

    return proxyResponse;
  } catch (error) {
    console.error("Auth proxy error:", error);
    return NextResponse.json(
      { message: "Authentication service unavailable" },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req);
}

export async function POST(req: NextRequest) {
  return proxyRequest(req);
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req);
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req);
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req);
}
