"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BackLink from "@/components/navigation/BackLink";

function AuthContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/lobby";

  console.log("AUTH NEXT:", nextPath);

  return (
    <main className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/backgrounds/login-register.png')" }}>
      <div className="w-130 border bg-white/95 p-8 thick-border pixel-shadow backdrop-blur-sm">
            <div className="mb-4">
          <BackLink />
      </div>

        <h1 className="text-4xl font-bold mb-6 press-title">
          Sign in or continue
        </h1>

        <div className="space-y-4">
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="block w-full text-center bg-black text-white py-3"
          >
            Login
          </Link>

          <Link
            href={`/register?next=${encodeURIComponent(nextPath)}`}
            className="block w-full text-center border py-3"
          >
            Register
          </Link>

          <Link
            href={`/guest?next=${encodeURIComponent(nextPath)}`}
            className="block w-full text-center border py-3"
          >
            Continue as Guest
          </Link>
        </div>

        <div className="mt-6 text-sm text-neutral-600">
          <p>
            Guests can join rooms without registering. Accounts persist across
            devices.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div />}>
      <AuthContent />
    </Suspense>
  );
}