import SearchBox from "@/app/components/SearchBox";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Pesquisa</h1>
      <p className="text-gray-600">
        Digite o nome ou e-mail para localizar pessoas ou empresas.
      </p>

      {/* Caixa de pesquisa interativa */}
      <SearchBox />
    </main>
  );
}
