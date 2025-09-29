"use client";

import { FormEvent, useCallback, useState } from "react";

type ApiOk = {
  ok: true;
  model: string;
  answer: string;
  usage?: unknown;
  retries: number;
  ms: number;
};
type ApiErr = { ok: false; error: string; retries?: number };

const MODELS = ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4o", "gpt-4.1"] as const;

type ModelOption = (typeof MODELS)[number];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [model, setModel] = useState<ModelOption>("gpt-4o-mini");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiOk | null>(null);
  const [error, setError] = useState<ApiErr | null>(null);
  const [copyFeedback, setCopyFeedback] = useState("");

  const promptLength = q.length;
  const canSubmit = !loading && q.trim().length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setResult(null);
    setError(null);
    setCopyFeedback("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, model }),
      });

      const json = (await res.json()) as ApiOk | ApiErr;

      if (!res.ok || json.ok === false) {
        const message = json.ok === false ? json.error : `HTTP ${res.status}`;
        setError({
          ok: false,
          error: message,
          retries: json.ok === false ? json.retries : undefined,
        });
        return;
      }

      setResult(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro de rede";
      setError({ ok: false, error: message });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQ("");
    setModel("gpt-4o-mini");
    setResult(null);
    setError(null);
    setCopyFeedback("");
  };

  const handleCopy = useCallback(async () => {
    if (
      !result?.answer ||
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.answer);
      setCopyFeedback("Copiado!");
      if (typeof window !== "undefined") {
        window.setTimeout(() => setCopyFeedback(""), 2000);
      }
    } catch (err) {
      setCopyFeedback("Não foi possível copiar");
      if (typeof window !== "undefined") {
        window.setTimeout(() => setCopyFeedback(""), 2000);
      }
    }
  }, [result]);

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Busca (OpenAI)</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <textarea
            className="w-full rounded border p-2"
            rows={4}
            placeholder="Digite sua pergunta…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            disabled={loading}
            name="q"
          />
          <p className="text-right text-xs text-gray-500">
            {promptLength} caracteres
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Modelo</span>
            <select
              className="rounded border px-3 py-2 text-sm"
              value={model}
              onChange={(event) => setModel(event.target.value as ModelOption)}
              disabled={loading}
              name="model"
            >
              {MODELS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded border px-4 py-2"
              disabled={!canSubmit}
            >
              {loading ? "Buscando…" : "Buscar"}
            </button>
            <button
              type="button"
              className="rounded border px-4 py-2"
              onClick={handleClear}
              disabled={loading && !q && !result && !error}
            >
              Limpar
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          <p className="font-medium">Erro: {error.error}</p>
          {typeof error.retries === "number" && (
            <p className="text-sm text-red-600">Tentativas: {error.retries}</p>
          )}
        </div>
      )}

      {result && (
        <section className="space-y-3 rounded border p-3">
          <header className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <span>Modelo: {result.model}</span>
            <span>
              Tentativas: {result.retries} · {result.ms} ms
            </span>
          </header>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
            {result.answer}
          </pre>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded border px-3 py-1 text-sm"
              onClick={handleCopy}
            >
              Copiar resposta
            </button>
            {copyFeedback && (
              <span className="text-xs text-gray-500">{copyFeedback}</span>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
