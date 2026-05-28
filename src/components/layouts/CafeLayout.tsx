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
}

type TableSeat = {
  seatId: string;
  top: string;
  left: string;
};

type CafeTable = {
  tableId: string;
  top: string;
  left: string;
  seatSize: string;
  seats: TableSeat[];
};

const tables: CafeTable[] = [
  {
    tableId: "cafe-1",
    top: "16%",
    left: "18%",
    seatSize: "74px",
    seats: [
      { seatId: "cafe-1-north", top: "-14%", left: "50%" },
      { seatId: "cafe-1-south", top: "102%", left: "50%" },
      { seatId: "cafe-1-west", top: "50%", left: "-14%" },
      { seatId: "cafe-1-east", top: "50%", left: "102%" },
    ],
  },
  {
    tableId: "cafe-2",
    top: "18%",
    left: "60%",
    seatSize: "74px",
    seats: [
      { seatId: "cafe-2-north", top: "-14%", left: "50%" },
      { seatId: "cafe-2-south", top: "102%", left: "50%" },
      { seatId: "cafe-2-west", top: "50%", left: "-14%" },
      { seatId: "cafe-2-east", top: "50%", left: "102%" },
    ],
  },
  {
    tableId: "cafe-3",
    top: "58%",
    left: "22%",
    seatSize: "74px",
    seats: [
      { seatId: "cafe-3-north", top: "-14%", left: "50%" },
      { seatId: "cafe-3-south", top: "102%", left: "50%" },
      { seatId: "cafe-3-west", top: "50%", left: "-14%" },
      { seatId: "cafe-3-east", top: "50%", left: "102%" },
    ],
  },
  {
    tableId: "cafe-4",
    top: "60%",
    left: "62%",
    seatSize: "74px",
    seats: [
      { seatId: "cafe-4-north", top: "-14%", left: "50%" },
      { seatId: "cafe-4-south", top: "102%", left: "50%" },
      { seatId: "cafe-4-west", top: "50%", left: "-14%" },
      { seatId: "cafe-4-east", top: "50%", left: "102%" },
    ],
  },
];

export default function CafeLayout({ members, joinSeat }: Props) {
  const getMember = (seatId: string, fallbackIndex: number) =>
    members.find((member) => member.seat_id === seatId) || members[fallbackIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[40px] border-2 border-black bg-[#f3e7c9]"
      style={{ height: "700px" }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="absolute left-5 top-5 text-xs uppercase tracking-[0.4em] text-[#6b2d00]/60">
        Cafe seating
      </div>

      {tables.map((table, tableIndex) => (
        <div key={table.tableId} className="absolute" style={{ top: table.top, left: table.left }}>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-[#6b2d00] bg-[#c35a00] shadow-xl"
            style={{ width: table.seatSize, height: table.seatSize }}
          />

          {table.seats.map((seat, seatIndex) => {
            const member = getMember(seat.seatId, tableIndex * 4 + seatIndex);

            return (
              <button
                key={seat.seatId}
                onClick={() => joinSeat(seat.seatId)}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#6b2d00] bg-[#fff6e5] shadow-md flex items-center justify-center"
                style={{
                  top: seat.top,
                  left: seat.left,
                  width: "64px",
                  height: "64px",
                }}
              >
                {member ? (
                  <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-[10px] font-semibold text-[#43210f]" style={{ backgroundColor: "#fff" }}>
                    <Avatar avatar={member.avatar} username={member.username} />
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#6b2d00]">+</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
