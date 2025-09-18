import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type HealthResponse = {
  status: string;
  commit: string;
  time: string;
};

async function fetchHealth(): Promise<HealthResponse> {
  const headerList = headers();
  const host = headerList.get("host");

  if (!host) {
    throw new Error("Host header is missing");
  }

  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const response = await fetch(`${protocol}://${host}/api/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return (await response.json()) as HealthResponse;
}

export default async function HealthPage() {
  let health: HealthResponse | null = null;
  let errorMessage: string | null = null;

  try {
    health = await fetchHealth();
  } catch (error: unknown) {
    errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Health Check</h1>
        <p className="text-sm text-gray-500">
          Verifique o status atual da aplicação.
        </p>
      </header>
      {health ? (
        <dl className="grid grid-cols-1 gap-2 rounded border border-gray-200 bg-white p-4 text-sm shadow-sm">
          <div className="flex flex-col">
            <dt className="font-medium">Status</dt>
            <dd className="text-green-600">{health.status}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="font-medium">Commit</dt>
            <dd className="font-mono text-xs">{health.commit}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="font-medium">Atualizado em</dt>
            <dd>{new Date(health.time).toLocaleString()}</dd>
          </div>
        </dl>
      ) : (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Não foi possível carregar o status. {errorMessage}
        </div>
      )}
    </main>
  );
}
