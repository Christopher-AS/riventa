import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
});

// POST /api/users
// Cria um usuário manualmente (para popular produção)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = bodySchema.parse(body);
    
    // Password padrão se não enviado
    const password = data.password || "demo123";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        profile: {
          create: {
            bio: data.name,
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error("POST /api/users error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "erro inesperado" },
      { status: 400 }
    );
  }
}