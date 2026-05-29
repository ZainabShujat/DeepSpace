"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import createClient from "@/lib/supabase/client";

type SessionUser = {
  username: string;
  avatar: string;
  mode: "guest" | "logged-in";
  email?: string | null;
};

export default function AppSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser>({
    username: "Guest",
    avatar: "/avatars/strawberry.png",
    mode: "guest",
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (sessionUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar")
          .eq("id", sessionUser.id)
          .single();

        setUser({
          username: profile?.username || sessionUser.email || "Member",
          avatar: profile?.avatar || "/avatars/strawberry.png",
          mode: "logged-in",
          email: sessionUser.email,
        });
        return;
      }

      const guestUsername = localStorage.getItem("username") || "Guest";
      const guestAvatar = localStorage.getItem("avatar") || "/avatars/strawberry.png";

      setUser({
        username: guestUsername,
        avatar: guestAvatar,
        mode: document.cookie.includes("deepspace-guest=true") ? "guest" : "guest",
      });
    };

    loadUser();
  }, []);

  const navItems = [
    { href: "/lobby", label: "Lobby" },
    { href: "/profile", label: "Profile" },
    { href: "/activity", label: "Activity" },
  ];

  return (
    <>
      <button
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-md bg-white/90 p-2 shadow-md"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

          <aside className="absolute left-0 top-0 bottom-0 w-72 border-r bg-[#111111] text-white flex flex-col px-5 py-6 z-50">
            <div className="mb-4 flex items-center justify-between">
              <Link href="/" className="mb-0 block">
                <div className="text-2xl font-black tracking-tight">DeepSpace</div>
                <div className="text-xs uppercase tracking-[0.35em] text-white/50">Focus rooms</div>
              </Link>
              <button aria-label="Close navigation" onClick={() => setOpen(false)} className="ml-2 p-2 rounded-md bg-white/5">
                ✕
              </button>
            </div>

            <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatar} alt={user.username} className="h-12 w-12 rounded-full border border-white/20 object-cover" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{user.username}</div>
                  <div className="text-xs text-white/60 capitalize">{user.mode}</div>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active ? "bg-white text-black" : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="font-semibold text-white">Navigation</p>
              <p className="mt-1">Profile shows whether you are in guest mode or signed in.</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
