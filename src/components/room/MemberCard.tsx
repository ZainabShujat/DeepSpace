interface MemberCardProps {
  member: {
    id: string;
    username: string;
    status: string;
  };
  isCurrentUser: boolean;
  updateStatus: (
    memberId: string,
    status: string
  ) => void;
}

export default function MemberCard({
  member,
  isCurrentUser,
  updateStatus,
}: MemberCardProps) {
  return (
    <div className="border rounded-2xl px-6 py-4 bg-white shadow-md min-w-[170px]">
      <h2 className="text-lg font-semibold">
        {member.username}
      </h2>

      <p className="opacity-70 text-sm mb-3 capitalize">
        {member.status}
      </p>

      {isCurrentUser && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() =>
              updateStatus(member.id, "arrived")
            }
            className="text-xs border px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            Arrived
          </button>

          <button
            onClick={() =>
              updateStatus(member.id, "focused")
            }
            className="text-xs border px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            Focus
          </button>

          <button
            onClick={() =>
              updateStatus(member.id, "break")
            }
            className="text-xs border px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            Break
          </button>
        </div>
      )}
    </div>
  );
}