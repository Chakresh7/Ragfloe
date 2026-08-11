type UserAvatarProps = {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export function UserAvatar({ name, email, avatarUrl }: UserAvatarProps) {
  const label = name || email || "User";
  const initial = label.trim().charAt(0).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="user-avatar"
        width={56}
        height={56}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="user-avatar user-avatar-fallback" aria-hidden="true">
      {initial}
    </div>
  );
}
