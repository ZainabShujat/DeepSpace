
"use client";

import Avatar from "../room/Avatar";

interface Props {
  members: any[];
  joinSeat: (seatId: string) => void;
}

export default function MetroLayout({
  members,
  joinSeat,
}: Props) {

  const seats = [
    {
      id: "seat-1",
      top: "18%",
      left: "6%",
    },
    {
      id: "seat-2",
      top: "18%",
      left: "37%",
    },
    {
      id: "seat-3",
      top: "18%",
      left: "68%",
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
      bg-gradient-to-b
      from-[#d9d9df]
      to-[#cfcfd8]
    ">

      <div className="
        absolute
        left-1/2
        top-0
        h-full
        w-[80px]
        -translate-x-1/2
        bg-[#d7d7dc]
      " />

      <div className="
        absolute
        left-1/2
        top-0
        h-full
        w-[6px]
        -translate-x-[20px]
        bg-[#b8b8bf]
      " />

      <div className="
        absolute
        left-1/2
        top-0
        h-full
        w-[6px]
        translate-x-[14px]
        bg-[#b8b8bf]
      " />

      {seats.map((seat) => {

        const seatedUser =
          members.find(
            (member) =>
              member.seat_id === seat.id
          );

        return (

          <button
            key={seat.id}
            onClick={() =>
              joinSeat(seat.id)
            }
            className="
              absolute
              w-[280px]
              h-[140px]
              rounded-[28px]
              border
              border-black/20
              bg-[#a9a9b5]
              shadow-md
              transition-all
              hover:scale-[1.02]
            "
            style={{
              top: seat.top,
              left: seat.left,
            }}
          >

            <div className="
              absolute
              inset-x-0
              top-0
              h-[18px]
              rounded-t-[28px]
              bg-black/10
            " />

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

                  <p className="
                    mt-2
                    text-sm
                    font-semibold
                  ">
                    {seatedUser.username}
                  </p>

                  <p className="
                    text-xs
                    opacity-60
                  ">
                    {seatedUser.status}
                  </p>

                </div>

              </div>

            )}

          </button>

        );

      })}

      <div className="
        absolute
        bottom-4
        left-1/2
        -translate-x-1/2
        text-xs
        opacity-40
      ">
        DeepSpace Metro
      </div>

    </div>

  );
}
