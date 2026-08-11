export function getAvatarUrl(
  metadata: Record<string, unknown> | undefined,
): string | null {
  if (!metadata) return null;
  if (typeof metadata.avatar_url === "string" && metadata.avatar_url) {
    return metadata.avatar_url;
  }
  if (typeof metadata.picture === "string" && metadata.picture) {
    return metadata.picture;
  }
  return null;
}

export function getDisplayName(
  metadata: Record<string, unknown> | undefined,
): string | null {
  if (!metadata) return null;
  if (typeof metadata.full_name === "string" && metadata.full_name) {
    return metadata.full_name;
  }
  if (typeof metadata.name === "string" && metadata.name) {
    return metadata.name;
  }
  if (typeof metadata.user_name === "string" && metadata.user_name) {
    return metadata.user_name;
  }
  return null;
}
