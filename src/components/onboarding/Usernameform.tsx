"use client";

interface Props {
  username: string;
  setUsername: (value: string) => void;
}

export default function UsernameForm({
  username,
  setUsername,
}: Props) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-medium">
        Username
      </label>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        className="w-full border rounded-xl px-4 py-3 outline-none"
      />
    </div>
  );
}