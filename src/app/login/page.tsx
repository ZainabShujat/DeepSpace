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

      <div className="w-[400px] rounded-[32px] border bg-white p-10">

        <h1 className="text-4xl font-bold mb-8">Login</h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="w-full border rounded-2xl px-4 py-4 mb-4"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
          className="w-full border rounded-2xl px-4 py-4 mb-6"
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-2xl bg-black py-4 text-white"
        >
          Continue
        </button>

      </div>

    </main>
  );
}

