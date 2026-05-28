"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "../../../../lib/supabase/client";

import MetroLayout from "../../../components/layouts/MetroLayout";
import CafeLayout from "../../../components/layouts/CafeLayout";
import LibraryLayout from "../../../components/layouts/LibraryLayout";
import Chat from "../../../components/room/Chat";
import MemberCard from "../../../components/room/MemberCard";

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
  seat_id: string | null;
}

interface Room {
  id: string;
  name: string;
  layout?: string | null;
  type?: string | null;
  room_type?: string | null;
  share_code?: string | null;
}

const SEAT_SETS: Record<string, string[]> = {
  metro: ["metro-left-1", "metro-left-2", "metro-left-3", "metro-right-1", "metro-right-2", "metro-right-3"],
  cafe: ["cafe-1", "cafe-2", "cafe-3", "cafe-4"],
  coffee: ["cafe-1", "cafe-2", "cafe-3", "cafe-4"],
  library: ["library-1", "library-2", "library-3", "library-4"],
};

const SEAT_CAPACITY: Record<string, number> = {
  metro: 2,
  cafe: 1,
  coffee: 1,
  library: 1,
};

function normalizeLayout(room: Room | null) {
  return (room?.layout || room?.type || room?.room_type || "metro").toString().trim().toLowerCase();
}

export default function RoomPage({ params }: Props) {
  const supabase = createClient();

  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const [extraSeats, setExtraSeats] = useState(0);
  const [extraTables, setExtraTables] = useState(0);
  const [extraShelves, setExtraShelves] = useState(0);

  const layoutName = normalizeLayout(room);

  useEffect(() => {
    let membersChannel: ReturnType<typeof supabase.channel> | null = null;

    const initialize = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;

      setRoomId(id);

      const savedUsername = localStorage.getItem("username") || "guest";
      const savedAvatar = localStorage.getItem("avatar") || "/avatars/strawberry.png";

      setUsername(savedUsername);
      setAvatar(savedAvatar);

      await fetchRoom(id);

      const roomRes = await supabase.from("rooms").select("visibility").eq("id", id).single();
      if (roomRes.data?.visibility === "private") {
        const { data: existing } = await supabase
          .from("room_members")
          .select("*")
          .eq("room_id", id)
          .eq("username", savedUsername);

        if (!existing || existing.length === 0) {
          window.location.href = "/";
          return;
        }
      }

      await joinRoom(id, savedUsername, savedAvatar);
      await fetchMembers(id);

      membersChannel = supabase
        .channel(`room-members-${id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${id}` },
          () => {
            fetchMembers(id);
          }
        )
        .subscribe();
    };

    initialize();

    return () => {
      if (membersChannel) {
        supabase.removeChannel(membersChannel);
      }
    };
  }, [params, supabase]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const fetchRoom = async (id: string) => {
    const { data } = await supabase.from("rooms").select("*").eq("id", id).single();

    if (data) {
      setRoom(data);
      return data as Room;
    }

    return null;
  };

  const fetchMembers = async (id: string) => {
    const { data } = await supabase.from("room_members").select("*").eq("room_id", id);
    setMembers((data ?? []) as Member[]);
  };

  const joinRoom = async (
    id: string,
    currentUsername: string,
    currentAvatar: string
  ) => {
    const { data: existing } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", id)
      .eq("username", currentUsername);

    if (existing && existing.length > 0) {
      return;
    }

    await supabase.from("room_members").insert([
      {
        room_id: id,
        username: currentUsername,
        avatar: currentAvatar,
        status: "on arrival",
        seat_id: null,
      },
    ]);

    try {
      await supabase.from("activity_log").insert([
        { room_id: id, user_id: null, action: "join", details: { username: currentUsername, seat: null } },
      ]);
    } catch (error) {
      console.warn("Could not log activity", error);
    }
  };

  const joinSeat = async (seatId: string) => {
    const seatMembers = members.filter((member) => member.seat_id === seatId);
    const currentMember = members.find((member) => member.username === username);
    const layoutCapacity = SEAT_CAPACITY[layoutName] ?? 1;

    const currentMemberAlreadyHere = currentMember?.seat_id === seatId;
    const availableSpots = currentMemberAlreadyHere ? layoutCapacity : layoutCapacity - seatMembers.length;

    if (availableSpots <= 0) {
      alert("That seat is full.");
      return;
    }

    await supabase
      .from("room_members")
      .update({ seat_id: seatId })
      .eq("room_id", roomId)
      .eq("username", username);

    await fetchMembers(roomId);

    try {
      await supabase.from("activity_log").insert([
        { room_id: roomId, user_id: null, action: "seat", details: { username, seat: seatId } },
      ]);
    } catch (error) {
      console.warn("Could not log seat activity", error);
    }
  };

  const updateStatus = async (memberId: string, status: string) => {
    await supabase.from("room_members").update({ status }).eq("id", memberId);

    setMembers((currentMembers) =>
      currentMembers.map((member) => (member.id === memberId ? { ...member, status } : member))
    );

    try {
      await supabase.from("activity_log").insert([
        { room_id: roomId, user_id: null, action: "status", details: { username, status } },
      ]);
    } catch (error) {
      console.warn("Could not log status change", error);
    }
  };

  const startSession = async () => {
    const { data } = await supabase.from("sessions").insert([{ room_id: roomId }]).select().single();

    if (data) {
      setSessionId(data.id);
      setTimerSeconds(0);

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }

      timerRef.current = window.setInterval(() => setTimerSeconds((seconds) => seconds + 1), 1000);

      try {
        await supabase.from("activity_log").insert([
          { room_id: roomId, user_id: null, action: "session_start", details: { session_id: data.id } },
        ]);
      } catch (error) {
        console.warn("Could not log session start", error);
      }
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    const endedAt = new Date().toISOString();
    const duration = timerSeconds;

    await supabase.from("sessions").update({ ended_at: endedAt, duration_seconds: duration }).eq("id", sessionId);

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSessionId(null);
    setTimerSeconds(0);

    try {
      await supabase.from("activity_log").insert([
        { room_id: roomId, user_id: null, action: "session_end", details: { duration_seconds: duration } },
      ]);
    } catch (error) {
      console.warn("Could not log session end", error);
    }
  };

  const copyCode = async () => {
    if (!room?.share_code) return;

    await navigator.clipboard.writeText(room.share_code);
    alert("Code copied!");
  };

  const renderLayout = () => {
    if (!room) return null;

    switch (layoutName) {
      case "metro":
        return <MetroLayout members={members} joinSeat={joinSeat} extraBenches={extraSeats} />;
      case "library":
        return <LibraryLayout members={members} joinSeat={joinSeat} extraCubicles={extraShelves} />;
      case "cafe":
      case "coffee":
        return <CafeLayout members={members} joinSeat={joinSeat} extraTables={extraTables} />;
      default:
        return <MetroLayout members={members} joinSeat={joinSeat} extraBenches={extraSeats} />;
    }
  };

  return (
    <main className="min-h-screen p-8 bg-[#f6f6f7]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-6xl font-bold">{room?.name}</h1>
          <p className="text-2xl opacity-50 mt-2 capitalize">{layoutName}</p>
        </div>

        <button
          onClick={copyCode}
          className="border rounded-2xl px-8 py-4 bg-white shadow-sm hover:scale-[1.02] transition-all"
        >
          Share Code
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {layoutName === "metro" && (
          <button
            onClick={() => setExtraSeats((current) => current + 1)}
            className="rounded-2xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Add seat
          </button>
        )}

        {(layoutName === "cafe" || layoutName === "coffee") && (
          <button
            onClick={() => setExtraTables((current) => current + 1)}
            className="rounded-2xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Add table
          </button>
        )}

        {layoutName === "library" && (
          <button
            onClick={() => setExtraShelves((current) => current + 1)}
            className="rounded-2xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Add table
          </button>
        )}
      </div>

      {renderLayout()}

      <div className="mt-8">
        <div className="flex items-center gap-4 mb-4">
          {!sessionId ? (
            <button onClick={startSession} className="px-4 py-2 bg-green-500 text-white rounded">
              Start Session
            </button>
          ) : (
            <button onClick={endSession} className="px-4 py-2 bg-red-500 text-white rounded">
              End Session ({Math.floor(timerSeconds / 60)}:{("0" + (timerSeconds % 60)).slice(-2)})
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Chat roomId={roomId} username={username} userId={null} />
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-2">Members</h3>
            <div className="space-y-3">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isCurrentUser={member.username === username}
                  updateStatus={updateStatus}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
