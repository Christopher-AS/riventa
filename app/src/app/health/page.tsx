"use client";
import { useEffect, useState } from "react";
type Health = { status: "ok"; commit: string; time: string };

export default function HealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e: any) {
        setError(e?.message ?? "Erro desconhecido");
      }
    })();
  }, []);

  if (error) return <main className="p-6">Falhou: {error}</main>;
  if (!data) return <main className="p-6">Carregando…</main>;

  return (
    <main className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Health Check</h1>
      <div>Status: {data.status}</div>
      <div>Commit: {data.commit}</div>
      <div>Atualizado em {new Date(data.time).toLocaleString()}</div>
    </main>
  );
}
