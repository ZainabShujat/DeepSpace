"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

interface Room {
  id: string;
  name: string;
  layout: string;
  visibility: string;
}

export default function RoomList() {
  const supabase = createClient();

  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchRooms();

    const channel = supabase.channel("rooms-realtime");

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "rooms",
      },
      (payload) => {
        const newRoom = payload.new as Room;
        if (newRoom.visibility === "public") {
          setRooms((prev) => [...prev, newRoom]);
        }
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("visibility", "public");

    if (!error && data) {
      setRooms(data);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-87.5">
      <h2 className="text-2xl font-semibold press-title">Active Rooms</h2>

      {rooms.map((room) => (
        <Link href={`/room/${room.id}`} key={room.id}>
          <div className="p-4 thick-border pixel-shadow hover:bg-gray-100 transition cursor-pointer rounded-sm">
            <h3 className="text-xl font-medium">{room.name}</h3>
            <p className="text-sm opacity-70">{room.layout} • {room.visibility}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
