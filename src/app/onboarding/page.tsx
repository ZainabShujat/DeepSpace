"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import UsernameForm from "@/components/onboarding/Usernameform";
import AvatarPicker from "@/components/onboarding/Avatarpicker";
import upsertProfile from "@/lib/supabase/profile";
import createClient from "@/lib/supabase/client";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/lobby";
  console.log("ONBOARDING NEXT:", nextPath);
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] =
    useState("strawberry");

  const handleContinue = () => {
    if (!username.trim()) return;

    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const userId = data?.session?.user?.id;

        if (userId) {
          await upsertProfile({ id: userId, username, avatar: selectedAvatar });
          localStorage.setItem("isGuest", "false");
          document.cookie = "deepspace-guest=; path=/; max-age=0; SameSite=Lax";
        } else {
          // Guest mode: persist identity locally and continue without auth.
          localStorage.setItem("isGuest", "true");
          localStorage.setItem("username", username);
          localStorage.setItem("avatar", selectedAvatar);
          document.cookie = "deepspace-guest=true; path=/; max-age=86400; SameSite=Lax";
        }

        localStorage.setItem("username", username);
        localStorage.setItem("avatar", selectedAvatar);

        window.location.href = nextPath;
      } catch (e) {
        console.error(e);
        alert("Unable to save profile");
      }
    })();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl border p-8 bg-white thick-border pixel-shadow">
        <h1 className="text-4xl font-bold mb-2 press-title">
          Welcome to DeepSpace
        </h1>

        <p className="opacity-60 mb-8">
          Choose your identity
        </p>

        <div className="space-y-8">
          <UsernameForm
            username={username}
            setUsername={setUsername}
          />

          <AvatarPicker
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
          />

          <button
            onClick={handleContinue}
            className="w-full bg-black text-white press-button thick-border py-4"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
