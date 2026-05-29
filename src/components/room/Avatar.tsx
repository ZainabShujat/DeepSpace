interface AvatarProps {
  username?: string;
  avatar?: string | null;
}

export function resolveAvatarSrc(avatar?: string | null) {
  if (!avatar) return "/avatars/strawberry.png";

  // absolute path or external url
  if (avatar.startsWith("/") || avatar.startsWith("http")) {
    return avatar.endsWith(".png") || /\.[a-z0-9]+$/i.test(avatar) ? avatar : `${avatar}.png`;
  }

  // plain filename, add avatars path and ensure .png
  return avatar.endsWith(".png") ? `/avatars/${avatar}` : `/avatars/${avatar}.png`;
}

export default function Avatar({ username = "Guest", avatar }: AvatarProps) {
  const src = resolveAvatarSrc(avatar);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="pixel-avatar overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={username} className="w-full h-full object-contain" />
      </div>

      <p className="text-xs font-medium">{username}</p>
    </div>
  );
}