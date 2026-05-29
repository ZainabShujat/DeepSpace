"use client";

import { useRouter } from "next/navigation";

export default function GuestPage() {
  const router = useRouter();

  const continueGuest = () => {
    // set a cookie so middleware can allow guest access
    document.cookie = "deepspace-guest=true; path=/; max-age=86400";
    localStorage.setItem("isGuest", "true");

    router.push("/onboarding");
  };

  return (
    <main className="min-h-screen flex items-center justify-center">

      <div className="border p-10 w-[400px] bg-white thick-border pixel-shadow">

        <h1 className="text-3xl font-bold mb-4 press-title">
          Guest Mode
        </h1>

        <p className="text-neutral-500 mb-8">
          Your progress won't be saved.
        </p>

        <button
          onClick={continueGuest}
          className="w-full bg-black text-white py-3 press-button thick-border"
        >
          Continue
        </button>

      </div>
    </main>
  );
}