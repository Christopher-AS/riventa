"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UserHit = { id: string; email: string };

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<UserHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // debounce simples (300ms)
  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    let abort = false;

    async function run() {
      setError(null);

      // Se não tem texto, não busca e limpa resultados
      if (!debouncedQ.trim()) {
        setHits([]);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(debouncedQ)}&limit=10`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (abort) return;

        if (!res.ok || !data?.ok) {
          setError(data?.error ?? `Erro ${res.status}`);
          setHits([]);
          return;
        }
        setHits(data.items as UserHit[]);
      } catch (e: any) {
        if (!abort) {
          setError(e?.message ?? "Erro de rede");
          setHits([]);
        }
      } finally {
        if (!abort) setLoading(false);
      }
    }

    run();
    return () => {
      abort = true;
    };
  }, [debouncedQ]);

  function onClear() {
    setQ("");
    setHits([]);
    setError(null);
  }

  const showPanel = q.trim().length > 0; // <-- só mostra a lista quando houver texto

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* caixa de pesquisa */}
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar pessoas ou empresas…"
          className="w-full rounded-2xl border border-gray-300 bg-white p-3 pr-10 outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Pesquisar"
        />
        {q && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            aria-label="Limpar"
            title="Limpar"
          >
            ×
          </button>
        )}
      </div>

      {/* resultados: exibidos somente após digitar */}
      {showPanel && (
        <div className="mt-3 rounded-2xl border border-gray-200 bg-white">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Buscando…</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600" role="alert">
              {error}
            </div>
          ) : hits.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Nenhum resultado.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {hits.map((u) => (
                <li key={u.id} className="p-3 hover:bg-gray-50">
                  <Link
                    href={`/u/${u.id}`}
                    className="block text-sm font-medium text-blue-700 hover:underline"
                  >
                    {u.email}
                  </Link>
                  <div className="text-xs text-gray-500">
                    <code className="select-all">id: {u.id}</code>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Hook de debounce */
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
