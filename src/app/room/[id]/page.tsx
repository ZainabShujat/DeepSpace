"use client";

import { useEffect, useState } from "react";

import { createClient } from "../../../../lib/supabase/client";

import MetroLayout from "@/components/layouts/MetroLayout";
import CafeLayout from "@/components/layouts/CafeLayout";
import LibraryLayout from "@/components/layouts/LibraryLayout";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

interface Member {
  id: string;
  username: string;
  status: string;
  avatar: string;
  seat_id: string;
}

interface Room {
  id: string;
  name: string;
  layout: string;
  share_code: string;
}

export default function RoomPage({
  params,
}: Props) {

  const supabase = createClient();

  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState<Room | null>(null);

  const [members, setMembers] = useState<Member[]>([]);

  const [username, setUsername] =
    useState("");

  const [avatar, setAvatar] =
    useState("");

  useEffect(() => {

    let interval: NodeJS.Timeout;

    const initialize = async () => {

      const resolvedParams =
        await params;

      const id = resolvedParams.id;

      setRoomId(id);

      const savedUsername =
        localStorage.getItem("username")
        || "guest";

      const savedAvatar =
        localStorage.getItem("avatar")
        || "strawberry";

      setUsername(savedUsername);
      setAvatar(savedAvatar);

      await fetchRoom(id);

      await joinRoom(
        id,
        savedUsername,
        savedAvatar
      );

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

  const fetchRoom = async (
    id: string
  ) => {

    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setRoom(data);
    }

  };

  const joinRoom = async (
    id: string,
    currentUsername: string,
    currentAvatar: string
  ) => {

    const { data: existing } =
      await supabase
        .from("room_members")
        .select("*")
        .eq("room_id", id)
        .eq("username", currentUsername);

    if (
      existing &&
      existing.length > 0
    ) {
      return;
    }

    await supabase
      .from("room_members")
      .insert([
        {
          room_id: id,
          username: currentUsername,
          avatar: currentAvatar,
          status: "just arrived",
        },
      ]);

  };

  const fetchMembers = async (
    id: string
  ) => {

    const { data } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", id);

    if (data) {
      setMembers(data);
    }

  };

  const joinSeat = async (
    seatId: string
  ) => {

    await supabase
      .from("room_members")
      .update({
        seat_id: seatId,
      })
      .eq("room_id", roomId)
      .eq("username", username);

    fetchMembers(roomId);

  };

  const copyCode = async () => {

    if (!room?.share_code) return;

    await navigator.clipboard.writeText(
      room.share_code
    );

    alert("Code copied!");

  };

  const renderLayout = () => {

    if (!room) return null;

    switch (room.layout) {

      case "metro":
        return (
          <MetroLayout
            members={members}
            joinSeat={joinSeat}
          />
        );

      case "cafe":
        return (
          <CafeLayout
            members={members}
            joinSeat={joinSeat}
          />
        );

      case "library":
        return (
          <LibraryLayout
            members={members}
            joinSeat={joinSeat}
          />
        );

      default:
        return null;

    }

  };

  return (
    <main className="min-h-screen p-8 bg-[#f6f6f7]">

      <div className="flex items-start justify-between mb-8">

        <div>

          <h1 className="text-6xl font-bold">
            {room?.name}
          </h1>

          <p className="text-2xl opacity-50 mt-2 capitalize">
            {room?.layout}
          </p>

        </div>

        <button
          onClick={copyCode}
          className="
            border
            rounded-2xl
            px-8
            py-4
            bg-white
            shadow-sm
            hover:scale-[1.02]
            transition-all
          "
        >
          Share Code
        </button>

      </div>

      {renderLayout()}

    </main>
  );
}