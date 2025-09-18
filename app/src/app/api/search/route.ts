import { NextResponse } from "next/server";
import { env } from "@/lib/env";

type Ok = { ok: true; model: string; answer: string; usage?: unknown };
type Err = { ok: false; error: string };

export async function POST(req: Request) {
  try {
    const key = env.OPENAI_API_KEY;

    const body = await req.json().catch(() => ({}));
    const q = (body?.q ?? "").toString().trim();
    if (!q) {
      return NextResponse.json<Err>({ ok: false, error: "Campo 'q' é obrigatório" }, { status: 400 });
    }

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `Responda em PT-BR, direto ao ponto:\n${q}`,
      }),
    });

    const data = await resp.json().catch(() => ({} as any));

    if (!resp.ok) {
      const msg = (data?.error?.message as string) || `OpenAI HTTP ${resp.status}`;
      return NextResponse.json<Err>({ ok: false, error: msg }, { status: 502 });
    }

    // Extração robusta do texto
    const answer =
      (data as any).output_text ??
      (data as any)?.output?.[0]?.content?.[0]?.text ??
      (data as any)?.choices?.[0]?.message?.content ??
      "";

    if (!answer) {
      return NextResponse.json<Err>({ ok: false, error: "Sem conteúdo na resposta da OpenAI" }, { status: 502 });
    }

    const payload: Ok = { ok: true, model: data?.model ?? "unknown", answer, usage: data?.usage };
    return NextResponse.json(payload, { headers: { "cache-control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json<Err>({ ok: false, error: e?.message ?? "Erro inesperado" }, { status: 500 });
  }
}
