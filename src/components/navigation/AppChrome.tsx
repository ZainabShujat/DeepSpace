"use client";

import { usePathname } from "next/navigation";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar =
    pathname.startsWith("/lobby") ||
    pathname.startsWith("/room") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/activity");

  return (
    <div className={showSidebar ? "min-w-0 pt-20 md:pt-24" : "min-w-0"}>
      {children}
    </div>
  );
}