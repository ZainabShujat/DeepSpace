"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function CreateRoom() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [type, setType] = useState("metro");

  const createRoom = async () => {
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from("rooms")
      .insert([
        {
          name,
          layout: type,
          visibility: "public",
          mode: "endless",
          invite_code: shareCode,
          share_code: shareCode,
        },
      ])
      .select();

    if (!error && data && data[0]) {
      const room = data[0];
      window.location.href = `/room/${room.id}`;
    } else {
      console.error(error);
      alert("Could not create room");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 border rounded-2xl w-[350px]">
      <h2 className="text-2xl font-semibold">Create Room</h2>

      <input
        className="border rounded-lg p-3"
        placeholder="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        className="border rounded-lg p-3"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="metro">Metro</option>
        <option value="cafe">Cafe</option>
        <option value="library">Library</option>
      </select>

      <button onClick={createRoom} className="bg-black text-white rounded-lg p-3">
        Create
      </button>
    </div>
  );
}
