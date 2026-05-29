"use client";

import React from "react";

interface Props {
  sessionId: string | null;
  timerSeconds: number;
  isHost: boolean;
  onStart: () => void;
  onEnd: () => void;
  onExtend: (seconds?: number) => void;
  onAddSeat?: () => void;
  onAddTable?: () => void;
  onCopyCode?: () => void;
}

export default function RoomControls({ sessionId, timerSeconds, isHost, onStart, onEnd, onExtend, onAddSeat, onAddTable, onCopyCode }: Props) {
  const canControl = isHost;

  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="bg-white/95 p-3 rounded thick-border pixel-shadow flex flex-col gap-2">
        {!sessionId ? (
          <button onClick={onStart} disabled={!canControl} className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Start Session
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onEnd} disabled={!canControl} className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              End ({Math.floor(timerSeconds / 60)}:{("0" + (timerSeconds % 60)).slice(-2)})
            </button>

            {isHost && (
              <button onClick={() => onExtend(300)} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">
                +5m
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-1">
          {onAddSeat && (
            <button onClick={onAddSeat} disabled={!canControl} className="px-2 py-1 bg-black text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Add seat
            </button>
          )}

          {onAddTable && (
            <button onClick={onAddTable} disabled={!canControl} className="px-2 py-1 bg-black text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Add table
            </button>
          )}

          {onCopyCode && (
            <button onClick={onCopyCode} className="px-2 py-1 bg-white border rounded text-sm">
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
