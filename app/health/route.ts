import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://medai-backend:8000";

export async function GET() {
  try {
    const response = await fetch(`${INTERNAL_API_URL}/health`, {
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ status: "degraded", message: "Backend unreachable" }, { status: 503 });
  }
}
