"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/lib/supabase/client";

export default function LoginPage() {

  const router = useRouter();
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

    router.push("/lobby");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100">


      <div className="w-[400px] border bg-white p-10 thick-border pixel-shadow">

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

