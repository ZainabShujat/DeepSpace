"use client";

import Avatar from "../room/Avatar";

import type { Member } from "@/types/member";

interface Props {
  members: Member[];
  joinSeat: (seatId: string) => void;
  deleteSeat: (seatId: string) => void;
  isHost?: boolean;
  extraCubicles?: number;
  hiddenCubicleIds?: string[];
}

export default function LibraryLayout({
  members,
  joinSeat,
  deleteSeat,
  isHost = false,
  extraCubicles = 0,
  hiddenCubicleIds = [],
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
  ].filter((cubicleId) => !hiddenCubicleIds.includes(cubicleId));

  const getMember = (seatId: string) =>
    members.find(
      (m) => m.seat_id === seatId
    );

  return (
    <div className="relative w-full min-h-[900px] overflow-x-auto overflow-y-hidden ds-card library-theme">

      {/* shelves */}
      <div className="absolute left-0 top-0 h-full w-12 bg-[#514a44] md:w-17.5" />
      <div className="absolute right-0 top-0 h-full w-12 bg-[#514a44] md:w-17.5" />

      {/* cubicles */}
      <div className="absolute left-1/2 top-[14%] -translate-x-1/2 flex flex-col gap-5 md:gap-10">

        {generatedCubicles.map((cubicleId) => {

          const member =
            getMember(cubicleId);

          return (
            <div key={cubicleId} className="library-cubicle relative h-18 w-[calc(100vw-5rem)] max-w-[205px] px-4 shadow-[0_8px_0_#8d867f] transition-all hover:translate-y-1 hover:shadow-[0_4px_0_#8d867f] md:h-22.5 md:px-8 md:w-205">
              <button type="button" onClick={() => joinSeat(cubicleId)} className="absolute inset-0" aria-label={`Join ${cubicleId}`} />
              {isHost && (
                <button
                  type="button"
                  aria-label={`Delete ${cubicleId}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteSeat(cubicleId);
                  }}
                  className="absolute right-2 top-2 z-10 rounded-full border border-black bg-white px-2 py-0.5 text-[10px] font-black leading-none text-black shadow-[1px_1px_0_#000]"
                >
                  ×
                </button>
              )}
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

                      {member.focus_task && (
                        <p className="mt-1 max-w-140 text-xs font-medium leading-snug text-black/80">
                          {member.focus_task}
                        </p>
                      )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm opacity-40">
                  empty cubicle
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}