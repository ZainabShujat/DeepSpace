"use client";

import React from "react";

interface Props {
  sessionId: string | null;
  timerSeconds: number;
  isHost: boolean;
  selectedPresetLabel: string;
  timerPresets: Array<{ id: string; label: string; workMinutes: number; breakMinutes: number }>;
  onPresetChange: (presetId: string) => void;
  onStart: () => void;
  onEnd: () => void;
  onExtend: (seconds?: number) => void;
  onAddSeat?: () => void;
  onAddTable?: () => void;
  onAddCubicle?: () => void;
  onCopyCode?: () => void;
}

export default function RoomControls({
  sessionId,
  timerSeconds,
  isHost,
  selectedPresetLabel,
  timerPresets,
  onPresetChange,
  onStart,
  onEnd,
  onExtend,
  onAddSeat,
  onAddTable,
  onAddCubicle,
  onCopyCode,
}: Props) {
  const canControl = isHost;

  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="bg-white/95 p-3 rounded thick-border pixel-shadow flex flex-col gap-2">
        {!sessionId ? (
          <>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
              Timer preset
            </label>

            <select
              value={timerPresets[0] ? timerPresets.find((preset) => preset.label === selectedPresetLabel)?.id || timerPresets[0].id : ""}
              onChange={(event) => onPresetChange(event.target.value)}
              disabled={!canControl}
              className="rounded border border-black/20 bg-white px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {timerPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} ({preset.workMinutes}/{preset.breakMinutes})
                </option>
              ))}
            </select>

            <button onClick={onStart} disabled={!canControl} className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Start {selectedPresetLabel}
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <button onClick={onEnd} disabled={!canControl} className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              End Session
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

          {onAddCubicle && (
            <button onClick={onAddCubicle} disabled={!canControl} className="px-2 py-1 bg-black text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Add cubicle
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
