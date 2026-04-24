import { NextResponse } from "next/server";

/**
 * Liveness/health for platforms (Railway, Docker) — no acople al API.
 * El API sigue en `NEXT_PUBLIC_QUANTUM_API_URL/health` (otro servicio).
 */
export async function GET() {
  return NextResponse.json({ status: "ok", service: "web" });
}
