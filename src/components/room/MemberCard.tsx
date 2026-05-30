"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";

interface MemberCardProps {
  member: {
    id: string;
    username: string;
    status: string;
    avatar: string;
    approval_status?: string | null;
    focus_task?: string | null;
  };
  isCurrentUser: boolean;
  updateStatus: (memberId: string, status: string) => void;
  updateTask: (memberId: string, task: string) => void;
  approveMember?: (memberId: string) => void;
  isHost?: boolean;
  onRemove?: (memberId: string) => void;
}

export default function MemberCard({
  member,
  isCurrentUser,
  updateStatus,
  updateTask,
  approveMember,
  isHost,
  onRemove,
}: MemberCardProps) {
  const [taskDraft, setTaskDraft] = useState(member.focus_task || "");

  useEffect(() => {
    setTaskDraft(member.focus_task || "");
  }, [member.focus_task]);

  const isWaiting = member.approval_status === "waiting";

  return (
    <div className="ds-card p-4" style={{ width: "100%" }}>
      <div className="flex items-start gap-4">
        <Avatar avatar={member.avatar} username={member.username} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="truncate text-lg font-semibold">{member.username}</h2>
            {isWaiting && (
              <span className="rounded-full border border-black/15 bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">
                Waiting
              </span>
            )}
          </div>

          <p className="mb-2 text-sm capitalize opacity-70">{member.status}</p>

          <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">
            Focus task
          </label>
          {isCurrentUser ? (
            <textarea
              value={taskDraft}
              onChange={(event) => setTaskDraft(event.target.value)}
              onBlur={() => updateTask(member.id, taskDraft)}
              placeholder="What are you working on?"
              rows={2}
              className="mt-1 w-full resize-none rounded-sm border border-black/20 bg-white px-3 py-2 text-sm outline-none"
            />
          ) : (
            <div className="mt-1 min-h-13 rounded-sm border border-black/10 bg-white/80 px-3 py-2 text-sm text-black/70">
              {member.focus_task || "No task added yet."}
            </div>
          )}

          {isCurrentUser && !isWaiting && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => updateStatus(member.id, "on arrival")} className="ds-btn ds-btn-secondary px-2 py-1 text-xs">
                On arrival
              </button>

              <button onClick={() => updateStatus(member.id, "focused")} className="ds-btn ds-btn-secondary px-2 py-1 text-xs">
                Focused
              </button>

              <button onClick={() => updateStatus(member.id, "break")} className="ds-btn ds-btn-secondary px-2 py-1 text-xs">
                On break
              </button>
            </div>
          )}

          {isHost && isWaiting && approveMember && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => approveMember(member.id)} className="ds-btn px-3 py-1 text-xs">
                Allow in
              </button>
              {onRemove && (
                <button onClick={() => onRemove(member.id)} className="rounded-lg border bg-red-600 px-3 py-1 text-xs text-white">
                  Remove
                </button>
              )}
            </div>
          )}

          {isHost && !isWaiting && !isCurrentUser && onRemove && (
            <div className="mt-3">
              <button onClick={() => onRemove(member.id)} className="rounded-lg border bg-red-600 px-3 py-1 text-xs text-white">
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}