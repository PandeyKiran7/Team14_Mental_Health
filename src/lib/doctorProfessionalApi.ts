import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage, isApiSuccess } from "@/helper/apiErrors";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiGetCall, apiPatchCall, apiPostCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import type { AddDoctorProfessionalProfilePayload, DoctorProfessionalDetails } from "@/types/doctorProfessional";

export type DoctorProfessionalFetchResult =
  | { ok: true; data: DoctorProfessionalDetails | null }
  | { ok: false; message: string; status?: number };

export function normalizeDoctorProfessionalDetails(
  body: unknown,
): DoctorProfessionalDetails | null {
  const fromLicense = extractApiEntity<DoctorProfessionalDetails>(body, "licenseNumber");
  if (fromLicense) return fromLicense;

  const fromId = extractApiEntity<DoctorProfessionalDetails & { id?: number }>(body, "id");
  if (fromId?.licenseNumber) return fromId;

  if (body && typeof body === "object" && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;
    if (typeof record.licenseNumber === "string" && record.licenseNumber.trim()) {
      return record as DoctorProfessionalDetails;
    }
  }

  return null;
}

function getToken(token?: string): string | undefined {
  return token ?? getAccessToken() ?? undefined;
}

function tokenKey(token?: string): string {
  return getToken(token) ?? "";
}

const inflight = new Map<string, Promise<DoctorProfessionalFetchResult>>();
let cached: { key: string; result: DoctorProfessionalFetchResult } | null = null;

export function invalidateDoctorProfessionalCache() {
  cached = null;
  inflight.clear();
}

export function getCachedDoctorProfessionalDetails(
  token?: string,
): DoctorProfessionalFetchResult | null {
  const key = tokenKey(token);
  if (!key || !cached || cached.key !== key) return null;
  return cached.result;
}

async function requestDoctorProfessionalDetails(
  token?: string,
): Promise<DoctorProfessionalFetchResult> {
  try {
    const response = await apiGetCall({
      endpoint: "doctor_data",
      token: getToken(token),
    });

    if (response.status === 404) {
      return { ok: true, data: null };
    }

    if (!isApiSuccess(response.status)) {
      return {
        ok: false,
        message: getApiErrorMessage(
          response.data,
          "Failed to load doctor profile.",
          response.status,
        ),
        status: response.status,
      };
    }

    return {
      ok: true,
      data: normalizeDoctorProfessionalDetails(response.data),
    };
  } catch {
    return { ok: false, message: "Cannot reach backend." };
  }
}

export async function fetchDoctorProfessionalDetailsById(
  doctorId: number,
  token?: string,
): Promise<DoctorProfessionalFetchResult> {
  try {
    const response = await apiGetCall({
      endpoint: "doctor_data_by_id",
      pathParams: { doctorId },
      token: getToken(token),
    });

    if (response.status === 404) {
      return { ok: true, data: null };
    }

    if (!isApiSuccess(response.status)) {
      return {
        ok: false,
        message: getApiErrorMessage(
          response.data,
          "Failed to load doctor profile.",
          response.status,
        ),
        status: response.status,
      };
    }

    return {
      ok: true,
      data: normalizeDoctorProfessionalDetails(response.data),
    };
  } catch {
    return { ok: false, message: "Cannot reach backend." };
  }
}

export async function fetchDoctorProfessionalDetails(
  token?: string,
): Promise<DoctorProfessionalFetchResult> {
  const key = tokenKey(token);

  if (key && cached?.key === key) {
    return cached.result;
  }

  const existing = inflight.get(key);
  if (existing) {
    return existing;
  }

  const request = requestDoctorProfessionalDetails(token).then((result) => {
    if (key) {
      cached = { key, result };
    }
    inflight.delete(key);
    return result;
  });

  inflight.set(key, request);
  return request;
}

export async function saveDoctorProfessionalDetails(
  payload: AddDoctorProfessionalProfilePayload,
  options?: { create?: boolean; token?: string },
): Promise<
  | { ok: true; status: number }
  | { ok: false; message: string; status?: number }
> {
  const token = getToken(options?.token);
  const create = options?.create ?? false;

  const patch = () =>
    apiPatchCall({
      endpoint: "doctor_data",
      token,
      ...payload,
    });

  const post = () =>
    apiPostCall({
      endpoint: "doctor_data",
      token,
      ...payload,
    });

  try {
    let response = create ? await post() : await patch();

    if (
      create &&
      response.status === 400 &&
      getApiErrorMessage(response.data, "", response.status)
        .toLowerCase()
        .includes("already exists")
    ) {
      response = await patch();
    }

    const ok =
      response.status === API_CONSTANTS.success || response.status === 201;

    if (!ok) {
      return {
        ok: false,
        message: getApiErrorMessage(
          response.data,
          "Failed to save doctor profile.",
          response.status,
        ),
        status: response.status,
      };
    }

    invalidateDoctorProfessionalCache();
    return { ok: true, status: response.status };
  } catch {
    return { ok: false, message: "Cannot reach backend." };
  }
}
