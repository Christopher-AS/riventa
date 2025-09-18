"use client";

import { useState } from "react";

type ApiOk = { ok: true; model: string; answer: string; usage?: unknown };
type ApiErr = { ok: false; error: string };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });

      const json = (await res.json()) as ApiOk | ApiErr;

      if (!res.ok || !("ok" in json) || json.ok === false) {
        setError(("error" in json ? json.error : `HTTP ${res.status}`) || "Erro");
      } else {
        setResult(json.answer);
      }
    } catch (err: any) {
      setError(err?.message ?? "Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Busca (OpenAI)</h1>

      <form onSubmit={onSubmit} className="space-y-2">
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          placeholder="Digite sua pergunta…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={loading}
          name="q"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="border rounded px-4 py-2"
            disabled={loading || !q.trim()}
          >
            {loading ? "Buscando…" : "Buscar"}
          </button>
          <button
            type="button"
            className="border rounded px-4 py-2"
            onClick={() => { setQ(""); setResult(""); setError(""); }}
            disabled={loading && !result && !error}
          >
            Limpar
          </button>
        </div>
      </form>

      {error && <p className="text-red-600">Erro: {error}</p>}
      {result && (
        <section className="border rounded p-3 whitespace-pre-wrap">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </section>
      )}
    </main>
  );
}
