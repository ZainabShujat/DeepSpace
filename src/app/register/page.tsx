"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import createClient from "@/lib/supabase/client";

export default function RegisterPage() {

	const router = useRouter();
	const searchParams = useSearchParams();
	const nextPath = searchParams.get("next") || "/lobby";
console.log("ONBOARDING NEXT:", nextPath);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleRegister = async () => {
		if (!email || !password) return;

		const supabase = createClient();

		const { data, error } = await supabase.auth.signUp({ email, password });

		if (error) {
			alert(error.message);
			return;
		}

		if (!data.session) {
			const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

			if (signInError) {
				alert("Account created. Please confirm your email, then log in.");
				router.push(`/login?next=${encodeURIComponent(nextPath)}`);
				return;
			}
		}

		// redirect to onboarding to finish username/avatar
		router.push(`/onboarding?next=${encodeURIComponent(nextPath)}`);
	};

	return (
		<main className="min-h-screen flex items-center justify-center bg-neutral-100">

			<div className="w-100 border bg-white p-10 thick-border pixel-shadow rounded-sm">

				<h1 className="text-4xl font-bold mb-8 press-title">Register</h1>

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
					onClick={handleRegister}
					className="w-full bg-black py-4 text-white press-button thick-border"
				>
					Create account
				</button>

			</div>

		</main>
	);
}
