
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/backgrounds/landing.png')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/25" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Navbar */}
        <nav className="flex items-start justify-between px-4 md:px-8 py-4 md:py-6">

          <div>
            <h1
              className="press-title text-xl md:text-2xl text-white"
              style={{
                textShadow: "4px 4px 0 #000",
              }}
            >
              DeepSpace
            </h1>

            <p className="text-white/80 text-xs md:text-sm tracking-[0.4em] mt-2">
              FOCUS ROOMS
            </p>
          </div>

          <div className="flex gap-2 md:gap-4">
            <Link
              href="/about"
              className="ds-btn px-3 py-2 md:px-4 md:py-2 text-sm md:text-base"
            >
              About
            </Link>

            <Link
              href="/auth"
              className="ds-btn px-3 py-2 md:px-4 md:py-2 text-sm md:text-base"
            >
              Get Started
            </Link>
          </div>

        </nav>

        {/* Hero */}
        <section
          className="
            flex-1
            flex
            flex-col
            items-center
            justify-center
            text-center
            px-6
            md:px-8
            py-12
            md:py-0
          "
        >

          {/* Desktop Title Only */}
          <h1
            className="
              hidden
              md:block
              press-title
              text-[clamp(5rem,10vw,9rem)]
              leading-none
              mb-6
              text-white
            "
            style={{
              textShadow: "6px 6px 0 #000",
            }}
          >
            DEEPSPACE
          </h1>

          <p
            className="
              text-white
              text-lg
              sm:text-xl
              md:text-xl
              max-w-3xl
              mb-4
            "
            style={{
              textShadow: "2px 2px 0 #000",
            }}
          >
            Create a room, take a seat, and stay accountable with others while you work.
          </p>

          <p
            className="
              text-white/90
              text-base
              md:text-lg
              mb-8
            "
            style={{
              textShadow: "2px 2px 0 #000",
            }}
          >
            Choose a room. Take a seat. Study together.
          </p>

          <div className="flex flex-wrap justify-center gap-4">

            <Link
              href="/explore"
              className="ds-btn px-6 py-3"
            >
              Explore
            </Link>

            <Link
              href="/auth"
              className="ds-btn px-6 py-3"
            >
              Join Now
            </Link>

          </div>

          <div style={{ height: "1em" }} />

          {/* Features List */}
          <div
            className="
              text-white/90
              text-sm
              md:text-base
              space-y-2
              mb-10
            "
            style={{
              textShadow: "1px 1px 0 #000",
            }}
          >
            <p>✓ Public & private rooms</p>
            <p>✓ Shared Pomodoro timers</p>
            <p>✓ Live presence & activity tracking</p>
            <p>✓ Focus session history</p>
            <p>✓ Profiles, avatars & accountability</p>
          </div>

          {/* Bottom Keywords */}
          <div
            className="
              flex
              flex-wrap
              justify-center
              gap-3
              md:gap-6
              text-white
              text-xs
              md:text-sm
              mb-6
            "
          >
            <span>FOCUS</span>
            <span>POMODORO</span>
            <span>PRODUCTIVITY</span>
            <span>DEEP WORK</span>
            <span>COLLABORATION</span>
            <span>ACCOUNTABILITY</span>
          </div>

        </section>

      </div>

    </main>
  );
}