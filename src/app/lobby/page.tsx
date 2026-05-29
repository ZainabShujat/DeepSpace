"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreateRoom from "@/components/lobby/createroom";
import RoomList from "@/components/lobby/RoomList";
import createClient from "@/lib/supabase/client";
import { resolveAvatarSrc } from "@/components/room/Avatar";
import BackLink from "@/components/navigation/BackLink";

export default function LobbyPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();

      const { data } = await supabase.auth.getSession();

      const userId = data?.session?.user?.id;

      if (userId) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase.from("users").select("username, avatar").eq("id", userId).single();

        if (profile) {
          setUsername((profile as any).username || data?.session?.user?.email || "");
          setAvatar((profile as any).avatar || null);
          return;
        }
      }

      setIsLoggedIn(false);
      setUsername(null);
      setAvatar(null);
    };

    loadProfile();
  }, []);

  return (
    <main
      className="relative min-h-screen px-10 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/backgrounds/lobby.png')" }}
    >
      <div className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2">
        <div className="inline-block rounded-sm bg-white/30 px-4 py-2 text-center backdrop-blur-sm">
          <h1 className="text-4xl font-black tracking-tight press-title md:text-6xl">DeepSpace</h1>
        </div>
      </div>

      <div className="
        max-w-350
        mx-auto
        rounded-[28px]
        border border-black/5
        bg-white/15
        p-8
        shadow-[0_16px_40px_rgba(0,0,0,0.04)]
        backdrop-blur-none
      ">

        {/* TOP BAR */}

        <div className="
          flex
          items-center
          justify-between
          mb-12
        ">

          <div className="flex items-start gap-4">
            <BackLink href="/" label="Back to landing" />

            <p className="
              text-neutral-500
              mt-2
              text-lg
            ">
              collaborative study rooms
            </p>

          </div>

          <div className="
            flex
            items-center
            gap-4
          ">
            {isLoggedIn ? (
              <>
                <div className="ds-panel p-3 flex items-center gap-3">
                  <img src={resolveAvatarSrc(avatar)} alt={username || "Avatar"} className="pixel-avatar" />

                  <div>
                    <p className="font-bold">{username}</p>

                    <p className="text-sm opacity-60">ready to focus</p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const supabase = createClient();

                    await supabase.auth.signOut();

                    document.cookie = "deepspace-guest=; path=/; max-age=0";
                    localStorage.clear();

                    window.location.href = "/";
                  }}
                  className="ds-btn ds-btn-secondary px-6 py-3"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="ds-panel px-5 py-4 text-right">
                <p className="text-sm font-semibold text-black">Login / Register</p>
                <p className="text-sm text-black/55">to save activity and join rooms</p>
                <div className="mt-2 flex justify-end gap-4 text-sm">
                  <Link href="/auth" className="underline underline-offset-4">
                    Login
                  </Link>
                  <Link href="/auth" className="underline underline-offset-4">
                    Register
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* MAIN */}

        <div className="
          grid
          grid-cols-2
          gap-10
        ">

          <CreateRoom />
          <RoomList />

        </div>

      </div>

    </main>
  );
}
