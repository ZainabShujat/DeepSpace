import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="w-130 border bg-white p-10 thick-border pixel-shadow">
        <h1 className="text-4xl font-bold mb-6 press-title">Sign in or continue</h1>

        <div className="space-y-4">
          <Link href="/login" className="block w-full text-center bg-black text-white py-3">Login</Link>

          <Link href="/register" className="block w-full text-center border py-3">Register</Link>

          <Link href="/guest" className="block w-full text-center border py-3">Continue as Guest</Link>
        </div>

        <div className="mt-6 text-sm text-neutral-600">
          <p>Guests can join rooms without registering. Accounts persist across devices.</p>
        </div>

      </div>
    </main>
  );
}
