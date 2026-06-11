/** Backend messageFormater often puts the entity in `message` and text in `data`. */
export function extractApiEntity<T extends Record<string, unknown>>(
  body: unknown,
  entityKey: keyof T & string,
): T | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const candidates = [record.message, record.data];

  for (const value of candidates) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      entityKey in value
    ) {
      return value as T;
    }
  }

  return null;
}

export function extractApiArray<T>(body: unknown): T[] {
  if (!body || typeof body !== "object") return [];

  const record = body as Record<string, unknown>;

  if (Array.isArray(record.message)) return record.message as T[];
  if (Array.isArray(record.data)) return record.data as T[];

  return [];
}

export function extractApiText(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;

  if (typeof record.message === "string") return record.message;
  if (typeof record.data === "string") return record.data;

  return null;
}
