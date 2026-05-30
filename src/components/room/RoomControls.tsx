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
  const storageKey = "deepspace-room-controls-position";
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [panelPosition, setPanelPosition] = React.useState<{ x: number; y: number }>({ x: 16, y: 16 });
  const [isDesktopLayout, setIsDesktopLayout] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateLayoutMode = () => setIsDesktopLayout(mediaQuery.matches);

    updateLayoutMode();
    mediaQuery.addEventListener("change", updateLayoutMode);

    const savedPosition = window.localStorage.getItem(storageKey);

    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition) as { x?: number; y?: number };

        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setPanelPosition({ x: parsed.x, y: parsed.y });
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    setPanelPosition((current) => (!savedPosition ? { x: Math.max(16, window.innerWidth - 336), y: 16 } : current));

    return () => {
      mediaQuery.removeEventListener("change", updateLayoutMode);
    };
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(panelPosition));
  }, [panelPosition]);

  React.useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragStateRef.current) {
        return;
      }

      const { startX, startY, originX, originY } = dragStateRef.current;
      setPanelPosition({
        x: originX + (event.clientX - startX),
        y: originY + (event.clientY - startY),
      });
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const startDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const rect = panel.getBoundingClientRect();
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
    };
  };

  return (
    <div
      ref={panelRef}
      className="relative mx-auto mb-4 w-full max-w-[calc(100vw-1rem)] overflow-auto md:fixed md:mb-0 md:z-20 md:w-[320px] md:max-w-[calc(100vw-2rem)]"
      style={{
        ...(isDesktopLayout
          ? {
              left: `${panelPosition.x}px`,
              top: `${panelPosition.y}px`,
              resize: "both" as const,
              minWidth: "240px",
              minHeight: "180px",
              maxWidth: "calc(100vw - 2rem)",
              maxHeight: "calc(100vh - 2rem)",
              position: "fixed" as const,
            }
          : {
              position: "relative" as const,
            }),
      }}
    >
      <div className="bg-white/95 p-3 rounded thick-border pixel-shadow flex flex-col gap-3">
        <button
          type="button"
          onPointerDown={startDrag}
          className="flex cursor-grab items-center justify-between rounded border border-black/10 bg-black/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50 active:cursor-grabbing touch-none md:flex"
          aria-label="Drag timer panel"
        >
          <span>Timer panel</span>
          <span aria-hidden="true">⋮⋮</span>
        </button>

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
