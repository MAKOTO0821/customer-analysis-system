function colorFor(seed: string): string {
  const colors = ["#f91880", "#7856ff", "#1d9bf0", "#00ba7c", "#ffad1f", "#f4212e"];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return colors[hash % colors.length];
}

export default function Avatar({
  username,
  avatarUrl,
  size = 40,
}: {
  username: string;
  avatarUrl?: string;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={username}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, backgroundColor: colorFor(username), fontSize: size * 0.4 }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}
