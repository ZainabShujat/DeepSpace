"use client";

import Avatar from "../room/Avatar";

interface Member {
  id: string;
  username: string;
  avatar: string;
  status: string;
  seat_id?: string | null;
}

interface Props {
  members: Member[];
  joinSeat: (seatId: string) => void;
  extraCubicles?: number;
}

export default function LibraryLayout({
  members,
  joinSeat,
  extraCubicles = 0,
}: Props) {

  const baseCubicles = [
    "library-1",
    "library-2",
    "library-3",
    "library-4",
  ];

  const generatedCubicles = [
    ...baseCubicles,
    ...Array.from(
      { length: extraCubicles },
      (_, i) => `extra-library-${i}`
    ),
  ];

  const getMember = (seatId: string) =>
    members.find(
      (m) => m.seat_id === seatId
    );

  return (
    <div className="relative w-full h-[720px] overflow-hidden rounded-[42px] border-2 border-black bg-[#d9d3cb]">

      {/* shelves */}
      <div className="absolute left-0 top-0 h-full w-[70px] bg-[#514a44]" />
      <div className="absolute right-0 top-0 h-full w-[70px] bg-[#514a44]" />

      {/* cubicles */}
      <div className="absolute left-1/2 top-[14%] -translate-x-1/2 flex flex-col gap-10">

        {generatedCubicles.map((cubicleId) => {

          const member =
            getMember(cubicleId);

          return (
            <button
              key={cubicleId}
              onClick={() => joinSeat(cubicleId)}
              className="w-[820px] h-[90px] rounded-[24px] border-2 border-black bg-[#b8b1aa] px-8 shadow-[0_8px_0_#8d867f] hover:translate-y-1 hover:shadow-[0_4px_0_#8d867f] transition-all"
            >
              {member ? (
                <div className="flex h-full items-center gap-5">
                  <Avatar
                    avatar={member.avatar}
                    username={member.username}
                  />

                  <div className="text-left">
                    <p className="font-black text-lg">
                      {member.username}
                    </p>

                    <p className="text-sm opacity-70">
                      {member.status}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm opacity-40">
                  empty cubicle
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}