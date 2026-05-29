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
        <nav className="flex items-center justify-between px-8 py-6">

          <div>
            <h1
              className="press-title text-2xl text-white"
              style={{
                textShadow: "4px 4px 0 #000",
              }}
            >
              DeepSpace
            </h1>

            <p className="text-white/80 text-sm tracking-[0.4em] mt-2">
              FOCUS ROOMS
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/about"
              className="ds-btn px-4 py-2"
            >
              About
            </Link>

            <Link
              href="/auth"
              className="ds-btn px-4 py-2"
            >
              Get Started
            </Link>
          </div>

        </nav>

        {/* Floating Words 
        <span className="pixel-float top-10 left-32">
          focus
        </span>

        <span className="pixel-float top-24 right-48">
          stay on track
        </span>

        <span className="pixel-float top-36 left-1/4">
          productive
        </span>

        <span className="pixel-float top-20 right-1/3">
          collaborate
        </span>

        <span className="pixel-float top-52 right-64">
          deep work
        </span>

        <span className="pixel-float top-64 left-56">
          real-time
        </span>

        <span className="pixel-float top-72 right-44">
          together
        </span>
        */}

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-8">

          <h1
            className="press-title text-6xl md:text-8xl text-white mb-6"
            style={{
              textShadow: "6px 6px 0 #000",
            }}
          >
            DEEPSPACE
          </h1>

          <p
            className="text-white text-xl max-w-3xl mb-4"
            style={{
              textShadow: "2px 2px 0 #000",
            }}
          >
            Collaborative study rooms inspired by libraries,
            cafés and metro journeys.
          </p>

          <p
            className="text-white/90 text-lg mb-10"
            style={{
              textShadow: "2px 2px 0 #000",
            }}
          >
            Choose a room. Take a seat. Study together.
          </p>

          <div className="flex gap-4">

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

          {/* Bottom Keywords */}
          <div
            className="
              mt-16
              flex
              flex-wrap
              justify-center
              gap-6
              text-white
              text-sm
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