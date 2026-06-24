import { getApiErrorMessage, isApiSuccess } from "@/helper/apiErrors";
import { extractApiArray } from "@/helper/apiResponse";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { normalizeUsers, type AdminUser } from "@/types/admin";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status?: number };

function getToken(): string | undefined {
  return getAccessToken() ?? undefined;
}

/** GET /api/v1/doctors — active doctor user accounts (userId) */
export async function getAllDoctors(
  token?: string,
): Promise<ActionResult<AdminUser[]>> {
  const response = await apiGetCall({
    endpoint: "doctors",
    token: token ?? getToken(),
  });

  if (!isApiSuccess(response.status)) {
    return {
      ok: false,
      message: getApiErrorMessage(response.data, "Failed to load doctors.", response.status),
      status: response.status,
    };
  }

  return { ok: true, data: normalizeUsers(response.data) };
}

/** GET /api/v1/users — all users; filter doctors with role === "DOCTOR" */
export async function getAllUsers(
  token?: string,
): Promise<ActionResult<AdminUser[]>> {
  const response = await apiGetCall({
    endpoint: "users",
    token: token ?? getToken(),
  });

  if (!isApiSuccess(response.status)) {
    return {
      ok: false,
      message: getApiErrorMessage(response.data, "Failed to load users.", response.status),
      status: response.status,
    };
  }

  return { ok: true, data: normalizeUsers(response.data) };
}

export async function getDoctorUsersFromAllUsers(
  token?: string,
): Promise<ActionResult<AdminUser[]>> {
  const result = await getAllUsers(token);
  if (!result.ok) return result;

  return {
    ok: true,
    data: result.data.filter((user) => user.role?.toUpperCase() === "DOCTOR"),
  };
}
