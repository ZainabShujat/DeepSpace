import { createClient } from "../../lib/supabase/client";

export default async function ActivityPage() {
  const supabase = createClient();

  const { data: sessions } = await supabase.from("sessions").select("*").order("started_at", { ascending: false }).limit(50);
  const { data: activities } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Activity & Sessions</h1>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">Recent Sessions</h2>
        <ul className="space-y-2">
          {sessions?.map((s: any) => (
            <li key={s.id} className="p-2 border rounded">{s.room_id} — {s.started_at} — {s.duration_seconds ?? "ongoing"}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Activity Log</h2>
        <ul className="space-y-2">
          {activities?.map((a: any) => (
            <li key={a.id} className="p-2 border rounded">{a.action} — {a.created_at}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
