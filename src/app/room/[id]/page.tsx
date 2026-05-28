"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import MemberCard from "@/components/room/MemberCard";
import { roomThemes } from "@/lib/roomThemes";

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

  const updateStatus = async (
    memberId: string,
    status: string
  ) => {
    await supabase
      .from("room_members")
      .update({ status })
      .eq("id", memberId);

    fetchMembers(roomId);
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

  const seatPositions = [
    { top: "20%", left: "15%" },
    { top: "35%", left: "40%" },
    { top: "50%", left: "70%" },
    { top: "65%", left: "25%" },
    { top: "25%", left: "75%" },
  ];

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-5xl font-bold mb-2">
        {roomName || "DeepSpace"}
      </h1>

      <div className="flex items-center gap-3 mb-10">
        <p className="opacity-60">
          {roomId}
        </p>

        <div className="px-3 py-1 rounded-full border text-sm capitalize bg-white">
          {roomType}
        </div>
      </div>

      <div
        className={`relative w-full h-[600px] border rounded-3xl overflow-hidden ${
          roomThemes[roomType] || "bg-gray-100"
        }`}
      >
        {members.map((member, index) => {
          const position =
            seatPositions[index % seatPositions.length];

          return (
            <div
              key={member.id}
              className="absolute transition-all duration-500"
              style={{
                top: position.top,
                left: position.left,
              }}
            >
              <MemberCard
                member={member}
                isCurrentUser={
                  member.username === "Zuzu"
                }
                updateStatus={updateStatus}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}