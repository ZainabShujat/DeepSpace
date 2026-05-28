"use client";

import { useEffect, useState } from "react";
import CreateRoom from "@/components/lobby/createroom";
import RoomList from "@/components/lobby/RoomList";
import createClient from "@/lib/supabase/client";

export default function LobbyPage() {

  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();

      const { data } = await supabase.auth.getSession();

      const userId = data?.session?.user?.id;

      if (userId) {
        const { data: profile } = await supabase.from("profiles").select("username, avatar").eq("id", userId).single();

        if (profile) {
          setUsername(profile.username || data?.session?.user?.email || "");
          setAvatar(profile.avatar || "/avatars/strawberry.png");
          return;
        }
      }

      // guest fallback
      const guestName = typeof window !== "undefined" ? localStorage.getItem("username") : null;
      const guestAvatar = typeof window !== "undefined" ? localStorage.getItem("avatar") : null;
      setUsername(guestName);
      setAvatar(guestAvatar);
    };

    loadProfile();
  }, []);

  return (
    <main className="
      min-h-screen
      bg-[#f4f4f5]
      px-10
      py-12
    ">

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

            <div className="
              bg-white
              border
              rounded-2xl
              px-5
              py-3
              flex
              items-center
              gap-3
              shadow-sm
            ">

              <img
                src={avatar || "/avatars/strawberry.png"}
                className="w-12 h-12"
              />

              <div>
                <p className="font-bold">
                  {username}
                </p>

                <p className="
                  text-sm
                  opacity-60
                ">
                  ready to focus
                </p>
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
              className="
                px-6
                py-4
                rounded-2xl
                border
                bg-white
                hover:bg-black
                hover:text-white
                transition-all
              "
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