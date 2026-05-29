import Link from "next/link";
import BackLink from "@/components/navigation/BackLink";

export default function AboutPage() {
  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat p-12"
      style={{ backgroundImage: "url('/backgrounds/lobby.png')" }}
    >
      <div className="mx-auto max-w-4xl bg-white p-10 thick-border pixel-shadow">
        <div className="mb-6">
          <BackLink href="/lobby" label="Back to lobby" />
        </div>

        <h1 className="mb-4 text-4xl font-black press-title">What is DeepSpace?</h1>
        <p className="mb-4 text-neutral-700">
          DeepSpace is a multiplayer study room platform inspired by the feeling of entering a library, café, or shared workspace with other people quietly working beside you.
        </p>

        <p className="mb-8 text-neutral-700">
          Instead of tracking productivity alone, DeepSpace focuses on presence. Users can create rooms, take seats, join focus sessions, and see activity happen in real time.
        </p>

        <p className="mb-10 text-neutral-700">
          Whether you're studying with friends or sharing a space with strangers, the goal is simple: show up, sit down, and work together.
        </p>

        <hr className="my-8 border-black/10" />

        <h2 className="mb-5 text-2xl font-black press-title">Features</h2>

        <div className="space-y-6 text-neutral-700">
          <section>
            <h3 className="mb-2 text-lg font-bold">Shared Study Rooms</h3>
            <p>Create public or private rooms with different layouts and capacities.</p>
          </section>

          <section>
            <h3 className="mb-2 text-lg font-bold">Live Presence</h3>
            <p>See who is in a room, where they are sitting, and what they are currently doing.</p>
          </section>

          <section>
            <h3 className="mb-2 text-lg font-bold">Focus Sessions</h3>
            <p>Start timed sessions and keep everyone synchronized.</p>
          </section>

          <section>
            <h3 className="mb-2 text-lg font-bold">Activity History</h3>
            <p>Track joins, seats, status changes, and session events as they happen.</p>
          </section>

          <section>
            <h3 className="mb-2 text-lg font-bold">Guest Friendly</h3>
            <p>No account is required to start using DeepSpace.</p>
          </section>
        </div>

        <hr className="my-8 border-black/10" />

        <h2 className="mb-4 text-2xl font-black press-title">Why it exists</h2>

        <p className="mb-4 text-neutral-700">Most productivity tools focus on tasks.</p>

        <p className="mb-4 text-neutral-700">DeepSpace focuses on environments.</p>

        <p className="text-neutral-700">
          Sometimes seeing another person quietly working is enough to help you begin.
        </p>

        <div className="mt-8">
          <Link href="/" className="text-sm underline">Back to landing</Link>
        </div>
      </div>
    </main>
  );
}
