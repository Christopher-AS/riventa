import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET() {
  console.log("🟢 GET /api/ping");
  return NextResponse.json({ ok: true, t: Date.now() }, { headers });
}

export async function POST(req: NextRequest) {
  console.log("🟢 POST /api/ping");
  const data = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, recv: data, t: Date.now() }, { headers });
}

export async function OPTIONS() {
  // responde preflight imediatamente
  return new NextResponse(null, { status: 204, headers });
}
