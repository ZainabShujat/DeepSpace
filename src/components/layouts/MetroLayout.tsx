interface Member {
  id: string;
  username: string;
  status: string;
}

interface Props {
  members: Member[];
}

const metroSeats = [
  { top: "20%", left: "22%" },
  { top: "30%", left: "30%" },
  { top: "40%", left: "38%" },

  { top: "20%", left: "62%" },
  { top: "30%", left: "70%" },
  { top: "40%", left: "78%" },
];

export default function MetroLayout({
  members,
}: Props) {
  return (
    <div className="relative w-full h-[700px] rounded-3xl overflow-hidden border bg-[#d9dde2]">

      {/* LEFT BENCH */}
      <div className="absolute top-[15%] left-[10%] w-[28%] h-[55%] border-2 rounded-3xl rotate-[-12deg] bg-[#9ea7b3]" />

      {/* RIGHT BENCH */}
      <div className="absolute top-[15%] right-[10%] w-[28%] h-[55%] border-2 rounded-3xl rotate-[12deg] bg-[#9ea7b3]" />

      {/* AISLE */}
      <div className="absolute top-0 left-[47%] w-[6%] h-full bg-[#c6ccd4]" />

      {/* SHARE CODE */}
      <button className="absolute top-6 right-6 border rounded-xl px-4 py-2 bg-white">
        Share Code
      </button>

      {/* ADD SEATS */}
      <button className="absolute bottom-8 right-8 border rounded-xl px-4 py-3 bg-white">
        Add Seats +
      </button>

      {/* MEMBERS */}
      {members.map((member, index) => {
        const position =
          metroSeats[index % metroSeats.length];

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