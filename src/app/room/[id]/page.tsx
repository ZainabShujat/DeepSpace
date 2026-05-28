"use client";

import { useEffect, useState } from "react";

import { createClient } from "../../../../lib/supabase/client";

import LibraryLayout from "../../../components/layouts/LibraryLayout";
import MetroLayout from "../../../components/layouts/MetroLayout";
import CafeLayout from "../../../components/layouts/CafeLayout";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

interface Member {
  id: string;
  username: string;
  status: string;
}

export default function RoomPage({ params }: Props) {
  const supabase = createClient();

  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initialize = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;

      setRoomId(id);

      await fetchRoom(id);
      await joinRoom(id);
      await fetchMembers(id);

      interval = setInterval(() => {
        fetchMembers(id);
      }, 2000);
    };

    initialize();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const joinRoom = async (id: string) => {
    const { data: existing } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", id)
      .eq("username", "Zuzu");

    if (existing && existing.length > 0) {
      return;
    }

    await supabase.from("room_members").insert([
      {
        room_id: id,
        username: "Zuzu",
        avatar: "default",
        status: "arrived",
        seat_position: Math.floor(Math.random() * 20),
      },
    ]);
  };

  const fetchMembers = async (id: string) => {
    const { data } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", id);

    if (data) {
      setMembers(data);
    }
  };

  const fetchRoom = async (id: string) => {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setRoomType(data.type);
      setRoomName(data.name);
    }
  };

  return (
    <main className="min-h-screen p-10 bg-[#f8f8f8]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold mb-2">
            {roomName || "DeepSpace"}
          </h1>

          <p className="opacity-60 capitalize">
            {roomType}
          </p>
        </div>

        <button className="border rounded-xl px-5 py-3 bg-white hover:bg-gray-100 transition">
          Share Code
        </button>
      </div>

      {roomType === "library" && (
        <LibraryLayout members={members} />
      )}

      {roomType === "metro" && (
        <MetroLayout members={members} />
      )}

      {roomType === "cafe" && (
        <CafeLayout members={members} />
      )}
    </main>
  );
}