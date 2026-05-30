"use client";

import React from "react";

interface Props {
  sessionId: string | null;
  timerSeconds: number;
  isHost: boolean;
  selectedPresetLabel: string;
  stopwatchSeconds: number;
  stopwatchRunning: boolean;
  stopwatchLaps: number[];
  timerPresets: Array<{ id: string; label: string; workMinutes: number; breakMinutes: number }>;
  onPresetChange: (presetId: string) => void;
  onStart: () => void;
  onEnd: () => void;
  onExtend: (seconds?: number) => void;
  onStopwatchStart: () => void;
  onStopwatchStop: () => void;
  onStopwatchReset: () => void;
  onStopwatchLap: () => void;
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
  stopwatchSeconds,
  stopwatchRunning,
  stopwatchLaps,
  timerPresets,
  onPresetChange,
  onStart,
  onEnd,
  onExtend,
  onStopwatchStart,
  onStopwatchStop,
  onStopwatchReset,
  onStopwatchLap,
  onAddSeat,
  onAddTable,
  onAddCubicle,
  onCopyCode,
}: Props) {
  const canControl = isHost;

  return (
    <div className="absolute top-4 right-4 z-20 w-[320px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white/95 p-3 rounded thick-border pixel-shadow flex flex-col gap-3">
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

        <div className="rounded border border-black/10 bg-black/3 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
            Stopwatch
          </div>
          <div className="mt-1 text-2xl font-black press-title tabular-nums">
            {Math.floor(stopwatchSeconds / 60)}:{String(stopwatchSeconds % 60).padStart(2, "0")}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={onStopwatchStart} className="rounded bg-black px-3 py-1 text-xs text-white" disabled={stopwatchRunning}>
              Start
            </button>
            <button onClick={onStopwatchStop} className="rounded border px-3 py-1 text-xs" disabled={!stopwatchRunning}>
              Stop
            </button>
            <button onClick={onStopwatchReset} className="rounded border px-3 py-1 text-xs">
              Reset
            </button>
            <button onClick={onStopwatchLap} className="rounded border px-3 py-1 text-xs" disabled={!stopwatchRunning}>
              Lap
            </button>
          </div>
          {stopwatchLaps.length > 0 && (
            <div className="mt-3 max-h-28 overflow-y-auto rounded bg-white px-2 py-1 text-xs">
              {stopwatchLaps.map((lap, index) => (
                <div key={`${lap}-${index}`} className="flex items-center justify-between border-b border-black/5 py-1 last:border-0">
                  <span>Lap {index + 1}</span>
                  <span className="font-semibold tabular-nums">{Math.floor(lap / 60)}:{String(lap % 60).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

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
