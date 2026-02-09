import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ data: null, error: { code, message } }, { status });
}

export function apiNotFound(entity: string) {
  return apiError("not_found", `${entity} not found`, 404);
}

export function apiBadRequest(message: string) {
  return apiError("bad_request", message, 400);
}

export function apiServerError(message = "Internal server error") {
  return apiError("server_error", message, 500);
}
