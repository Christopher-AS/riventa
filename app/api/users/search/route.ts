import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/users/search?q=
// Busca usuários por name ou email contendo q (case-insensitive).
// Retorna até 20 resultados ordenados por name.
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "Parâmetro 'q' é obrigatório" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { profile: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        profile: {
          name: "asc",
        },
      },
      take: 20,
    });

    return NextResponse.json({ ok: true, users });
  } catch (err: any) {
    console.error("Erro ao buscar usuários:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro interno ao buscar usuários" },
      { status: 500 }
    );
  }
}
