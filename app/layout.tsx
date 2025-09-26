import "./globals.css";
import Link from "next/link";
import { prisma } from "@/lib/prisma"; // se o alias falhar, troque para "./lib/prisma"

export const metadata = {
  title: "Riventa",
  description: "Riventa MVP",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Usuária "logada" (POC)
  const viewerEmail = "alice@demo.com";
  const viewer = await prisma.user.findUnique({
    where: { email: viewerEmail },
    select: { id: true, email: true },
  });
  const viewerId = viewer?.id ?? "";

  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold text-blue-700">
              Riventa
            </Link>

            <div className="flex items-center gap-4 text-sm">
              <Link href="/news" className="hover:underline">Notícias</Link>
              <Link href="/search" className="hover:underline">Pesquisa</Link>
              <Link href="/" className="hover:underline">Feed</Link>

              {viewerId ? (
                <>
                  <Link href={`/u/${viewerId}`} className="hover:underline">Perfil</Link>
                  <Link href={`/u/${viewerId}/followers`} className="hover:underline" title="Ver seguidores">Seguidores</Link>
                  <Link href={`/u/${viewerId}/following`} className="hover:underline" title="Ver quem sigo">Seguindo</Link>
                </>
              ) : (
                <span className="text-gray-400">Usuário de teste ausente</span>
              )}
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

        <footer className="mx-auto max-w-4xl px-4 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Riventa
        </footer>
      </body>
    </html>
  );
}
