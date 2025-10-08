import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // se o alias falhar, use "../../../lib/prisma"
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(1, "q obrigatório"),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(), // id do último item
});

// GET /api/users/search?q=&limit=&cursor=
// Busca usuários por email contendo q (case-insensitive).
// Paginação por id; ordenação estável por email asc, id asc.
export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Parâmetros inválidos",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { q, limit, cursor } = parsed.data;
    const take = limit + 1; // 1 extra para detectar próxima página

    const users = await prisma.user.findMany({
      where: {
        email: { contains: q, mode: "insensitive" },
      },
      orderBy: [{ email: "asc" }, { id: "asc" }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: { id: true, email: true },
    });

    let nextCursor: string | null = null;
    let items = users;

    if (users.length > limit) {
      nextCursor = users[limit].id;
      items = users.slice(0, limit);
    }

    return NextResponse.json({ ok: true, items, nextCursor });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}
