interface AvatarProps {
  username: string;
  avatar: string;
}

export default function Avatar({
  username,
  avatar,
}: AvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-black bg-white flex items-center justify-center">
        <img
          src={`/avatars/${avatar}.png`}
          alt={avatar}
          className="w-12 h-12 object-contain"
        />
      </div>

      <p className="text-xs font-medium">
        {username}
      </p>
    </div>
  );
}