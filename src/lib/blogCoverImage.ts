/** Fix paste mistakes like `http://127.0.0.1:4000https://images.unsplash.com/...` */
export function sanitizeCoverImageInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const httpsIndex = trimmed.indexOf("https://");
  if (httpsIndex > 0) {
    return trimmed.slice(httpsIndex);
  }

  const httpMatches = [...trimmed.matchAll(/https?:\/\//g)];
  if (httpMatches.length > 1 && httpMatches[1].index != null) {
    return trimmed.slice(httpMatches[1].index);
  }

  return trimmed;
}

/** Turn API value into a browser-loadable image src. */
export function resolveBlogCoverImageUrl(
  coverImage: string | null | undefined,
): string | null {
  const sanitized = sanitizeCoverImageInput(coverImage ?? "");
  if (!sanitized) return null;

  if (/^https?:\/\//i.test(sanitized)) {
    try {
      const url = new URL(sanitized);
      if (url.pathname.startsWith("/public/")) {
        return url.pathname;
      }
    } catch {
      return sanitized;
    }
    return sanitized;
  }

  if (sanitized.startsWith("/public/")) return sanitized;
  if (sanitized.startsWith("public/")) return `/${sanitized}`;

  return sanitized;
}

/** Value shown in the cover-image input when editing. */
export function coverImageForForm(coverImage: string | null | undefined): string {
  const sanitized = sanitizeCoverImageInput(coverImage ?? "");
  if (!sanitized) return "";

  if (/^https?:\/\//i.test(sanitized)) {
    try {
      const url = new URL(sanitized);
      if (url.pathname.startsWith("/public/")) {
        return "";
      }
    } catch {
      return sanitized;
    }
    return sanitized;
  }

  if (sanitized.startsWith("/public/") || sanitized.startsWith("public/")) {
    return "";
  }

  return sanitized;
}

/** Ensure payload sent to backend passes `z.string().url()`. */
export function coverImageForStorage(input: string): string {
  const sanitized = sanitizeCoverImageInput(input);
  if (!sanitized) return "";

  if (/^https?:\/\//i.test(sanitized)) {
    return sanitized;
  }

  if (sanitized.startsWith("/public/") || sanitized.startsWith("public/")) {
    const path = sanitized.startsWith("/") ? sanitized : `/${sanitized}`;
    const backendOrigin =
      process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:4000";
    return `${backendOrigin}${path}`;
  }

  return sanitized;
}

export function isValidCoverImageUrl(input: string): boolean {
  const sanitized = sanitizeCoverImageInput(input);
  if (!sanitized) return true;

  if (sanitized.startsWith("/public/") || sanitized.startsWith("public/")) {
    return true;
  }

  try {
    const parsed = new URL(sanitized);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
