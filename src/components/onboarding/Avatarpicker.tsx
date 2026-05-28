"use client";

interface Props {
  selectedAvatar: string;
  setSelectedAvatar: (value: string) => void;
}

const avatars = [
  "/avatars/strawberry.png",
  "/avatars/blueberry.png",
  "/avatars/lemon.png",
];

export default function AvatarPicker({
  selectedAvatar,
  setSelectedAvatar,
}: Props) {
  return (
    <div>
      <p className="mb-4 text-sm font-medium">
        Choose Avatar
      </p>

      <div className="flex gap-4">
        {avatars.map((avatar) => (
          <button
            key={avatar}
            onClick={() => setSelectedAvatar(avatar)}
            className={`
              border rounded-2xl p-3 transition-all
              ${
                selectedAvatar === avatar
                  ? "border-black scale-105"
                  : "opacity-70"
              }
            `}
          >
            <img
              src={avatar}
              alt={avatar}
              className="w-16 h-16 pixelated"
            />
          </button>
        ))}
      </div>
    </div>
  );
}