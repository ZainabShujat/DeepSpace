"use client";

import Avatar from "../room/Avatar";

import type { Member } from "@/types/member";

interface Props {
  members: Member[];
  joinSeat: (seatId: string) => void;
  extraTables?: number;
}

export default function CafeLayout({
  members,
  joinSeat,
  extraTables = 0,
}: Props) {

  const baseTables = [
    "cafe-1",
    "cafe-2",
    "cafe-3",
    "cafe-4",
  ];

  const generatedTables = [
    ...baseTables,
    ...Array.from(
      { length: extraTables },
      (_, i) => `extra-cafe-${i}`
    ),
  ];

  const positions = [
    { top: "12%", left: "10%" },
    { top: "18%", right: "12%" },
    { bottom: "15%", left: "18%" },
    { bottom: "12%", right: "18%" },
  ];

  const getMember = (seatId: string) =>
    members.find(
      (m) => m.seat_id === seatId
    );

  return (
    <div className="relative w-full h-[720px] overflow-hidden ds-card cafe-theme">

      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:24px_24px]" />

      {generatedTables.map((tableId, index) => {

        const member = getMember(tableId);

        const pos =
          positions[index % positions.length];

        return (
          <button key={tableId} onClick={() => joinSeat(tableId)} style={pos} className="absolute cafe-table w-[240px] h-[240px] shadow-xl hover:scale-[1.02] transition-all">
            {member ? (
              <div className="flex h-full flex-col items-center justify-center">
                <Avatar
                  avatar={member.avatar}
                  username={member.username}
                />

                <p className="mt-4 font-black text-lg">
                  {member.username}
                </p>

                <p className="text-sm opacity-70">
                  {member.status}
                </p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm opacity-40">
                empty table
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}