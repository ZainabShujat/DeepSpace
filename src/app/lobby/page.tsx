"use client";

import { useEffect, useState } from "react";
import CreateRoom from "@/components/lobby/createroom";
import RoomList from "@/components/lobby/RoomList";
import createClient from "@/lib/supabase/client";
import { resolveAvatarSrc } from "@/components/room/Avatar";

export default function LobbyPage() {

  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();

      const { data } = await supabase.auth.getSession();

      const userId = data?.session?.user?.id;

      if (userId) {
        const { data: profile } = await supabase.from("users").select("username, avatar").eq("id", userId).single();

        if (profile) {
          setUsername((profile as any).username || data?.session?.user?.email || "");
          setAvatar((profile as any).avatar || null);
          return;
        }
      }

      // guest fallback
      const guestName = typeof window !== "undefined" ? localStorage.getItem("username") : null;
      const guestAvatar = typeof window !== "undefined" ? localStorage.getItem("avatar") : null;
      setUsername(guestName);
      setAvatar(guestAvatar || null);
    };

    loadProfile();
  }, []);

  return (
    <main className="min-h-screen px-10 py-12">

      <div className="
        max-w-[1400px]
        mx-auto
      ">

        {/* TOP BAR */}

        <div className="
          flex
          items-center
          justify-between
          mb-12
        ">

          <div>

            <h1 className="
              text-6xl
              font-black
              tracking-tight
            ">
              DeepSpace
            </h1>

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

                // if logged-in, sign out via Supabase
                await supabase.auth.signOut();

                // clear guest cookie and local storage
                document.cookie = "deepspace-guest=; path=/; max-age=0";
                localStorage.clear();

                window.location.href = "/";
              }}
              className="ds-btn ds-btn-secondary px-6 py-3"
            >
              Logout
            </button>

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
