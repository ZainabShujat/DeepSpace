"use client";

export const dynamic = "force-dynamic";
import { useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import createClient from "@/lib/supabase/client";

export function LoginPage() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/lobby";
  console.log("LOGIN NEXT:", nextPath);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      return;
    }

    document.cookie = "deepspace-guest=; path=/; max-age=0; SameSite=Lax";
    localStorage.setItem("isGuest", "false");

    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;

    if (userId) {
      const { data: profile } = await supabase
        .from("users")
        .select("username, avatar")
        .eq("id", userId)
        .maybeSingle();

      if (!profile?.username) {
        router.push(`/onboarding?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      localStorage.setItem("username", profile.username);
      if (profile.avatar) localStorage.setItem("avatar", profile.avatar);
    }

    router.push(nextPath);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100">


      <div className="w-100 border bg-white p-10 thick-border pixel-shadow">

        <h1 className="text-4xl font-bold mb-8 press-title">Login</h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="w-full border px-4 py-4 mb-4 thick-border rounded-sm"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
          className="w-full border px-4 py-4 mb-6 thick-border rounded-sm"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black py-4 text-white press-button thick-border"
        >
          Continue
        </button>

      </div>

    </main>
  );
}
export default function Login() {
  return (
    <Suspense fallback={<div />}>
      <LoginPage/>
    </Suspense>
   );
}