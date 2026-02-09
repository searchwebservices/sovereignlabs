import "server-only";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function validateApiKey(
  request: Request
): { valid: true } | { valid: false; response: NextResponse } {
  const apiKey = request.headers.get("X-API-Key");
  const expected = process.env.OPENCLAW_API_KEY;

  if (!expected) {
    console.error("OPENCLAW_API_KEY is not configured");
    return {
      valid: false,
      response: NextResponse.json(
        { data: null, error: { code: "server_error", message: "API key not configured" } },
        { status: 500 }
      ),
    };
  }

  if (!apiKey || !safeCompare(apiKey, expected)) {
    return {
      valid: false,
      response: NextResponse.json(
        { data: null, error: { code: "unauthorized", message: "Invalid or missing API key" } },
        { status: 401 }
      ),
    };
  }

  return { valid: true };
}
