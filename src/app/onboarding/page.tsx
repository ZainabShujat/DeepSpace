"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import UsernameForm from "@/components/onboarding/Usernameform";
import AvatarPicker from "@/components/onboarding/Avatarpicker";

export default function OnboardingPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] =
    useState("strawberry");

  const handleContinue = () => {
    if (!username.trim()) return;

    localStorage.setItem(
      "deepspace-user",
      JSON.stringify({
        username,
        avatar: selectedAvatar,
      })
    );

    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl border rounded-3xl p-8 bg-white">
        <h1 className="text-4xl font-bold mb-2">
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
            className="w-full bg-black text-white rounded-2xl py-4"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}