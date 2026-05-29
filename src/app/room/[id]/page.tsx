"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
export const dynamic = "force-dynamic";
import { useSearchParams } from "next/navigation";

import createClient from "@/lib/supabase/client";

import MetroLayout from "../../../components/layouts/MetroLayout";
import CafeLayout from "../../../components/layouts/CafeLayout";
import LibraryLayout from "../../../components/layouts/LibraryLayout";
import Chat from "../../../components/room/Chat";
import MemberCard from "../../../components/room/MemberCard";
import RoomControls from "../../../components/room/RoomControls";
import BackLink from "@/components/navigation/BackLink";

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
  visibility?: string | null;
  share_code?: string | null;
  invite_code?: string | null;
  join_code?: string | null;
  max_members?: number | null;
  owner_id?: string | null;
  owner_username?: string | null;
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

const TIMER_PRESETS = [
  { id: "pomodoro-25-5", label: "Pomodoro", workMinutes: 25, breakMinutes: 5 },
  { id: "focus-50-10", label: "Focus", workMinutes: 50, breakMinutes: 10 },
  { id: "deep-90-15", label: "Deep Work", workMinutes: 90, breakMinutes: 15 },
  { id: "sprint-15-5", label: "Sprint", workMinutes: 15, breakMinutes: 5 },
];

function normalizeLayout(room: Room | null) {
  return (room?.layout || room?.type || room?.room_type || "metro").toString().trim().toLowerCase();
}

export default function RoomPage({ params }: Props) {
  // ensure a stable supabase client across renders to avoid re-subscribing
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const searchParams = useSearchParams();
  const shouldAutoJoin = searchParams.get("join") === "1";

  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [username, setUsername] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([]);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(25 * 60);
  const [selectedPresetId, setSelectedPresetId] = useState(TIMER_PRESETS[0].id);
  const timerRef = useRef<number | null>(null);
  const activityPollRef = useRef<number | null>(null);
  const leaveSentRef = useRef(false);

  const [extraSeats, setExtraSeats] = useState(0);
  const [extraTables, setExtraTables] = useState(0);
  const [extraShelves, setExtraShelves] = useState(0);
  const [extrasSupported, setExtrasSupported] = useState<boolean | null>(null);

  const pushToast = (message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2200);
  };

  const saveExtras = async (seats?: number, tables?: number, shelves?: number) => {
    if (!roomId) return;
    if (extrasSupported === false) return; // detected not supported, avoid repeated errors
    const payload: any = {};
    if (typeof seats === "number") payload.extra_seats = seats;
    if (typeof tables === "number") payload.extra_tables = tables;
    if (typeof shelves === "number") payload.extra_shelves = shelves;

    if (Object.keys(payload).length === 0) return;

    const nextCapacity =
      (room?.max_members ?? null) !== null
        ? (room?.max_members ?? 0) +
          (typeof seats === "number" ? 1 : 0) +
          (typeof tables === "number" ? 1 : 0) +
          (typeof shelves === "number" ? 1 : 0)
        : null;

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
        return;
      }

      if (nextCapacity !== null) {
        const { error: capacityError } = await supabase
          .from("rooms")
          .update({ max_members: nextCapacity })
          .eq("id", roomId);

        if (capacityError) {
          console.warn("Could not persist updated room capacity:", capacityError.message || capacityError);
        } else {
          setRoom((currentRoom) =>
            currentRoom ? { ...currentRoom, max_members: nextCapacity } : currentRoom
          );
        }
      }
    } catch (err) {
      console.warn("Could not persist extras (unexpected):", err);
    }
  };

  const layoutName = normalizeLayout(room);
  const maxMembers = room?.max_members ?? null;
  const joinedCount = members.length;
  const selectedPreset = TIMER_PRESETS.find((preset) => preset.id === selectedPresetId) || TIMER_PRESETS[0];

  useEffect(() => {
    let membersChannel: ReturnType<typeof supabase.channel> | null = null;
    let sessionsChannel: ReturnType<typeof supabase.channel> | null = null;
    let activityChannel: ReturnType<typeof supabase.channel> | null = null;
    const initialize = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;

      setRoomId(id);

      let savedUsername = localStorage.getItem("username") || "guest";
      let savedAvatar = localStorage.getItem("avatar") || null;

      // detect current user id for auth users
      let currentSessionUserId: string | null = null;
      try {
        const sess = await supabase.auth.getSession();
        const sessionUser = sess?.data?.session?.user;
        currentSessionUserId = sessionUser?.id || null;

        if (currentSessionUserId) {
          const { data: profile } = await supabase
            .from("users")
            .select("username, avatar")
            .eq("id", currentSessionUserId)
            .maybeSingle();

          savedUsername = profile?.username || sessionUser?.email || savedUsername;
          savedAvatar = profile?.avatar || savedAvatar;

          localStorage.setItem("username", savedUsername);
          if (savedAvatar) localStorage.setItem("avatar", savedAvatar);
        }
      } catch (err) {
        currentSessionUserId = null;
      }

      setUsername(savedUsername);

      const initialRoom = await fetchRoom(id);

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
        const totalSeconds = typeof activeSession.duration_seconds === "number" && activeSession.duration_seconds > 0 ? activeSession.duration_seconds : Math.max(seconds, 25 * 60);
        setTimerTotalSeconds(totalSeconds);
        setTimerSeconds(Math.max(totalSeconds - seconds, 0));
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => setTimerSeconds((s) => Math.max(s - 1, 0)), 1000);
      }

      const { data: existing } = await supabase
        .from("room_members")
        .select("*")
        .eq("room_id", id)
        .eq("username", savedUsername);

      if (initialRoom?.visibility === "private") {
        if (!shouldAutoJoin && (!existing || existing.length === 0)) {
          window.location.href = "/";
          return;
        }
      }

      if (activeSession && (!existing || existing.length === 0)) {
        const shouldEnter = window.confirm("This room is currently in an active focus session. Enter anyway?");
        if (!shouldEnter) {
          window.location.href = "/lobby";
          return;
        }
      }

      // Only join if we don't already have a membership row for this user
      if (!existing || existing.length === 0) {
        await joinRoom(id, savedUsername, savedAvatar || "");
      }
      await fetchMembers(id);
      await fetchActivity(id);

      if (activityPollRef.current) {
        window.clearInterval(activityPollRef.current);
      }
      activityPollRef.current = window.setInterval(() => {
        fetchActivity(id);
      }, 2000);

      // determine host by the creator recorded on the room
      const roomRec = await fetchRoom(id);
      const ownerUsername = roomRec?.owner_username;
      const ownerId = roomRec?.owner_id;

      setIsHost(Boolean((ownerId && ownerId === currentSessionUserId) || ownerUsername === savedUsername));

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


      activityChannel = supabase
        .channel(`room-activity-${id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "activity_log",
            filter: `room_id=eq.${id}`,
          },
          (payload: any) => {
            try {
              console.log("ACTIVITY CHANGE", payload);
              const newRow = (payload as any).new || (payload as any).record;
              if (newRow?.action) {
                pushToast(formatActivity(newRow));
              }
            } catch (e) {}
            fetchActivity(id);
          }
        )
        .subscribe();

      // listen for session start / end to synchronize timers
      sessionsChannel = supabase
        .channel(`room-sessions-${id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sessions", filter: `room_id=eq.${id}` },
          async (payload: any) => {
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
      if (activityPollRef.current) {
        window.clearInterval(activityPollRef.current);
        activityPollRef.current = null;
      }
      if (membersChannel) {
        supabase.removeChannel(membersChannel);
      }
      if (sessionsChannel) {
        supabase.removeChannel(sessionsChannel);
      }
      if (activityChannel) {
       supabase.removeChannel(activityChannel);
      }
    };
  }, [params]);

  useEffect(() => {
    if (!sessionId || timerSeconds !== 0 || timerTotalSeconds <= 0) return;
    void endSession();
  }, [sessionId, timerSeconds, timerTotalSeconds]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (activityPollRef.current) {
        window.clearInterval(activityPollRef.current);
      }
    };
  }, []);

  async function fetchRoom(id: string) {
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
  }

  async function fetchMembers(id: string) {
    const { data } = await supabase.from("room_members").select("*").eq("room_id", id);
    setMembers((data ?? []) as Member[]);
  }

  async function fetchActivity(id: string) {
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .eq("room_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  console.log("ACTIVITY DATA", data);
  setActivity(data || []);
}

  async function joinRoom(
    id: string,
    currentUsername: string,
    currentAvatar: string
  ) {
    const joinActivityKey = `room-join-logged:${id}:${currentUsername}`;

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

      pushToast(`${currentUsername} joined`);
    } catch (err) {
      console.error("Join room failed:", err);
      alert("Could not join room (unexpected error)");
      return;
    }

    try {
      const alreadyLogged = sessionStorage.getItem(joinActivityKey) === "1";

      if (!alreadyLogged) {
        await supabase.from("activity_log").insert([
          { room_id: id, user_id: null, action: "join", details: { username: currentUsername, seat: null } },
        ]);
        sessionStorage.setItem(joinActivityKey, "1");
      } else {
        console.log("Skipping duplicate join activity for", currentUsername);
      }
    } catch (error) {
      console.warn("Could not log activity", error);
    }
  }
  useEffect(() => {
    const sendLeave = () => {
      if (!roomId || !username || leaveSentRef.current) return;
      leaveSentRef.current = true;

      try {
        const payload = JSON.stringify({ roomId, username });
        if (navigator && (navigator as any).sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          (navigator as any).sendBeacon("/api/leave", blob);
          return;
        }
      } catch (e) {}

      try {
        fetch("/api/leave", {
          method: "POST",
          body: JSON.stringify({ roomId, username }),
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        });
      } catch (e) {}
    };

    const handleBeforeUnload = () => {
      sendLeave();
    };

    const handlePageHide = () => {
      sendLeave();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendLeave();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      sendLeave();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
}, [roomId, username]);

  const removeMember = async (memberId: string) => {
  
    try {
      
      const leavingMember = members.find(
  (m) => m.id === memberId
);

if (
  room?.owner_username === leavingMember?.username
) {
  const nextHost = members.find(
    (m) => m.id !== memberId
  );

  if (nextHost) {
    await supabase
      .from("rooms")
      .update({
        owner_username: nextHost.username,
      })
      .eq("id", roomId);
  }
}
      await supabase.from("room_members").delete().eq("id", memberId);
      await fetchMembers(roomId);

      try {
        await supabase.from("activity_log").insert([
          { room_id: roomId, user_id: null, action: "remove_member", details: {
  username: members.find(m => m.id === memberId)?.username || "unknown"
}},
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
    if (!isHost) return;

    // simple implementation: add seconds to timerSeconds when a session is active
    if (!sessionId) return;
    setTimerSeconds((s) => s + seconds);
    setTimerTotalSeconds((s) => s + seconds);

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
    let layoutCapacity = SEAT_CAPACITY[layoutName] ?? 1;

if (layoutName === "metro") {
  layoutCapacity += extraSeats;
}

if (layoutName === "cafe" || layoutName === "coffee") {
  layoutCapacity += extraTables;
}

if (layoutName === "library") {
  layoutCapacity += extraShelves;
}

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
    if (!isHost) return;

    try {
      const presetSeconds = selectedPreset.workMinutes * 60;
      const { data, error } = await supabase.from("sessions").insert([{ room_id: roomId, duration_seconds: presetSeconds }]).select().single();

      if (error || !data) {
        console.error("Could not start session:", error);
        alert("Could not start session (server error)");
        return;
      }

      setSessionId(data.id);
      setTimerTotalSeconds(presetSeconds);
      setTimerSeconds(presetSeconds);
      pushToast("Focus session started");

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }

      timerRef.current = window.setInterval(() => setTimerSeconds((seconds) => Math.max(seconds - 1, 0)), 1000);

      try {
        await supabase.from("activity_log").insert([
          { room_id: roomId, user_id: null, action: "session_start",details: {
  started_by: username
} },
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
    if (!isHost) return;

    if (!sessionId) return;

    const endedAt = new Date().toISOString();
    const duration = Math.max(timerTotalSeconds - timerSeconds, 0);

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
      setTimerTotalSeconds(25 * 60);
      pushToast("Focus session ended");

      try {
        await supabase.from("activity_log").insert([
          { room_id: roomId, user_id: null, action: "session_end", details: {
  ended_by: username,
  duration_seconds: duration
} },
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
    const code = room?.share_code || room?.invite_code || room?.join_code;
    if (!code) {
      alert("No share code available");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      pushToast("Code copied");
      alert("Code copied!");
    } catch (err) {
      console.error("Could not copy code", err);
      alert("Could not copy code to clipboard");
    }
  };

  const leaveRoom = async () => {
    if (!roomId || !username) {
      window.location.href = "/lobby";
      return;
    }

    try {
      await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, username }),
      });
      pushToast(`${username} left`);
    } catch (err) {
      console.warn("Could not leave room cleanly", err);
    }

    window.location.href = "/lobby";
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
function formatActivity(item: any) {
  const details = item.details || {};
  const actor = details.username || details.started_by || details.ended_by || "Someone";

  switch (item.action) {
    case "join":
      return `${actor} joined`;

    case "leave":
      return `${actor} left`;

    case "remove_member":
      return `${actor} left`;

    case "seat":
      return `${actor} sat at ${details.seat || "a seat"}`;

    case "status":
      return `${actor} became ${details.status}`;

    case "session_start":
      return "Focus session started";

    case "session_end":
      return "Focus session ended";

    case "host_transfer":
      return `${details.from || "Someone"} passed host to ${details.to || "another member"}`;

    case "extend_break":
      return `Break extended by ${details.seconds || 0} seconds`;

    default:
      return item.action;
  }
}
  return (
    <main className="min-h-screen p-8 bg-[#f6f6f7]">
      <div className="fixed right-4 top-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-fade rounded-sm border border-black bg-white px-3 py-2 text-sm shadow-lg"
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <BackLink href="/lobby" label="Back to lobby" />

        <div className="text-right">
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
          selectedPresetLabel={selectedPreset.label}
          timerPresets={TIMER_PRESETS}
          onPresetChange={setSelectedPresetId}
          onStart={startSession}
          onEnd={endSession}
          onExtend={extendBreak}
          onAddSeat={
            layoutName === "metro"
              ? () => {
                  if (!isHost) return;
                  setExtraSeats((c) => {
                    const next = c + 1;
                    saveExtras(next, undefined, undefined);
                    return next;
                  });
                }
              : undefined
          }
          onAddTable={
            layoutName === "cafe" || layoutName === "coffee"
              ? () => {
                  if (!isHost) return;
                  setExtraTables((c) => {
                    const next = c + 1;
                    saveExtras(undefined, next, undefined);
                    return next;
                  });
                }
              : undefined
          }
          onAddCubicle={
            layoutName === "library"
              ? () => {
                  if (!isHost) return;
                  setExtraShelves((c) => {
                    const next = c + 1;
                    saveExtras(undefined, undefined, next);
                    return next;
                  });
                }
              : undefined
          }
          onCopyCode={copyCode}
        />

        <div className="pointer-events-none absolute left-1/2 top-[-1.75rem] z-30 -translate-x-1/2">
          <div className="rounded-full border-2 border-black bg-white px-6 py-3 text-center shadow-[4px_4px_0_#000]">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
              {sessionId ? "Session timer" : "Ready to start"}
            </div>
            <div className="mt-1 text-3xl font-black press-title">
              {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, "0")}
            </div>
            <div className="text-xs text-black/60">
              {sessionId ? `${selectedPreset.label} • ${Math.floor(timerTotalSeconds / 60)}m total` : `${selectedPreset.label} preset`}
            </div>
          </div>
        </div>

        {renderLayout()}
      </div>
      <div className="mt-4">
        <button className="border px-4 py-2 rounded-sm" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>
      <div className="mt-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="col-span-2 space-y-6">

  <Chat
    roomId={roomId}
    username={username}
    userId={null}
  />

  <div className="border thick-border p-4 rounded-sm">
    <h3 className="text-lg font-semibold mb-3">
      Recent Activity
    </h3>

    <div className="space-y-2 text-sm">
      {activity.map((item) => (
        <div key={item.id}>
          <div className="font-medium">
            {formatActivity(item)}
          </div>

          <div className="opacity-60 text-xs">
            {new Date(item.created_at)
              .toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>

  </div>

</div>
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
