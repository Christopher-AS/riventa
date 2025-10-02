import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// POST /api/users
// Cria um usuário manualmente (para popular produção)
export async function POST(req: NextRequest) {
  try {
    const data = bodySchema.parse(await req.json());
    const user = await prisma.user.create({ data });
    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error("POST /api/users error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "erro inesperado" }, { status: 400 });
  }
}
