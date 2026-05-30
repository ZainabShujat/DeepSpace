"use client";

import Avatar from "../room/Avatar";

import type { Member } from "@/types/member";

interface Props {
  members: Member[];
  joinSeat: (seatId: string) => void;
  deleteSeat: (seatId: string) => void;
  isHost?: boolean;
  extraBenches?: number;
  hiddenSeatIds?: string[];
}

export default function MetroLayout({
  members,
  joinSeat,
  deleteSeat,
  isHost = false,
  extraBenches = 0,
  hiddenSeatIds = [],
}: Props) {

  const baseSeats = [
    "metro-1",
    "metro-2",
    "metro-3",
    "metro-4",
    "metro-5",
    "metro-6",
  ];

  const generatedSeats = [
    ...baseSeats,
    ...Array.from(
      { length: extraBenches },
      (_, i) => `extra-metro-${i}`
    ),
  ].filter((seatId) => !hiddenSeatIds.includes(seatId));

  const getMember = (seatId: string) =>
    members.find(
      (m) => m.seat_id === seatId
    );

  return (
    <div className="relative w-full min-h-[900px] overflow-x-auto overflow-y-hidden ds-card metro-theme">

      {/* windows */}
      <div className="absolute top-4 left-4 right-4 flex justify-between gap-2 opacity-50 md:top-6 md:left-8 md:right-8">
        {[1, 2, 3].map((w) => (
          <div
            key={w}
            className="h-12 w-28 rounded-[22px] border-2 border-black/20 bg-[#edf3ff] md:h-17.5 md:w-60"
          />
        ))}
      </div>

      {/* aisle */}
      <div className="absolute left-1/2 top-0 h-full w-27.5 -translate-x-1/2 bg-[#b9bbc5]" />

      {/* left seats */}
      <div className="absolute left-[4%] top-[18%] flex flex-col gap-5 md:left-[7%] md:gap-10">
        {generatedSeats
          .slice(0, Math.ceil(generatedSeats.length / 2))
          .map((seatId) => {
            const member = getMember(seatId);

            return (
              <div key={seatId} className="metro-seat relative h-24 w-[260px] overflow-hidden rounded-[28px] border-2 border-black bg-[#8f919d] p-0 shadow-[0_10px_0_#676873] transition-all hover:translate-y-1 hover:shadow-[0_6px_0_#676873] md:h-27.5 md:w-[320px]">
                <button type="button" onClick={() => joinSeat(seatId)} className="absolute inset-0" aria-label={`Join ${seatId}`} />
                {isHost && (
                  <button
                    type="button"
                    aria-label={`Delete ${seatId}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteSeat(seatId);
                    }}
                    className="absolute right-2 top-2 z-10 rounded-full border border-black bg-white px-2 py-0.5 text-[10px] font-black leading-none text-black shadow-[1px_1px_0_#000]"
                  >
                    ×
                  </button>
                )}
                {member ? (
                  <div className="flex items-center gap-5 p-5">
                    <Avatar avatar={member.avatar} username={member.username} />

                    <div className="text-left">
                      <p className="font-black text-lg">{member.username}</p>

                      <p className="text-sm opacity-70">{member.status}</p>

                      {member.focus_task && (
                        <p className="mt-1 max-w-55 text-xs font-medium leading-snug text-black/80">
                          {member.focus_task}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm opacity-40">empty seat</div>
                )}
              </div>
            );
          })}
      </div>

      {/* right seats */}
      <div className="absolute right-[4%] top-[18%] flex flex-col gap-5 md:right-[7%] md:gap-10">
        {generatedSeats
          .slice(Math.ceil(generatedSeats.length / 2))
          .map((seatId) => {
            const member = getMember(seatId);

            return (
              <div key={seatId} className="relative h-24 w-[260px] rounded-[28px] border-2 border-black bg-[#8f919d] shadow-[0_10px_0_#676873] transition-all hover:translate-y-1 hover:shadow-[0_6px_0_#676873] md:h-27.5 md:w-[320px]">
                <button type="button" onClick={() => joinSeat(seatId)} className="absolute inset-0" aria-label={`Join ${seatId}`} />
                {isHost && (
                  <button
                    type="button"
                    aria-label={`Delete ${seatId}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteSeat(seatId);
                    }}
                    className="absolute right-2 top-2 z-10 rounded-full border border-black bg-white px-2 py-0.5 text-[10px] font-black leading-none text-black shadow-[1px_1px_0_#000]"
                  >
                    ×
                  </button>
                )}
                {member ? (
                  <div className="flex items-center gap-5 p-5">
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
                        <p className="mt-1 max-w-55 text-xs font-medium leading-snug text-black/80">
                          {member.focus_task}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm opacity-40">
                    empty seat
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
