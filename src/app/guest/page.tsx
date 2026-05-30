"use client";

import BackLink from "@/components/navigation/BackLink";

export default function GuestPage() {
  const continueGuest = () => {
  document.cookie =
    "deepspace-guest=true; path=/; max-age=86400; SameSite=Lax";

  localStorage.setItem("isGuest", "true");

  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "/lobby";

  window.location.href =
    `/onboarding?next=${encodeURIComponent(next)}`;
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/backgrounds/guest.png')" }}>

      <div className="border p-10 w-100 bg-white/95 thick-border pixel-shadow">
        <div className="mb-6">
          <BackLink href="/auth" />
        </div>

        <h1 className="text-3xl font-bold mb-4 press-title">
          Guest Mode
        </h1>

        <p className="text-neutral-500 mb-8">
          Your progress won&apos;t be saved.
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
