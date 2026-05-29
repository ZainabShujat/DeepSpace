"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/lib/supabase/client";

interface Room {
  id: string;
  name: string;
  layout: string;
  visibility: string;
  max_members?: number | null;
}

export default function RoomList() {
  const supabase = createClient();
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  const openRoom = async (roomId: string) => {
    const { data } = await supabase.auth.getSession();
    const nextPath = `/room/${roomId}?join=1`;

    if (!data?.session?.user) {
        console.log("ROOM CLICKED:", roomId);
console.log("NEXT PATH:", nextPath)
      router.push(`/auth?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    router.push(nextPath);
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("id, name, layout, visibility, max_members")
      .eq("visibility", "public");

    if (!error && data) {
      setRooms(data);
    }
  };

  const fetchMemberCounts = async () => {
    const { data, error } = await supabase
      .from("room_members")
      .select("room_id");

    if (error || !data) return;

    const counts = data.reduce<Record<string, number>>((accumulator, row) => {
      const roomId = (row as { room_id?: string }).room_id;
      if (!roomId) return accumulator;
      accumulator[roomId] = (accumulator[roomId] || 0) + 1;
      return accumulator;
    }, {});

    setMemberCounts(counts);
  };

  useEffect(() => {
    fetchRooms();
    fetchMemberCounts();

    const channel = supabase.channel("rooms-realtime");

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "rooms",
      },
      (payload: any) => {
        const newRoom = payload.new as Room;
        if (newRoom.visibility === "public") {
          setRooms((prev) => [...prev, newRoom]);
        }
      }
    );

    const membersChannel = supabase.channel("room-members-counts");
    membersChannel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "room_members",
      },
      () => {
        fetchMemberCounts();
      }
    );
    membersChannel.subscribe();

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(membersChannel);
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 lg:w-87.5">
      <div className="inline-block rounded-sm bg-white/30 px-3 py-1 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold press-title">Active Rooms</h2>
      </div>

      {rooms.map((room) => (
        <button
          key={room.id}
          type="button"
          onClick={() => openRoom(room.id)}
          className="text-left p-4 thick-border pixel-shadow hover:bg-gray-100 transition cursor-pointer rounded-sm bg-white"
        >
          <h3 className="text-xl font-medium">{room.name}</h3>
          <p className="text-sm opacity-70">
            {room.layout} • {room.visibility}{room.max_members ? ` • cap ${room.max_members}` : ""}{memberCounts[room.id] ? ` • ${memberCounts[room.id]} active` : ""}
          </p>
        </button>
      ))}
    </div>
  );
}
