export function getApiErrorMessage(
  data: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!data || typeof data !== "object") return fallback;

  const record = data as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  if (typeof record.data === "string" && record.data.trim()) {
    return record.data;
  }

  if (Array.isArray(record.details)) {
    const first = record.details[0] as { message?: string } | undefined;
    if (first?.message) return first.message;
  }

  return fallback;
}
