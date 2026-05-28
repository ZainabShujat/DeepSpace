interface Member {
  id: string;
  username: string;
  status: string;
}

interface Props {
  members: Member[];
}

const cafeSeats = [
  { top: "25%", left: "20%" },
  { top: "25%", left: "70%" },

  { top: "55%", left: "20%" },
  { top: "55%", left: "70%" },
];

export default function CafeLayout({
  members,
}: Props) {
  return (
    <div className="relative w-full h-[700px] rounded-3xl overflow-hidden border bg-[#efe3d3]">

      {/* LEFT TABLE */}
      <div className="absolute top-[20%] left-[15%] w-36 h-36 rounded-full border-4 bg-[#c49a6c]" />

      {/* RIGHT TABLE */}
      <div className="absolute top-[20%] right-[15%] w-36 h-36 rounded-full border-4 bg-[#c49a6c]" />

      {/* BOTTOM LEFT */}
      <div className="absolute bottom-[15%] left-[15%] w-36 h-36 rounded-full border-4 bg-[#c49a6c]" />

      {/* BOTTOM RIGHT */}
      <div className="absolute bottom-[15%] right-[15%] w-36 h-36 rounded-full border-4 bg-[#c49a6c]" />

      {/* SHARE CODE */}
      <button className="absolute top-6 right-6 border rounded-xl px-4 py-2 bg-white">
        Share Code
      </button>

      {/* ADD TABLE */}
      <button className="absolute top-[45%] left-[43%] border rounded-xl px-4 py-3 bg-white">
        Add Table +
      </button>

      {/* MEMBERS */}
      {members.map((member, index) => {
        const position =
          cafeSeats[index % cafeSeats.length];

        return (
          <div
            key={member.id}
            className="absolute transition-all duration-500"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
              {member.username.charAt(0)}
            </div>

            <p className="text-center mt-2 text-sm">
              {member.username}
            </p>
          </div>
        );
      })}
    </div>
  );
}