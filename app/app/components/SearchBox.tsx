"use client";
import { useState } from "react";

export default function SearchBox() {
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: troque por sua navegação/busca real
        alert(`buscar por: ${q}`);
      }}
      className="flex gap-2 w-full"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar..."
        className="border px-3 py-2 rounded w-full"
      />
      <button type="submit" className="px-4 py-2 rounded bg-black text-white">
        Buscar
      </button>
    </form>
  );
}
