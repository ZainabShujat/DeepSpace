"use client";

import Avatar from "../room/Avatar";

import type { Member } from "@/types/member";

interface Props {
  members: Member[];
  joinSeat: (seatId: string) => void;
  deleteTable: (tableId: string) => void;
  deleteSeat: (seatId: string) => void;
  isHost?: boolean;
  extraTables?: number;
  hiddenTableIds?: string[];
  hiddenSeatIds?: string[];
}

export default function CafeLayout({
  members,
  joinSeat,
  deleteTable,
  deleteSeat,
  isHost = false,
  extraTables = 0,
  hiddenTableIds = [],
  hiddenSeatIds = [],
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
  ].filter((tableId) => !hiddenTableIds.includes(tableId));
  const count = generatedTables.length;
  const columns = count <= 4 ? 2 : count <= 9 ? 3 : count <= 16 ? 4 : 5;
  const rows = Math.ceil(count / columns);
  const boardMinHeight = Math.max(920, rows * 340 + 140);

  const getMember = (seatId: string) =>
    members.find(
      (m) => m.seat_id === seatId
    );

  return (
    <div className="relative w-full overflow-x-auto overflow-y-hidden ds-card cafe-theme" style={{ minHeight: `${boardMinHeight}px` }}>

      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div
        className="absolute inset-0 grid gap-8 p-4 md:gap-14 md:p-8"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {generatedTables.map((tableId, index) => {
          const member = getMember(tableId);
          const tableNumber = index + 1;
          const seats = [1, 2, 3, 4].map((index) => ({
            seatId: `${tableId}-seat-${index}`,
            angle: index === 1 ? "top-3 left-1/2 -translate-x-1/2" : index === 2 ? "right-3 top-1/2 -translate-y-1/2" : index === 3 ? "bottom-3 left-1/2 -translate-x-1/2" : "left-3 top-1/2 -translate-y-1/2",
          }));

          return (
            <div key={tableId} className="relative mx-auto my-auto flex h-40 w-40 items-center justify-center md:h-64 md:w-64">
              <div className="absolute inset-0 rounded-full border-2 border-black bg-[#df7f17] shadow-[0_10px_0_#b55d0d]" />
              {isHost && (
                <button
                  type="button"
                  aria-label={`Delete ${tableId}`}
                  onClick={() => deleteTable(tableId)}
                  className="absolute right-3 top-3 z-20 rounded-full border border-black bg-white px-2 py-0.5 text-[10px] font-black leading-none text-black shadow-[1px_1px_0_#000]"
                >
                  ×
                </button>
              )}
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-black/70">Table</p>
                <p className="text-2xl font-black text-black">{tableNumber}</p>
              </div>

              {member && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="pointer-events-auto flex flex-col items-center justify-center rounded-full bg-white/90 px-3 py-2 text-center shadow-[2px_2px_0_#000]">
                    <Avatar avatar={member.avatar} username={member.username} />
                    <p className="mt-2 text-xs font-black">{member.username}</p>
                    <p className="text-[10px] opacity-70">{member.status}</p>
                  </div>
                </div>
              )}

              {seats.map((seat) => {
                const seatMember = getMember(seat.seatId);

                if (hiddenSeatIds.includes(seat.seatId)) {
                  return null;
                }

                return (
                  <div key={seat.seatId} className={`absolute ${seat.angle}`}>
                    <button
                      type="button"
                      onClick={() => joinSeat(seat.seatId)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[#f2c36b] shadow-[0_4px_0_#b97f1f] transition-all hover:scale-[1.03] md:h-14 md:w-14"
                    >
                      {seatMember ? (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-white/90 p-1">
                          <Avatar avatar={seatMember.avatar} username={seatMember.username} />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/55">Seat</span>
                      )}
                    </button>

                    {isHost && (
                      <button
                        type="button"
                        aria-label={`Delete ${seat.seatId}`}
                        onClick={() => deleteSeat(seat.seatId)}
                        className="absolute -right-1 -top-1 z-20 rounded-full border border-black bg-white px-1.5 py-0.5 text-[9px] font-black leading-none text-black shadow-[1px_1px_0_#000]"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}