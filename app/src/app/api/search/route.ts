import { NextResponse } from "next/server";
import { env } from "@/lib/env";

type Ok = { ok: true; model: string; answer: string; usage?: unknown; retries: number; ms: number };
type Err = { ok: false; error: string; retries?: number };

const MODEL_WHITELIST = new Set(["gpt-4o-mini", "gpt-4.1-mini", "gpt-4o", "gpt-4.1"]);

async function fetchWithRetry(url: string, init: RequestInit, maxRetries = 2, baseDelay = 500, timeoutMs = 20000) {
  let lastErr: any;
  const start = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(url, { ...init, signal: controller.signal });
      const text = await resp.text();
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch { /* keep text */ }

      if (resp.ok) {
        return { resp, json, retries: attempt, msTotal: Date.now() - start };
      }

      if (resp.status === 429 || (resp.status >= 500 && resp.status <= 599)) {
        lastErr = new Error(json?.error?.message || `HTTP ${resp.status}`);
      } else {
        return { resp, json, retries: attempt, msTotal: Date.now() - start };
      }
    } catch (e: any) {
      lastErr = e;
    } finally {
      clearTimeout(to);
    }

    const delay = baseDelay * (attempt + 1) * (attempt + 1);
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error(lastErr?.message || "Erro de rede/timeout após retries");
}

export async function POST(req: Request) {
  try {
    if (!env.OPENAI_API_KEY) {
      return NextResponse.json<Err>({ ok: false, error: "OPENAI_API_KEY ausente" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const q = (body?.q ?? "").toString().trim();
    let model = (body?.model ?? "gpt-4o-mini").toString();

    if (!q) {
      return NextResponse.json<Err>({ ok: false, error: "Campo 'q' é obrigatório" }, { status: 400 });
    }
    if (!MODEL_WHITELIST.has(model)) model = "gpt-4o-mini";

    const { resp, json, retries, msTotal } = await fetchWithRetry(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: `Responda em PT-BR, direto ao ponto:\n${q}`,
        }),
      }
    );

    if (!resp.ok) {
      const msg = json?.error?.message || `OpenAI HTTP ${resp.status}`;
      return NextResponse.json<Err>({ ok: false, error: msg, retries }, { status: 502 });
    }

    const answer =
      json?.output_text ??
      json?.output?.[0]?.content?.[0]?.text ??
      json?.choices?.[0]?.message?.content ??
      "";

    if (!answer) {
      return NextResponse.json<Err>({ ok: false, error: "Sem conteúdo na resposta da OpenAI", retries }, { status: 502 });
    }

    return NextResponse.json<Ok>(
      { ok: true, model, answer, usage: json?.usage ?? null, retries, ms: msTotal },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json<Err>({ ok: false, error: e?.message ?? "Erro inesperado" }, { status: 500 });
  }
}
