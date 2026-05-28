"use client";

import Avatar from "../room/Avatar";

interface Props {
  members: any[];
  joinSeat: (seatId: string) => void;
}

export default function LibraryLayout({
  members,
  joinSeat,
}: Props) {

  const sections = [
    {
      id: "section-1",
      top: "20%",
      left: "10%",
    },
    {
      id: "section-2",
      top: "20%",
      left: "55%",
    },
  ];

  return (
    <div className="
      relative
      w-full
      h-[700px]
      overflow-hidden
      rounded-[40px]
      border
      bg-[#ece8df]
    ">

      <div className="
        absolute
        inset-y-0
        left-0
        w-[50px]
        bg-[#4d463f]
      " />

      <div className="
        absolute
        inset-y-0
        right-0
        w-[50px]
        bg-[#4d463f]
      " />

      {sections.map((section) => {

        const seatedUser =
          members.find(
            (member) =>
              member.seat_id === section.id
          );

        return (

          <button
            key={section.id}
            onClick={() =>
              joinSeat(section.id)
            }
            className="
              absolute
              w-[380px]
              h-[140px]
              rounded-[24px]
              border
              bg-[#b9b3ad]
              shadow-md
              hover:scale-[1.01]
              transition-all
            "
            style={{
              top: section.top,
              left: section.left,
            }}
          >

            {seatedUser && (

              <div className="
                absolute
                inset-0
                flex
                items-center
                justify-center
              ">

                <div className="
                  flex
                  flex-col
                  items-center
                ">

                  <Avatar
                    avatar={seatedUser.avatar}
                    username={seatedUser.username}
                  />

                  <p className="mt-2 font-semibold">
                    {seatedUser.username}
                  </p>

                  <p className="text-sm opacity-60">
                    {seatedUser.status}
                  </p>

                </div>

              </div>

            )}

          </button>

        );

      })}

    </div>
  );
}