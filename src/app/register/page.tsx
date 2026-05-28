"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {

	const router = useRouter();

	const [username, setUsername] = useState("");

	const handleRegister = () => {
		if (!username) return;

		localStorage.setItem("username", username);

		router.push("/onboarding");
	};

	return (
		<main className="min-h-screen flex items-center justify-center bg-neutral-100">

			<div className="w-[400px] rounded-[32px] border bg-white p-10">

				<h1 className="text-4xl font-bold mb-8">Register</h1>

				<input
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="username"
					className="w-full border rounded-2xl px-4 py-4 mb-6"
				/>

				<button
					onClick={handleRegister}
					className="w-full rounded-2xl bg-black py-4 text-white"
				>
					Continue
				</button>

			</div>

		</main>
	);
}
