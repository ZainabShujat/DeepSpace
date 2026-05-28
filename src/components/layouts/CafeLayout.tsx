"use client";

import Avatar from "../room/Avatar";

interface Props {
  members: any[];
  joinSeat: (seatId: string) => void;
}

export default function CafeLayout({
  members,
  joinSeat,
}: Props) {

  const tables = [
    {
      id: "table-1",
      top: "15%",
      left: "10%",
    },
    {
      id: "table-2",
      top: "55%",
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
      bg-[#f3e7c0]
    ">

      <div className="
        absolute
        inset-0
        opacity-10
        bg-[radial-gradient(#000_1px,transparent_1px)]
        [background-size:24px_24px]
      " />

      {tables.map((table) => {

        const seatedUser =
          members.find(
            (member) =>
              member.seat_id === table.id
          );

        return (
          <button
            key={table.id}
            onClick={() =>
              joinSeat(table.id)
            }
            className="
              absolute
              w-[240px]
              h-[240px]
              rounded-full
              bg-[#c25b00]
              border-[6px]
              border-[#8f3f00]
              shadow-lg
              hover:scale-[1.02]
              transition-all
            "
            style={{
              top: table.top,
              left: table.left,
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

                  <p className="text-sm opacity-70">
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