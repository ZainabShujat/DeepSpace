import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen p-12 bg-neutral-100">
      <div className="mx-auto max-w-4xl bg-white p-10 thick-border pixel-shadow">
        <h1 className="text-4xl font-black press-title mb-4">What is DeepSpace?</h1>
        <p className="text-neutral-700 mb-6">
          DeepSpace is a small collaborative study app where people join themed rooms, claim seats, and run timed focus sessions together.
        </p>

        <p className="text-neutral-600">
          Use the Lobby to create or join rooms. Host controls let a room owner start and end sessions, and session history is recorded for reflection.
        </p>

        <div className="mt-8">
          <Link href="/" className="text-sm underline">Back to landing</Link>
        </div>
      </div>
    </main>
  );
}
