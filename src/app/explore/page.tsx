import Link from "next/link";
import BackLink from "@/components/navigation/BackLink";

const features = [
  {
    title: "Lobby",
    description: "See public rooms, start a room, or jump into a private room by code.",
    href: "/lobby",
  },
  {
    title: "Rooms",
    description: "Choose a themed room, take a seat, and track who is currently there.",
    href: "/lobby",
  },
  {
    title: "Activity",
    description: "Review join, seat, session, and host events in a readable history view.",
    href: "/activity",
  },
  {
    title: "Profile",
    description: "Check whether you are signed in or in guest mode before saving activity.",
    href: "/profile",
  },
];

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#ececec] p-4 sm:p-6 md:p-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <BackLink href="/lobby" label="Back to lobby" />

        <section className="ds-card overflow-hidden bg-white">
          <div className="library-header" />
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
            <div>
              <p className="press-button mb-4 text-sm text-black/60">EXPLORE DEEPSPACE</p>
              <h1 className="press-title text-3xl leading-tight md:text-3xl">
                Step through the space before you join it.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-black/70">
                DeepSpace is built around a few simple areas: a lobby for rooms, live rooms for focused study,
                activity history for what happened, and a profile that keeps track of who you are.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/lobby" className="ds-btn px-5 py-3">
                  Go to Lobby
                </Link>
                <Link href="/auth" className="ds-btn ds-btn-secondary px-5 py-3">
                  Login / Register
                </Link>
                <Link href="/about" className="ds-btn ds-btn-secondary px-5 py-3">
                  About <span className="press-title inline-block align-middle text-[0.85em]">DeepSpace</span>
                </Link>
              </div>
            </div>

            <div className="ds-panel p-5">
              <h2 className="text-lg font-semibold">What you can do here</h2>
              <div className="mt-4 space-y-3 text-sm">
                <p>Browse public rooms and see which spaces are active.</p>
                <p>Create a room with public/private visibility and a member limit.</p>
                <p>Join by code, manage seats, and follow live activity updates.</p>
                <p>Track focus sessions and revisit history later.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold press-title">Main Areas</h2>
              <p className="mt-2 text-sm text-black/60">A quick map of the site, so the Explore page actually tells you what exists.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href} className="ds-card block bg-white p-5 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#000]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-black/70">{feature.description}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-black/40">Open</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
