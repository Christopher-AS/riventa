import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-center">Buscar Usuários</h1>
      
      <div className="flex justify-center">
        <SearchBar />
      </div>
    </main>
  );
}
