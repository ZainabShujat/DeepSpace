"use client";

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
  extraBenches?: number;
}

const baseLeftSeats = ["metro-left-1", "metro-left-2", "metro-left-3"];
const baseRightSeats = ["metro-right-1", "metro-right-2", "metro-right-3"];

export default function MetroLayout({ members, joinSeat, extraBenches = 0 }: Props) {
  const getSeatMembers = (seatId: string) =>
    members.filter((member) => member.seat_id === seatId).slice(0, 2);

  const leftSeats = [
    ...baseLeftSeats,
    ...Array.from({ length: extraBenches }, (_, index) => `metro-left-extra-${index + 1}`),
  ];

  const rightSeats = [
    ...baseRightSeats,
    ...Array.from({ length: extraBenches }, (_, index) => `metro-right-extra-${index + 1}`),
  ];

  const renderBench = (seatId: string, top: string, left: string) => {
    const occupants = getSeatMembers(seatId);

    const renderOccupant = (member: Member) => (
      <div key={member.id} className="flex min-w-0 flex-1 flex-col items-center justify-center text-center text-white">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-white">
          <img src={`/avatars/${member.avatar}.png`} alt={member.username} className="h-9 w-9 object-contain" />
        </div>
        <p className="mt-1 truncate text-[10px] font-semibold" style={{ maxWidth: "90px" }}>{member.username}</p>
        <p className="truncate text-[9px] opacity-70" style={{ maxWidth: "90px" }}>{member.status}</p>
      </div>
    );

    return (
      <button
        key={seatId}
        onClick={() => joinSeat(seatId)}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[28px] border-2 border-black bg-[#8f909c] shadow-[0_8px_0_#666] flex items-center justify-center overflow-hidden"
        style={{ left, top, width: "320px", height: "110px" }}
      >
        {occupants.length > 0 ? (
          <div className="flex w-full items-center justify-evenly px-5 gap-4">
            {occupants.map(renderOccupant)}
            {occupants.length === 1 && <div className="flex-1" />}
          </div>
        ) : (
          <span className="text-xs font-bold text-white">+</span>
        )}
      </button>
    );
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-[40px] border-2 border-black bg-linear-to-b from-[#d9d9de] to-[#cfcfd6]"
      style={{ height: `${700 + extraBenches * 140}px` }}
    >
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      <div className="absolute top-0 left-1/2 h-full -translate-x-1/2 bg-[#bfc1c9]" style={{ width: "120px" }} />

      <div className="absolute left-[6%] top-[14%] flex h-[72%] flex-col justify-between">
        {leftSeats.map((seatId, index) =>
          renderBench(seatId, `${14 + index * (68 / Math.max(leftSeats.length - 1, 1))}%`, "18%")
        )}
      </div>

      <div className="absolute right-[6%] top-[14%] flex h-[72%] flex-col justify-between">
        {rightSeats.map((seatId, index) =>
          renderBench(seatId, `${14 + index * (68 / Math.max(rightSeats.length - 1, 1))}%`, "82%")
        )}
      </div>

      <div className="absolute left-1/2 bottom-6 -translate-x-1/2 text-sm opacity-50">
        DeepSpace Metro aisle
      </div>
    </div>
  );
}
