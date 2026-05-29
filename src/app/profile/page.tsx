"use client";

import { useEffect, useState } from "react";
import createClient from "@/lib/supabase/client";
import { resolveAvatarSrc } from "@/components/room/Avatar";

type ProfileState = {
  username: string;
  avatar: string | null;
  mode: "guest" | "logged-in";
  email?: string | null;
};

type UserProfileRow = {
  username?: string | null;
  avatar?: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState>({
    username: "Guest",
    avatar: null,
    mode: "guest",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (sessionUser) {
        const { data: row } = await supabase
          .from("users")
          .select("username, avatar")
          .eq("id", sessionUser.id)
          .single();

        setProfile({
          username: (row as UserProfileRow | null)?.username || sessionUser.email || "Member",
          avatar: (row as UserProfileRow | null)?.avatar || null,
          mode: "logged-in",
          email: sessionUser.email,
        });
        return;
      }

      setProfile({
        username: localStorage.getItem("username") || "Guest",
        avatar: localStorage.getItem("avatar") || null,
        mode: "guest",
      });
    };

    loadProfile();
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f6f7] px-8 py-10">
      <div className="mx-auto max-w-4xl rounded-[36px] border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-black/40">Profile</p>
              <h1 className="mt-2 text-5xl font-black press-title">{profile.username}</h1>
            <p className="mt-2 text-lg text-black/55 capitalize">{profile.mode} mode</p>
            {profile.email && <p className="mt-1 text-sm text-black/45">{profile.email}</p>}
          </div>

          <div className="flex items-center gap-4 rounded-[28px] border border-black/10 bg-[#f4f4f5] px-5 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveAvatarSrc(profile.avatar)} alt={profile.username} className="h-20 w-20 rounded-sm border border-black/10 object-cover" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">Current mode</p>
              <p className="text-xl font-semibold capitalize">{profile.mode}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Stat label="Username" value={profile.username} />
          <Stat label="Mode" value={profile.mode} />
          <Stat label="Avatar" value={(profile.avatar || "").replace("/avatars/", "")} />
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[26px] border border-black/10 bg-[#fafafa] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-black/40">{label}</p>
      <p className="mt-3 text-lg font-semibold break-words">{value}</p>
    </div>
  );
}
