"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "../../../../lib/supabase/client";

import MetroLayout from "../../../components/layouts/MetroLayout";
import CafeLayout from "../../../components/layouts/CafeLayout";
import LibraryLayout from "../../../components/layouts/LibraryLayout";
import Chat from "../../../components/room/Chat";
import MemberCard from "../../../components/room/MemberCard";
import RoomControls from "../../../components/room/RoomControls";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

import type { Member } from "@/types/member";

interface Room {
  id: string;
  name: string;
  layout?: string | null;
  type?: string | null;
  room_type?: string | null;
  share_code?: string | null;
  max_members?: number | null;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const [extraSeats, setExtraSeats] = useState(0);
  const [extraTables, setExtraTables] = useState(0);
  const [extraShelves, setExtraShelves] = useState(0);
  const [extrasSupported, setExtrasSupported] = useState<boolean | null>(null);

  const saveExtras = async (seats?: number, tables?: number, shelves?: number) => {
    if (!roomId) return;
    if (extrasSupported === false) return; // detected not supported, avoid repeated errors
    const payload: any = {};
    if (typeof seats === "number") payload.extra_seats = seats;
    if (typeof tables === "number") payload.extra_tables = tables;
    if (typeof shelves === "number") payload.extra_shelves = shelves;

    if (Object.keys(payload).length === 0) return;

    try {
      // detect support once
      if (extrasSupported === null) {
        try {
          const test = await supabase.from("rooms").select("extra_seats").limit(1).maybeSingle();
          if (test.error) {
            setExtrasSupported(false);
            console.warn("Rooms table does not support extra_* columns, skipping persistence");
            return;
          }
          setExtrasSupported(true);
        } catch (detectionErr) {
          setExtrasSupported(false);
          console.warn("Could not detect extras support, skipping persistence", detectionErr);
          return;
        }
      }

      const { error } = await supabase.from("rooms").update(payload).eq("id", roomId);
      if (error) {
        const msg = error.message || "";
        console.warn("Could not persist extras on rooms table:", msg);
        if (msg.includes("Could not find the 'extra_")) setExtrasSupported(false);
      }
    } catch (err) {
      console.warn("Could not persist extras (unexpected):", err);
    }
  };

  const layoutName = normalizeLayout(room);
  const maxMembers = room?.max_members ?? null;
  const joinedCount = members.length;

  useEffect(() => {
    let membersChannel: ReturnType<typeof supabase.channel> | null = null;
    let sessionsChannel: ReturnType<typeof supabase.channel> | null = null;

    const initialize = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;

      setRoomId(id);

      const savedUsername = localStorage.getItem("username") || "guest";
      const savedAvatar = localStorage.getItem("avatar") || null;

      // detect current user id for auth users
      try {
        const sess = await supabase.auth.getSession();
        const uid = sess?.data?.session?.user?.id || null;
        setCurrentUserId(uid);
      } catch (err) {
        setCurrentUserId(null);
      }

      setUsername(savedUsername);
      setAvatar(savedAvatar || "");

      await fetchRoom(id);

      // if a session is already active, bootstrap it immediately
      const { data: activeSession } = await supabase
        .from("sessions")
        .select("id, started_at")
        .eq("room_id", id)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeSession) {
        const startedAt = new Date(activeSession.started_at).getTime();
        const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
        setSessionId(activeSession.id);
        setTimerSeconds(seconds);
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => setTimerSeconds((s) => s + 1), 1000);
      }

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

      await joinRoom(id, savedUsername, savedAvatar || "");
      await fetchMembers(id);

      // determine host by owner_username or owner_id
      const roomRec = await fetchRoom(id);
      const ownerUsername = (roomRec as any)?.owner_username;
      const ownerId = (roomRec as any)?.owner_id;

      setIsHost(Boolean((ownerId && ownerId === (await supabase.auth.getSession())?.data?.session?.user?.id) || ownerUsername === savedUsername));

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

      // listen for session start / end to synchronize timers
      sessionsChannel = supabase
        .channel(`room-sessions-${id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sessions", filter: `room_id=eq.${id}` },
          async (payload) => {
            try {
              const ev = (payload as any).eventType || (payload as any).type || null;

              const newRow = (payload as any).new || (payload as any).record;

              if (!newRow) return;

              // INSERT => session started
              if (ev === "INSERT") {
                const startedAt = new Date(newRow.started_at).getTime();
                const now = Date.now();
                const seconds = Math.floor((now - startedAt) / 1000);

                setSessionId(newRow.id);
                setTimerSeconds(seconds);

                if (timerRef.current) window.clearInterval(timerRef.current);
                timerRef.current = window.setInterval(() => setTimerSeconds((s) => s + 1), 1000);
              }

              // UPDATE => possibly ended
              if (ev === "UPDATE") {
                if (newRow.ended_at) {
                  // session ended
                  if (timerRef.current) {
                    window.clearInterval(timerRef.current);
                    timerRef.current = null;
                  }
                  setSessionId(null);
                }
              }
            } catch (err) {
              console.warn("Could not handle session realtime payload", err);
            }
          }
        )
        .subscribe();
    };

    initialize();

    return () => {
      if (membersChannel) {
        supabase.removeChannel(membersChannel);
      }
      if (sessionsChannel) {
        supabase.removeChannel(sessionsChannel);
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
      // populate extra seats/tables/shelves if available in schema
      try {
        if (typeof (data as any).extra_seats === "number") setExtraSeats((data as any).extra_seats || 0);
        if (typeof (data as any).extra_tables === "number") setExtraTables((data as any).extra_tables || 0);
        if (typeof (data as any).extra_shelves === "number") setExtraShelves((data as any).extra_shelves || 0);
      } catch (err) {
        // ignore if columns missing
      }
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

    // enforce room capacity
    try {
      const { data: roomRec } = await supabase.from("rooms").select("max_members").eq("id", id).single();
      const capacity = roomRec && (roomRec as any).max_members;

      const { data: currentMembers } = await supabase.from("room_members").select("id").eq("room_id", id);
      const count = (currentMembers || []).length;

      // if capacity is a positive integer, enforce it; otherwise treat as unlimited
      if (typeof capacity === "number" && capacity > 0 && count >= capacity) {
        alert("Room is full");
        return;
      }
    } catch (err) {
      console.warn("Could not check room capacity", err);
    }

    try {
      const { error: insertErr } = await supabase.from("room_members").insert([
        {
          room_id: id,
          username: currentUsername,
          avatar: currentAvatar,
          status: "on arrival",
          seat_id: null,
        },
      ]);

      if (insertErr) {
        console.error("Could not insert room_member:", insertErr);
        alert("Could not join room (server error)");
        return;
      }
    } catch (err) {
      console.error("Join room failed:", err);
      alert("Could not join room (unexpected error)");
      return;
    }

    try {
      await supabase.from("activity_log").insert([
        { room_id: id, user_id: null, action: "join", details: { username: currentUsername, seat: null } },
      ]);
    } catch (error) {
      console.warn("Could not log activity", error);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await supabase.from("room_members").delete().eq("id", memberId);
      await fetchMembers(roomId);

      try {
        await supabase.from("activity_log").insert([
          { room_id: roomId, user_id: null, action: "remove_member", details: { memberId } },
        ]);
      } catch (err) {
        console.warn("Could not log remove member", err);
      }
    } catch (err) {
      console.error(err);
      alert("Could not remove member");
    }
  };

  const extendBreak = async (seconds = 300) => {
    // simple implementation: add seconds to timerSeconds when a session is active
    if (!sessionId) return;
    setTimerSeconds((s) => s + seconds);

    try {
      await supabase.from("activity_log").insert([
        { room_id: roomId, user_id: null, action: "extend_break", details: { seconds } },
      ]);
    } catch (err) {
      console.warn("Could not log extend break", err);
    }
  };

  const joinSeat = async (seatId: string) => {
    const seatMembers = members.filter((member) => member.seat_id === seatId);
    const currentMember = members.find((member) => member.username === username);
    const layoutCapacity = SEAT_CAPACITY[layoutName] ?? 1;

    const currentMemberAlreadyHere = currentMember?.seat_id === seatId;
    const availableSpots = currentMemberAlreadyHere ? layoutCapacity : layoutCapacity - seatMembers.length;

    if (availableSpots <= 0) {
      alert("Seat occupied!");
      return;
    }

    try {
      const { error: updErr } = await supabase
        .from("room_members")
        .update({ seat_id: seatId })
        .eq("room_id", roomId)
        .eq("username", username);

      if (updErr) {
        console.error("Could not claim seat:", updErr);
        alert("Could not take seat (server error)");
        return;
      }
    } catch (err) {
      console.error("Join seat failed:", err);
      alert("Could not take seat (unexpected error)");
      return;
    }

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
    try {
      const { data, error } = await supabase.from("sessions").insert([{ room_id: roomId }]).select().single();

      if (error || !data) {
        console.error("Could not start session:", error);
        alert("Could not start session (server error)");
        return;
      }

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
    } catch (err) {
      console.error("Start session failed:", err);
      alert("Could not start session (unexpected error)");
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    const endedAt = new Date().toISOString();
    const duration = timerSeconds;

    try {
      const { error } = await supabase.from("sessions").update({ ended_at: endedAt, duration_seconds: duration }).eq("id", sessionId);

      if (error) {
        console.error("Could not end session:", error);
        alert("Could not end session (server error)");
        return;
      }

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
        // persist session history
        try {
          const memberList = members.map((m) => ({ id: m.id, username: m.username }));
          const { error: histErr } = await supabase.from("session_history").insert([
            { room_id: roomId, room_name: room?.name || null, ended_at: endedAt, duration_seconds: duration, members: memberList },
          ]);

          if (histErr) console.warn("Could not write session history", histErr);
        } catch (err) {
          console.warn("Could not write session history", err);
        }
      } catch (error) {
        console.warn("Could not log session end", error);
      }
    } catch (err) {
      console.error("End session failed:", err);
      alert("Could not end session (unexpected error)");
    }
  };

  const copyCode = async () => {
    const code = (room as any)?.share_code || (room as any)?.invite_code || (room as any)?.join_code;
    if (!code) {
      alert("No share code available");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      alert("Code copied!");
    } catch (err) {
      console.error("Could not copy code", err);
      alert("Could not copy code to clipboard");
    }
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
          <h1 className="text-6xl font-bold press-title">{room?.name}</h1>
          <p className="text-2xl opacity-50 mt-2 capitalize">
            {layoutName}
            {maxMembers ? ` • ${joinedCount}/${maxMembers} joined` : ` • ${joinedCount} joined`}
          </p>
        </div>
      </div>

      {sessionId && (
        <div className="mb-4 text-sm font-semibold">
          Focus session currently active
        </div>
      )}

      <div className="relative">
        <RoomControls
          sessionId={sessionId}
          timerSeconds={timerSeconds}
          isHost={isHost}
          onStart={startSession}
          onEnd={endSession}
          onExtend={extendBreak}
          onAddSeat={
            layoutName === "metro"
              ? () => {
                  setExtraSeats((c) => {
                    const next = c + 1;
                    saveExtras(next, undefined, undefined);
                    return next;
                  });
                }
              : undefined
          }
          onAddTable={
            layoutName === "cafe" || layoutName === "coffee" || layoutName === "library"
              ? () => {
                  setExtraTables((c) => {
                    const next = c + 1;
                    saveExtras(undefined, next, undefined);
                    return next;
                  });
                }
              : undefined
          }
          onCopyCode={copyCode}
        />

        {renderLayout()}
      </div>

      <div className="mt-8">
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
                  isHost={isHost}
                  onRemove={removeMember}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
