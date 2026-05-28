import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100">

      <div className="w-[500px] border rounded-[32px] bg-white p-10 shadow-lg">

        <h1 className="text-5xl font-bold mb-4">
          DeepSpace
        </h1>

        <p className="text-neutral-500 mb-10">
          Study together in themed focus rooms.
        </p>

        <div className="space-y-4">

          <Link href="/login">
            <button className="w-full bg-black text-white py-4 rounded-2xl text-lg">
              Login
            </button>
          </Link>

          <Link href="/register">
            <button className="w-full border py-4 rounded-2xl text-lg">
              Register
            </button>
          </Link>

          <Link href="/guest">
            <button className="w-full border border-dashed py-4 rounded-2xl text-lg">
              Continue as Guest
            </button>
          </Link>

        </div>

      </div>
    </main>
  );
}