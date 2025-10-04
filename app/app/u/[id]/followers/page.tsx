import Link from "next/link";

export const dynamic = "force-dynamic";

type Item = {
  id: string;
  createdAt: string;
  follower: { id: string; email: string };
};

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { cursor?: string; limit?: string };
}) {
  const limit = Number(searchParams.limit ?? 10);
  const cursor = searchParams.cursor;

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const qs = new URLSearchParams({ userId: params.id, limit: String(limit) });
  if (cursor) qs.set("cursor", cursor);

  const res = await fetch(`${base}/api/followers?${qs.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Seguidores</h1>
        <p className="mt-4 text-red-600">
          Erro ao carregar seguidores: {res.status} {res.statusText}
        </p>
      </main>
    );
  }

  const data = (await res.json()) as {
    ok: boolean;
    items: Item[];
    nextCursor: string | null;
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Seguidores</h1>

      <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
        {data.items.length === 0 ? (
          <li className="p-4 text-gray-600">Nenhum seguidor.</li>
        ) : (
          data.items.map((it) => (
            <li key={it.id} className="p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <Link
                  href={`/u/${it.follower.id}`}
                  className="font-medium text-blue-700 hover:underline"
                >
                  {it.follower.email}
                </Link>
                <time
                  className="text-xs text-gray-500"
                  dateTime={new Date(it.createdAt).toISOString()}
                >
                  {new Date(it.createdAt).toLocaleString()}
                </time>
              </div>
              <code className="text-xs text-gray-400">rel: {it.id}</code>
            </li>
          ))
        )}
      </ul>

      <div className="flex justify-between">
        <Link
          href={`/u/${params.id}`}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Voltar ao perfil
        </Link>

        {data.nextCursor ? (
          <Link
            href={`/u/${params.id}/followers?limit=${limit}&cursor=${data.nextCursor}`}
            className="inline-flex items-center rounded-2xl bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
          >
            Próxima página →
          </Link>
        ) : (
          <span className="text-sm text-gray-400">Fim</span>
        )}
      </div>
    </main>
  );
}
