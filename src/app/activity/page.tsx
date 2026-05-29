"use client";

import { useEffect, useState } from "react";
import createClient from "@/lib/supabase/client";

type SessionRow = {
  id: string;
  room_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
};

type ActivityRow = {
  id: string;
  action: string;
  created_at: string;
  details: Record<string, unknown> | null;
};

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
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivity = async () => {
      const supabase = createClient();

      const [sessionsRes, activitiesRes] = await Promise.all([
        supabase
          .from("sessions")
          .select("id, room_id, started_at, ended_at, duration_seconds")
          .order("started_at", { ascending: false })
          .limit(50),
        supabase
          .from("activity_log")
          .select("id, action, created_at, details")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (sessionsRes.error || activitiesRes.error) {
        setError("Could not load activity history.");
      } else {
        setSessions((sessionsRes.data ?? []) as SessionRow[]);
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

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4 press-title">
        Activity & Sessions
      </h1>

      {loading && <p className="opacity-60">Loading activity...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!loading && !error && (
        <>
          <section className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="p-4 thick-border rounded-sm">
              <p className="text-sm opacity-60">Completed sessions</p>
              <p className="text-2xl font-bold">{completedSessions.length}</p>
            </div>

            <div className="p-4 thick-border rounded-sm">
              <p className="text-sm opacity-60">Active sessions</p>
              <p className="text-2xl font-bold">{activeSessions.length}</p>
            </div>

            <div className="p-4 thick-border rounded-sm">
              <p className="text-sm opacity-60">Tracked focus time</p>
              <p className="text-2xl font-bold">{formatDuration(totalFocusSeconds)}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold mb-2">Recent Sessions</h2>

            {sessions.length === 0 ? (
              <p className="opacity-60">No study sessions yet.</p>
            ) : (
              <ul className="space-y-2">
                {sessions.map((session) => (
                  <li key={session.id} className="p-3 thick-border rounded-sm">
                    <p className="font-semibold">Room {session.room_id}</p>
                    <p className="text-sm opacity-70">
                      Started {formatDate(session.started_at)}
                    </p>
                    <p className="text-sm opacity-70">
                      Duration {formatDuration(session.duration_seconds)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-semibold mb-2">Activity Log</h2>

            {activities.length === 0 ? (
              <p className="opacity-60">No room activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {activities.map((activity) => (
                  <li key={activity.id} className="p-3 thick-border rounded-sm">
                    <p className="font-semibold capitalize">
                      {activity.action.replaceAll("_", " ")}
                    </p>
                    <p className="text-sm opacity-70">
                      {formatDate(activity.created_at)}
                    </p>
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
