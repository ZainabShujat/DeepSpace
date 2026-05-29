"use client";

import { resolveAvatarSrc } from "../room/Avatar";

interface Props {
  selectedAvatar: string;
  setSelectedAvatar: (value: string) => void;
}

// Use canonical avatar keys (filenames) rather than full paths
const avatars = ["strawberry", "blueberry", "lemon"];

export default function AvatarPicker({ selectedAvatar, setSelectedAvatar }: Props) {
  return (
    <div>
      <p className="mb-4 text-sm font-medium">Choose Avatar</p>

      <div className="flex gap-4">
        {avatars.map((a) => {
          const src = resolveAvatarSrc(a);
          return (
            <button
              key={a}
              onClick={() => setSelectedAvatar(a)}
              className={`thick-border p-3 transition-all rounded-sm ${
                selectedAvatar === a ? "scale-105" : "opacity-70"
              }`}
            >
              <img src={src} alt={a} className="w-16 h-16 pixelated" />
            </button>
          );
        })}
      </div>
    </div>
  );
}