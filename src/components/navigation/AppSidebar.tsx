"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import createClient from "@/lib/supabase/client";
import { resolveAvatarSrc } from "@/components/room/Avatar";

type SessionUser = {
  username: string;
  avatar?: string | null;
  mode: "guest" | "logged-in" | "anonymous";
  email?: string | null;
};

export default function AppSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser>({
    username: "",
    avatar: null,
    mode: "anonymous",
  });
  const [open, setOpen] = useState(false);

  const showSidebar =
    pathname.startsWith("/lobby") ||
    pathname.startsWith("/room") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/activity");

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (sessionUser) {
        const { data: profile } = await supabase
          .from("users")
          .select("username, avatar")
          .eq("id", sessionUser.id)
          .single();

        setUser({
          username: profile?.username || sessionUser.email || "Member",
          avatar: profile?.avatar || null,
          mode: "logged-in",
          email: sessionUser.email,
        });
        return;
      }

      const guestUsername = localStorage.getItem("username");
      const guestAvatar = localStorage.getItem("avatar") || null;

      if (!guestUsername || !document.cookie.includes("deepspace-guest=true")) {
        setUser({
          username: "",
          avatar: null,
          mode: "anonymous",
        });
        return;
      }

      setUser({
        username: guestUsername,
        avatar: guestAvatar,
        mode: "guest",
      });
    };

    loadUser();
  }, []);

  const navItems = [
    { href: "/lobby", label: "Lobby" },
    { href: "/profile", label: "Profile" },
    { href: "/activity", label: "Activity" },
  ];

  if (!showSidebar) {
    return null;
  }

  return (
    <>
      <button
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={`fixed left-5 top-5 z-70 rounded-md border-2 border-black bg-white/95 p-2 shadow-[4px_4px_0_#000] transition duration-300 hover:-translate-y-px md:left-6 md:top-6 ${open ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`fixed inset-0 z-40 transition duration-300 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />

        <aside
          className={`absolute left-0 top-0 bottom-0 z-80 flex w-80 max-w-[88vw] flex-col gap-6 border-r border-black bg-[#111111] px-5 py-6 text-white shadow-[8px_0_0_#000] transform-gpu transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="mb-0 block">
              <div className="press-title text-2xl tracking-tight">DeepSpace</div>
              <div className="text-xs uppercase tracking-[0.35em] text-white/50">Focus rooms</div>
            </Link>
            <button aria-label="Close navigation" onClick={() => setOpen(false)} className="ml-2 rounded-md border border-white/20 bg-white/5 p-2 hover:bg-white/10">
              ✕
            </button>
          </div>

          <div className="ds-panel p-4">
            {user.mode === "anonymous" ? (
              <div className="space-y-2 text-sm text-black">
                <p className="font-semibold">Login or register to save activity.</p>
                <p className="opacity-70">Guest activity is temporary and won’t be stored in your profile history.</p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveAvatarSrc(user.avatar)} alt={user.username} className="pixel-avatar" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{user.username}</div>
                  <div className="text-xs text-white/60 capitalize">{user.mode}</div>
                </div>
              </div>
            )}
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-sm px-4 py-3 text-sm font-medium transition ${active ? "bg-white text-black" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-sm thick-border bg-white p-4 text-sm text-black">
            <p className="font-semibold">Navigation</p>
            <p className="mt-1 opacity-70">Profile shows whether you are in guest mode or signed in.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
