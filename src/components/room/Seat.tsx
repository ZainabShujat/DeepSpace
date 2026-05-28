"use client"

import React from "react"

type SeatProps = {
  id: string
  occupied?: boolean
  avatarUrl?: string | null
  username?: string | null
  onClick?: (id: string) => void
  isCurrentUser?: boolean
  children?: React.ReactNode
}

function initials(name?: string | null) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function Seat({
  id,
  occupied = false,
  avatarUrl,
  username,
  onClick,
  isCurrentUser = false,
  children,
}: SeatProps) {
  const handleClick = () => onClick?.(id)

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={occupied}
      aria-label={
        occupied ? `Seat occupied by ${username ?? "someone"}` : `Empty seat ${id}`
      }
      className={`flex flex-col items-center justify-center gap-2 w-20 h-20 sm:w-24 sm:h-24 rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-offset-2 ${
        occupied ? "bg-indigo-600 border-indigo-700 text-white" : "bg-gray-800 border-gray-700 text-gray-200"
      } ${isCurrentUser ? "ring-2 ring-yellow-400" : ""}`}
    >
      {children ? (
        <div className="flex flex-col items-center">{children}</div>
      ) : occupied ? (
        avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={username ?? "player avatar"}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
            {initials(username)}
          </div>
        )
      ) : (
        <div className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center text-xl text-gray-400">+</div>
      )}

      {!children && (
        <span className="text-xs w-full text-center truncate px-1">
          {occupied ? username ?? "Player" : "Empty"}
        </span>
      )}
    </button>
  )
}
