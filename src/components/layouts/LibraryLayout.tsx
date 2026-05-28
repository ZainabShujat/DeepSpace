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

type Cubicle = {
  row: number;
  tableId: string;
  top: string;
  left: string;
  width: string;
  seats: { seatId: string; top: string; left: string }[];
};

const cubicles: Cubicle[] = [
  {
    row: 1,
    tableId: "lib-cube-1",
    top: "18%",
    left: "14%",
    width: "340px",
    seats: [
      { seatId: "library-1", top: "-16%", left: "50%" },
      { seatId: "library-2", top: "50%", left: "-18%" },
      { seatId: "library-3", top: "50%", left: "118%" },
      { seatId: "library-4", top: "116%", left: "50%" },
      { seatId: "library-1b", top: "50%", left: "25%" },
      { seatId: "library-1c", top: "50%", left: "75%" },
    ],
  },
  {
    row: 2,
    tableId: "lib-cube-2",
    top: "18%",
    left: "56%",
    width: "340px",
    seats: [
      { seatId: "library-5", top: "-16%", left: "50%" },
      { seatId: "library-6", top: "50%", left: "-18%" },
      { seatId: "library-7", top: "50%", left: "118%" },
      { seatId: "library-8", top: "116%", left: "50%" },
      { seatId: "library-5b", top: "50%", left: "25%" },
      { seatId: "library-5c", top: "50%", left: "75%" },
    ],
  },
];

export default function LibraryLayout({ members, joinSeat }: Props) {
  const getMember = (seatId: string, fallbackIndex: number) =>
    members.find((member) => member.seat_id === seatId) || members[fallbackIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[40px] border-2 border-black bg-[#d7d1ca]"
      style={{ height: "700px" }}
    >
      <div className="absolute left-0 top-0 h-full bg-[#4f4943]" style={{ width: "60px" }} />
      <div className="absolute right-0 top-0 h-full bg-[#4f4943]" style={{ width: "60px" }} />

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "100% 80px",
        }}
      />

      <div className="absolute left-7 top-5 text-xs uppercase tracking-[0.45em] text-[#4f4943]/60">
        Library cubicles
      </div>

      {cubicles.map((cubicle) => (
        <div key={cubicle.tableId} className="absolute" style={{ top: cubicle.top, left: cubicle.left, width: cubicle.width }}>
          <div className="relative mx-auto rounded-[18px] border-4 border-[#433a31] bg-[#b8b1aa] shadow-[0_8px_0_rgba(0,0,0,0.15)]" style={{ height: "120px" }}>
            <div className="absolute left-0 top-0 h-full bg-[#5b4f43]" style={{ width: "18px" }} />
            <div className="absolute right-0 top-0 h-full bg-[#5b4f43]" style={{ width: "18px" }} />

            <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-[#433a31]/30" style={{ left: "18px", right: "18px" }} />
            <div className="absolute left-1/2 top-0 h-full -translate-x-1/2 bg-[#433a31]/25" style={{ width: "2px" }} />

            {cubicle.seats.map((seat, seatIndex) => {
              const member = getMember(seat.seatId, (cubicle.row - 1) * 6 + seatIndex);

              return (
                <button
                  key={seat.seatId}
                  onClick={() => joinSeat(seat.seatId)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#433a31] bg-[#f7f3ee] shadow-md flex items-center justify-center"
                  style={{ top: seat.top, left: seat.left, width: "62px", height: "62px" }}
                >
                  {member ? (
                    <Avatar avatar={member.avatar} username={member.username} />
                  ) : (
                    <span className="text-[10px] font-bold text-[#433a31]">+</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
