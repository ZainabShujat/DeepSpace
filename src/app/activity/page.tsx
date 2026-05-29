"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import createClient from "@/lib/supabase/client";
import BackLink from "@/components/navigation/BackLink";

type SessionRow = {
  id: string;
  room_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
};

type SessionHistoryRow = {
  id: string;
  room_id: string;
  room_name: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  members: Array<Record<string, unknown>> | null;
};

type ActivityRow = {
  id: string;
  action: string;
  created_at: string;
  details: Record<string, unknown> | null;
};

function formatActivity(item: ActivityRow) {
  const details = item.details || {};
  const actor = String(details.username || details.started_by || details.ended_by || "Someone");

  switch (item.action) {
    case "join":
      return `${actor} joined`;
    case "leave":
      return `${actor} left`;
    case "remove_member":
      return `${actor} left`;
    case "seat":
      return `${actor} sat at ${String(details.seat || "a seat")}`;
    case "status":
      return `${actor} became ${String(details.status || "focused")}`;
    case "session_start":
      return "Focus session started";
    case "session_end":
      return "Focus session ended";
    case "host_transfer":
      return `${String(details.from || "Someone")} passed host to ${String(details.to || "another member")}`;
    default:
      return item.action.replaceAll("_", " ");
  }
}

function activityTone(action: string) {
  if (action.includes("start")) return "bg-green-100 text-green-800";
  if (action.includes("end") || action.includes("leave")) return "bg-red-100 text-red-800";
  if (action.includes("host")) return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "ongoing";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function ActivityPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (!sessionUser) {
        setIsLoggedIn(false);
        setSessions([]);
        setActivities([]);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const [sessionsRes, historyRes, activitiesRes] = await Promise.all([
        supabase
          .from("sessions")
          .select("id, room_id, started_at, ended_at, duration_seconds")
          .order("started_at", { ascending: false })
          .limit(50),
        supabase
          .from("session_history")
          .select("id, room_id, room_name, ended_at, duration_seconds, members")
          .order("ended_at", { ascending: false })
          .limit(20),
        supabase
          .from("activity_log")
          .select("id, action, created_at, details")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (sessionsRes.error || historyRes.error || activitiesRes.error) {
        setError("Could not load activity history.");
      } else {
        setSessions((sessionsRes.data ?? []) as SessionRow[]);
        setSessionHistory((historyRes.data ?? []) as SessionHistoryRow[]);
        setActivities((activitiesRes.data ?? []) as ActivityRow[]);
      }

      setLoading(false);
    };

    loadActivity();
  }, []);

  const completedSessions = sessions.filter((session) => session.ended_at);
  const activeSessions = sessions.filter((session) => !session.ended_at);
  const totalFocusSeconds = completedSessions.reduce(
    (total, session) => total + (session.duration_seconds ?? 0),
    0
  );

  const placeholderValue = isLoggedIn ? "--" : "Guest mode";

  return (
    <main className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <BackLink href="/lobby" label="Back to lobby" />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold press-title">Activity & Sessions</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-70">
          Recent room events and session history, with readable activity labels and quick status summaries.
        </p>
      </div>

      {loading && <p className="opacity-60">Loading activity...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!loading && !error && (
        <>
          <section className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="p-4 thick-border rounded-sm bg-white">
              <p className="text-sm opacity-60">Completed sessions</p>
              <p className="text-2xl font-bold">{isLoggedIn ? completedSessions.length : placeholderValue}</p>
            </div>

            <div className="p-4 thick-border rounded-sm bg-white">
              <p className="text-sm opacity-60">Active sessions</p>
              <p className="text-2xl font-bold">{isLoggedIn ? activeSessions.length : placeholderValue}</p>
            </div>

            <div className="p-4 thick-border rounded-sm bg-white">
              <p className="text-sm opacity-60">Tracked focus time</p>
              <p className="text-2xl font-bold">{isLoggedIn ? formatDuration(totalFocusSeconds) : placeholderValue}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold mb-3 text-lg">Recent Sessions</h2>

            {!isLoggedIn ? (
              <div className="rounded-sm thick-border bg-white p-5">
                <p className="font-semibold">Guest mode</p>
                <p className="mt-2 text-sm opacity-70">
                  You can browse the page, but saved sessions only appear after you sign in.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link href="/auth?next=%2Factivity" className="ds-btn px-4 py-2">
                    Login / Register
                  </Link>
                </div>
              </div>
            ) : sessionHistory.length === 0 ? (
              <div className="rounded-sm thick-border bg-white p-5">
                <p className="font-semibold">No focus sessions yet.</p>
                <p className="mt-2 text-sm opacity-70">
                  Start a session in any room and your history will appear here.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {sessionHistory.map((session) => {
                  const participantCount = session.members?.length || 0;

                  return (
                  <li key={session.id} className="p-4 thick-border rounded-sm bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{session.room_name || `Room ${session.room_id}`}</p>
                        <p className="text-sm opacity-70">{formatDuration(session.duration_seconds)} focus session</p>
                        <p className="text-sm opacity-70">{participantCount} participant{participantCount === 1 ? "" : "s"}</p>
                        <p className="text-sm opacity-70">Ended {session.ended_at ? formatDate(session.ended_at) : "recently"}</p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        History
                      </span>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-semibold mb-3 text-lg">Activity Log</h2>

            {!isLoggedIn ? (
              <div className="rounded-sm thick-border bg-white p-5">
                <p className="font-semibold">Guest mode</p>
                <p className="mt-2 text-sm opacity-70">Session stats and event history will appear here after login or register.</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-sm thick-border bg-white p-5">
                <p className="font-semibold">No room activity yet.</p>
                <p className="mt-2 text-sm opacity-70">
                  Once people join, sit down, and start sessions, the feed will fill up here.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {activities.map((activity) => (
                  <li key={activity.id} className="p-4 thick-border rounded-sm bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{formatActivity(activity)}</p>
                        <p className="text-sm opacity-70">{formatDate(activity.created_at)}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${activityTone(activity.action)}`}>
                        {activity.action.replaceAll("_", " ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
