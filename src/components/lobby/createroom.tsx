"use client";

import { useState } from "react";
import createClient from "@/lib/supabase/client";

export default function CreateRoom() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [layout, setLayout] = useState("metro");
  const [visibility, setVisibility] = useState("public");
  const [maxMembers, setMaxMembers] = useState("");

  const ensureGuestIdentity = () => {
    try {
      const existingName = typeof window !== "undefined" ? localStorage.getItem("username") : null;
      if (!existingName && typeof window !== "undefined") {
        const guest = `guest-${Math.random().toString(36).slice(2, 7)}`;
        localStorage.setItem("username", guest);
        localStorage.setItem("avatar", "strawberry");
        document.cookie = "deepspace-guest=true; path=/; max-age=86400";
        return guest;
      }

      return existingName;
    } catch {
      return null;
    }
  };

  const createRoom = async () => {
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const guestName = ensureGuestIdentity();

    const payload: any = {
      name,
      visibility,
      mode: "endless",
    };

    // set all known room-type columns; the retry loop strips unsupported ones
    payload.layout = layout;
    payload.type = layout;
    payload.room_type = layout;

      // include max_members only if the column exists and user supplied a value
    try {
      const maxTest = await supabase.from("rooms").select("max_members").limit(1).maybeSingle();
      if (!maxTest.error) {
        if (maxMembers !== "") payload.max_members = Number(maxMembers);
      }
    } catch (err) {
      // ignore if column missing
    }

    // attach owner info when available (auth or guest localStorage) only if columns exist
    try {
      const sessionRes = await supabase.auth.getSession();
      const userId = sessionRes?.data?.session?.user?.id;

      // only include owner_id if column exists
      try {
        const ownerTest = await supabase.from("rooms").select("owner_id").limit(1).maybeSingle();
        if (!ownerTest.error && userId) {
          payload.owner_id = userId;
        }
      } catch (err) {
        // ignore
      }

      // owner_username
      try {
        const ownerNameTest = await supabase.from("rooms").select("owner_username").limit(1).maybeSingle();
        if (!ownerNameTest.error) {
          if (userId) {
            try {
              const { data: userRec } = await supabase.from("users").select("username").eq("id", userId).single();
              if (userRec && (userRec as any).username) payload.owner_username = (userRec as any).username;
            } catch (e) {
              // ignore
            }
          } else {
            const guestName = ensureGuestIdentity();
            if (guestName) payload.owner_username = guestName;
          }
        }
      } catch (err) {
        // ignore
      }
    } catch (err) {
      // ignore
    }

    if (visibility === "private") {
      payload.invite_code = shareCode;
      payload.share_code = shareCode;
    }

    // attempt insert with retries removing unknown columns reported by PostgREST
    let attempts = 0;
    let lastError: any = null;

    while (attempts < 6) {
      attempts += 1;
      try {
        const { data, error } = await supabase.from("rooms").insert([payload]).select();
        if (!error && data && data[0]) {
          const room = data[0];

          if (visibility === "private") {
            const creatorName = guestName || ensureGuestIdentity() || "guest";
            const creatorAvatar = typeof window !== "undefined" ? localStorage.getItem("avatar") || "strawberry" : "strawberry";

            try {
              await supabase.from("room_members").insert([
                {
                  room_id: room.id,
                  username: creatorName,
                  avatar: creatorAvatar,
                  status: "on arrival",
                  seat_id: null,
                },
              ]);
            } catch (memberErr) {
              console.warn("Could not pre-enroll creator in private room", memberErr);
            }
          }

          window.location.href = `/room/${room.id}`;
          return;
        }

        lastError = error;

        // detect missing column error and remove that key then retry
        const msg = error?.message || "";
        const m = msg.match(/Could not find the '(.+)' column/);
        if (m && m[1]) {
          const col = m[1];
          if (payload.hasOwnProperty(col)) {
            delete payload[col];
            continue;
          }
        }

        break;
      } catch (err) {
        lastError = err;
      }
    }

    console.error(lastError);
    alert("Could not create room");
  };

  return (
    <div className="flex flex-col gap-4 p-6 w-87.5 thick-border pixel-shadow rounded-sm">
      <h2 className="text-2xl font-semibold">Create Room</h2>

      <input
        className="border p-3 thick-border rounded-sm"
        placeholder="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        className="border p-3 thick-border rounded-sm"
        value={layout}
        onChange={(e) => setLayout(e.target.value)}
      >
        <option value="metro">Metro</option>
        <option value="cafe">Cafe</option>
        <option value="library">Library</option>
      </select>

      <select
        className="border p-3 thick-border rounded-sm"
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>

      <select
        className="border p-3 thick-border rounded-sm"
        value={maxMembers}
        onChange={(e) => setMaxMembers(e.target.value)}
      >
        <option value="">Unlimited</option>
        <option value="2">2</option>
        <option value="4">4</option>
        <option value="6">6</option>
        <option value="8">8</option>
        <option value="10">10</option>
      </select>

      <button onClick={createRoom} className="bg-black text-white press-button thick-border p-3 rounded-sm">
        Create
      </button>

      <hr className="border-t my-2" />

      <div className="pt-2">
        <h3 className="font-semibold">Join Private Room</h3>

        <div className="flex gap-2 mt-2">
          <input
            placeholder="Enter room code"
            className="border p-3 thick-border rounded-sm flex-1"
            id="join-code-input"
          />

          <button
            onClick={async () => {
              try {
                const supabase = createClient();
                const codeEl = document.getElementById("join-code-input") as HTMLInputElement | null;
                const code = codeEl?.value?.trim()?.toUpperCase();

                if (!code) {
                  alert("Enter a room code");
                  return;
                }

                const { data: room, error } = await supabase
                  .from("rooms")
                  .select("id, visibility, max_members")
                  .or(`invite_code.eq.${code},share_code.eq.${code},id.eq.${code}`)
                  .maybeSingle();

                if (error) throw error;

                if (!room || room.visibility !== "private") {
                  alert("Invalid code or room not private");
                  return;
                }

                const guestName = ensureGuestIdentity() || "guest";
                const guestAvatar = typeof window !== "undefined" ? localStorage.getItem("avatar") || "strawberry" : "strawberry";

                const { data: currentMembers } = await supabase.from("room_members").select("id").eq("room_id", room.id);
                const { data: roomCapacity } = await supabase.from("rooms").select("max_members").eq("id", room.id).single();

                if (typeof roomCapacity?.max_members === "number" && roomCapacity.max_members > 0 && (currentMembers || []).length >= roomCapacity.max_members) {
                  alert("Room is full");
                  return;
                }

                const { data: existingMember } = await supabase
                  .from("room_members")
                  .select("id")
                  .eq("room_id", room.id)
                  .eq("username", guestName)
                  .maybeSingle();

                if (!existingMember) {
                  const { error: joinError } = await supabase.from("room_members").insert([
                    {
                      room_id: room.id,
                      username: guestName,
                      avatar: guestAvatar,
                      status: "on arrival",
                      seat_id: null,
                    },
                  ]);

                  if (joinError) throw joinError;
                }

                window.location.href = `/room/${room.id}`;
              } catch (err) {
                console.error(err);
                alert("Invalid code or could not join");
              }
            }}
            className="bg-black text-white press-button thick-border px-4"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
