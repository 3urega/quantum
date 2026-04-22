export function shortId(id: string) {
  return id.length > 8 ? id.slice(0, 8) : id;
}

export function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
