export const dynamic = "force-dynamic";

export default async function NewsPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Notícias</h1>

      <p className="text-gray-600">
        Área de notícias (beta). Aqui vamos listar matérias e transmissões ao
        vivo curadas, com fonte e data, e mais tarde vamos integrar com IA para
        resumo e debate em tempo real.
      </p>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
        (Placeholder) Nenhuma notícia carregada. Próximo passo: conectar um
        endpoint /api/news ou um feed externo.
      </div>
    </main>
  );
}
