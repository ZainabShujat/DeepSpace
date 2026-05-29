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
  isHost?: boolean;
  onRemove?: (memberId: string) => void;
}

export default function MemberCard({
  member,
  isCurrentUser,
  updateStatus,
  isHost,
  onRemove,
}: MemberCardProps) {
  return (
    <div className="ds-card p-4" style={{ width: "170px" }}>
      <h2 className="text-lg font-semibold">{member.username}</h2>

      <p className="opacity-70 text-sm mb-3 capitalize">{member.status}</p>

      {isCurrentUser && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => updateStatus(member.id, "on arrival")} className="ds-btn ds-btn-secondary text-xs px-2 py-1">
            On arrival
          </button>

          <button onClick={() => updateStatus(member.id, "focused")} className="ds-btn ds-btn-secondary text-xs px-2 py-1">
            Focused
          </button>

          <button onClick={() => updateStatus(member.id, "break")} className="ds-btn ds-btn-secondary text-xs px-2 py-1">
            On break
          </button>
        </div>
      )}
      {isHost && !isCurrentUser && onRemove && (
        <div className="mt-2">
          <button
            onClick={() => onRemove(member.id)}
            className="text-xs border px-2 py-1 rounded-lg bg-red-600 text-white"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}