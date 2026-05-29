"use client";

import Avatar from "../room/Avatar";

import type { Member } from "@/types/member";

interface Props {
  members: Member[];
  joinSeat: (seatId: string) => void;
  extraBenches?: number;
}

export default function MetroLayout({
  members,
  joinSeat,
  extraBenches = 0,
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
  ];

  const getMember = (seatId: string) =>
    members.find(
      (m) => m.seat_id === seatId
    );

  return (
    <div className="relative w-full h-[720px] overflow-hidden ds-card metro-theme">

      {/* windows */}
      <div className="absolute top-6 left-8 right-8 flex justify-between opacity-50">
        {[1, 2, 3].map((w) => (
          <div
            key={w}
            className="w-[240px] h-[70px] rounded-[22px] border-2 border-black/20 bg-[#edf3ff]"
          />
        ))}
      </div>

      {/* aisle */}
      <div className="absolute left-1/2 top-0 h-full w-[110px] -translate-x-1/2 bg-[#b9bbc5]" />

      {/* left seats */}
      <div className="absolute left-[7%] top-[18%] flex flex-col gap-10">
        {generatedSeats
          .slice(0, Math.ceil(generatedSeats.length / 2))
          .map((seatId) => {
            const member = getMember(seatId);

            return (
              <button key={seatId} onClick={() => joinSeat(seatId)} className="metro-seat w-[320px] h-[110px] p-0 overflow-hidden rounded-[28px] border-2 border-black bg-[#8f919d] shadow-[0_10px_0_#676873] hover:translate-y-1 hover:shadow-[0_6px_0_#676873] transition-all">
                {member ? (
                  <div className="flex items-center gap-5 p-5">
                    <Avatar avatar={member.avatar} username={member.username} />

                    <div className="text-left">
                      <p className="font-black text-lg">{member.username}</p>

                      <p className="text-sm opacity-70">{member.status}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm opacity-40">empty seat</div>
                )}
              </button>
            );
          })}
      </div>

      {/* right seats */}
      <div className="absolute right-[7%] top-[18%] flex flex-col gap-10">
        {generatedSeats
          .slice(Math.ceil(generatedSeats.length / 2))
          .map((seatId) => {
            const member = getMember(seatId);

            return (
              <button
                key={seatId}
                onClick={() => joinSeat(seatId)}
                className="w-[320px] h-[110px] rounded-[28px] border-2 border-black bg-[#8f919d] shadow-[0_10px_0_#676873] hover:translate-y-1 hover:shadow-[0_6px_0_#676873] transition-all"
              >
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
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm opacity-40">
                    empty seat
                  </div>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
