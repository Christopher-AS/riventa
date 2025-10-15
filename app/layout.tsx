import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import SessionProvider from "./components/SessionProvider";
import LayoutContent from "./components/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Riventa - Rede Social",
  description: "MVP Social + News",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProvider>
          <LayoutContent>{children}</LayoutContent>
        </SessionProvider>
      </body>
    </html>
  );
}
