"use client";
import { useState } from "react";

export default function Home() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function onAsk(e) {
    e.preventDefault();
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      setAnswer(data.answer ?? JSON.stringify(data, null, 2));
    } catch (err) {
      setAnswer("Erro: " + String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Riventa</h1>
      <form onSubmit={onAsk} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pergunte algo…"
          style={{ flex: 1, padding: 8 }}
        />
        <button disabled={loading || !q.trim()} style={{ padding: 8 }}>
          {loading ? "Buscando..." : "Perguntar"}
        </button>
      </form>
      {answer && (
        <pre style={{ background: "#111", color: "#0f0", padding: 12, marginTop: 16, overflow: "auto" }}>
          {answer}
        </pre>
      )}
    </main>
  );
}
