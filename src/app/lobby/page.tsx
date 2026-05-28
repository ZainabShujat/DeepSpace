"use client";

import CreateRoom from "@/components/lobby/createroom";
import RoomList from "@/components/lobby/RoomList";

export default function LobbyPage() {

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("username")
      : "";

  const avatar =
    typeof window !== "undefined"
      ? localStorage.getItem("avatar")
      : "";

  return (
    <main className="
      min-h-screen
      bg-[#f4f4f5]
      px-10
      py-12
    ">

      <div className="
        max-w-[1400px]
        mx-auto
      ">

        {/* TOP BAR */}

        <div className="
          flex
          items-center
          justify-between
          mb-12
        ">

          <div>

            <h1 className="
              text-6xl
              font-black
              tracking-tight
            ">
              DeepSpace
            </h1>

            <p className="
              text-neutral-500
              mt-2
              text-lg
            ">
              collaborative study rooms
            </p>

          </div>

          <div className="
            flex
            items-center
            gap-4
          ">

            <div className="
              bg-white
              border
              rounded-2xl
              px-5
              py-3
              flex
              items-center
              gap-3
              shadow-sm
            ">

              <img
                src={avatar || "/avatars/strawberry.png"}
                className="w-12 h-12"
              />

              <div>
                <p className="font-bold">
                  {username}
                </p>

                <p className="
                  text-sm
                  opacity-60
                ">
                  ready to focus
                </p>
              </div>

            </div>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="
                px-6
                py-4
                rounded-2xl
                border
                bg-white
                hover:bg-black
                hover:text-white
                transition-all
              "
            >
              Logout
            </button>

          </div>

        </div>

        {/* MAIN */}

        <div className="
          grid
          grid-cols-2
          gap-10
        ">

          <CreateRoom />
          <RoomList />

        </div>

      </div>

    </main>
  );
}