import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 120 seconds timeout for clinical LLM inference

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://medai-backend:8000";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const pathStr = params.path ? params.path.join("/") : "";
  const targetUrl = `${INTERNAL_API_URL}/api/v1/${pathStr}`;

  try {
    const body = await req.text();
    const headers: Record<string, string> = {
      "Content-Type": req.headers.get("content-type") || "application/json",
    };

    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`[PROXY ERROR] Failed to forward request to ${targetUrl}:`, error);
    return NextResponse.json(
      {
        detail: `Gateway Proxy Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 504 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const pathStr = params.path ? params.path.join("/") : "";
  const targetUrl = `${INTERNAL_API_URL}/api/v1/${pathStr}`;

  try {
    const headers: Record<string, string> = {};
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`[PROXY ERROR] Failed to forward GET to ${targetUrl}:`, error);
    return NextResponse.json(
      {
        detail: `Gateway Proxy Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 504 }
    );
  }
}
