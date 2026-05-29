interface AvatarProps {
  username: string;
  avatar: string;
}
export default function Avatar({
  username,
  avatar,
}: AvatarProps) {
  const src = (() => {
    if (!avatar) return "/avatars/strawberry.png";
    // absolute path or external url
    if (avatar.startsWith("/") || avatar.startsWith("http")) {
      return avatar.endsWith(".png") || /\.[a-z0-9]+$/i.test(avatar) ? avatar : `${avatar}.png`;
    }

    // plain filename, add avatars path and ensure .png
    return avatar.endsWith(".png") ? `/avatars/${avatar}` : `/avatars/${avatar}.png`;
  })();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-black bg-white flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={username} className="w-12 h-12 object-contain" />
      </div>

      <p className="text-xs font-medium">{username}</p>
    </div>
  );
}