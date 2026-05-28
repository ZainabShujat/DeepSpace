"use client";

import { useEffect, useState, useRef } from "react";
import createClient from "@/lib/supabase/client";

interface Message {
  id: string;
  room_id: string;
  user_id?: string | null;
  username: string;
  content: string;
  created_at: string;
}

export default function Chat({ roomId, username, userId }: { roomId: string; username: string | null; userId?: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const supabase = createClient();
  const subRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const res = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      const data = res.data as Message[] | null;

      if (mounted && data) setMessages(data);
    };

    load();

    // subscribe to new messages
    const channel = supabase.channel(`room-messages-${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => [...prev, m]);
      })
      .subscribe();

    subRef.current = channel;

    return () => {
      mounted = false;
      if (subRef.current) supabase.removeChannel(subRef.current);
    };
  }, [roomId]);

  const send = async () => {
    if (!text.trim()) return;

    await supabase.from("messages").insert([{ room_id: roomId, user_id: userId || null, username: username || "guest", content: text }]);
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 border rounded-lg bg-white">
        {messages.map((m) => (
          <div key={m.id} className="">
            <div className="text-sm font-semibold">{m.username}</div>
            <div className="text-sm">{m.content}</div>
            <div className="text-xs opacity-50">{new Date(m.created_at).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" placeholder="Message" />
        <button onClick={send} className="px-4 py-2 bg-black text-white rounded-lg">Send</button>
      </div>
    </div>
  );
}
