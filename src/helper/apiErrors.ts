import axios from "axios";

type ApiErrorBody = Record<string, unknown>;

function extractString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function formatZodIssues(details: unknown): string | null {
  if (!Array.isArray(details) || details.length === 0) return null;

  const messages = details
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const issue = item as { message?: string; path?: (string | number)[] };
      if (typeof issue.message !== "string") return null;

      const path =
        Array.isArray(issue.path) && issue.path.length > 0
          ? `${issue.path.join(".")}: `
          : "";

      return `${path}${issue.message}`;
    })
    .filter((value): value is string => Boolean(value));

  return messages.length > 0 ? messages.join(" ") : null;
}

export function isApiSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

export function getHttpErrorFallback(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You do not have permission for this action.";
    case 404:
      return "The requested item was not found.";
    case 409:
      return "This action conflicts with existing data.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function getApiErrorMessage(
  data: unknown,
  fallback = "Something went wrong. Please try again.",
  status?: number,
): string {
  const resolvedFallback =
    status && status >= 400 ? getHttpErrorFallback(status) : fallback;

  if (!data) return resolvedFallback;
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed) return resolvedFallback;
    const htmlRouteMatch = trimmed.match(/Cannot (GET|POST|PATCH|PUT|DELETE) ([^\s<]+)/i);
    if (htmlRouteMatch) {
      return `API route not found: ${htmlRouteMatch[2]}. Check that the backend is running with the latest routes.`;
    }
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
      return resolvedFallback;
    }
    return trimmed;
  }
  if (typeof data !== "object") return resolvedFallback;

  const record = data as ApiErrorBody;

  if (record.success === false) {
    const fromData = extractString(record.data);
    const fromMessage = extractString(record.message);
    if (fromData) return fromData;
    if (fromMessage) return fromMessage;
  }

  const zodMessage = formatZodIssues(record.details);
  if (zodMessage) return zodMessage;

  const fromMessage = extractString(record.message);
  const fromData = extractString(record.data);

  if (
    status &&
    status >= 500 &&
    fromMessage &&
    /^internal server error$/i.test(fromMessage)
  ) {
    return getHttpErrorFallback(status);
  }

  if (fromMessage && fromMessage !== "Validation error") return fromMessage;
  if (fromData) return fromData;
  if (fromMessage) return fromMessage;

  if (Array.isArray(record.errors)) {
    const joined = record.errors
      .filter((entry): entry is string => typeof entry === "string")
      .join(" ");
    if (joined) return joined;
  }

  return resolvedFallback;
}

export function resolveApiError(
  response: { status: number; data: unknown },
  fallback: string,
): string {
  return getApiErrorMessage(response.data, fallback, response.status);
}

const ADMIN_FORBIDDEN_HINT =
  "Your admin account is not allowed to call this API. Ask the backend team to enable ADMIN on this route, or use an Internal Manager account.";

export function resolveAdminMutationError(
  response: { status: number; data: unknown },
  fallback: string,
): string {
  if (response.status === 403) {
    const base = resolveApiError(response, fallback);
    if (/not authorized|permission|forbidden/i.test(base)) {
      return ADMIN_FORBIDDEN_HINT;
    }
    return base;
  }

  if (response.status === 409) {
    return resolveApiError(
      response,
      "This user has linked bookings or records and cannot be removed.",
    );
  }

  if (response.status >= 500) {
    return resolveApiError(
      response,
      "Server error. The user may have linked records that block this action.",
    );
  }

  return resolveApiError(response, fallback);
}

export function getNetworkErrorMessage(
  error: unknown,
  fallback = "Cannot reach the server. Make sure the backend is running on port 4000.",
): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return getApiErrorMessage(
        error.response.data,
        fallback,
        error.response.status,
      );
    }

    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
  }

  return fallback;
}
