interface Member {
  id: string;
  username: string;
  status: string;
}

interface Props {
  members: Member[];
}

const librarySeats = [
  { top: "18%", left: "18%" },
  { top: "18%", left: "38%" },

  { top: "18%", left: "62%" },
  { top: "18%", left: "82%" },

  { top: "48%", left: "18%" },
  { top: "48%", left: "38%" },

  { top: "48%", left: "62%" },
  { top: "48%", left: "82%" },
];

export default function LibraryLayout({
  members,
}: Props) {
  return (
    <div className="relative w-full h-[700px] bg-[#f5f1e8] rounded-3xl border overflow-hidden">

      {/* LEFT TABLE */}
      <div className="absolute top-[15%] left-[10%] w-[32%] h-[18%] border-2 rounded-2xl bg-[#e7dcc8]" />

      {/* RIGHT TABLE */}
      <div className="absolute top-[15%] right-[10%] w-[32%] h-[18%] border-2 rounded-2xl bg-[#e7dcc8]" />

      {/* LEFT TABLE BOTTOM */}
      <div className="absolute top-[45%] left-[10%] w-[32%] h-[18%] border-2 rounded-2xl bg-[#e7dcc8]" />

      {/* RIGHT TABLE BOTTOM */}
      <div className="absolute top-[45%] right-[10%] w-[32%] h-[18%] border-2 rounded-2xl bg-[#e7dcc8]" />

      {/* CHAT PANEL */}
      <div className="absolute bottom-0 left-0 w-[25%] h-[28%] border-r border-t bg-white p-4">
        <h2 className="font-semibold mb-2">
          Live Chat
        </h2>

        <p className="text-sm opacity-60">
          Room messages...
        </p>
      </div>

      {/* ADD SECTION */}
      <button className="absolute bottom-10 left-[40%] border rounded-xl px-5 py-3 bg-white hover:bg-gray-100 transition">
        Add Section +
      </button>

      {/* MEMBERS */}
      {members.map((member, index) => {
        const position =
          librarySeats[index % librarySeats.length];

        return (
          <div
            key={member.id}
            className="absolute transition-all duration-500"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold shadow-lg">
              {member.username.charAt(0)}
            </div>

            <p className="text-center mt-2 text-sm font-medium">
              {member.username}
            </p>

            <p className="text-center text-xs opacity-60">
              {member.status}
            </p>
          </div>
        );
      })}
    </div>
  );
}