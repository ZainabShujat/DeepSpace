"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/lib/supabase/client";
import upsertProfile from "@/lib/supabase/profile";

export default function RegisterPage() {

	const router = useRouter();

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

		// if a user id is returned (no email confirm required), create an empty profile
		const userId = data?.user?.id;

		if (userId) {
			try {
				await upsertProfile({ id: userId, username: undefined, avatar: "strawberry" });
			} catch (e) {
				console.error(e);
			}
		}

		// redirect to onboarding to finish username/avatar
		router.push("/onboarding");
	};

	return (
		<main className="min-h-screen flex items-center justify-center bg-neutral-100">

			<div className="w-[400px] rounded-[32px] border bg-white p-10">

				<h1 className="text-4xl font-bold mb-8">Register</h1>

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
					onClick={handleRegister}
					className="w-full rounded-2xl bg-black py-4 text-white"
				>
					Create account
				</button>

			</div>

		</main>
	);
}
