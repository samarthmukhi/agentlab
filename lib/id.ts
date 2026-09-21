export function newId(prefix = "id"): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
    }
  } catch {
    // fall through
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
