"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isNewsRoute = pathname?.startsWith("/news");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isNewsRoute && <Sidebar />}
      <main className={isNewsRoute ? "flex-1" : "flex-1 ml-64"}>
        {children}
      </main>
    </div>
  );
}
