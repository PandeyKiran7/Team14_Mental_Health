import { getApiErrorMessage, isApiSuccess } from "@/helper/apiErrors";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiFormPatchCall, apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { resolveBlogCoverImageUrl } from "@/lib/blogCoverImage";

export function resolveProfileImageUrl(
  profileImageURL: string | null | undefined,
): string | null {
  const resolved = resolveBlogCoverImageUrl(profileImageURL);
  if (!resolved) return null;

  if (/\/default\.(jpg|jpeg|png)$/i.test(resolved)) {
    return null;
  }

  return resolved;
}

type ProfileImageUploadResult =
  | { ok: true; profileImageURL: string | null }
  | { ok: false; message: string; status?: number };

export async function uploadProfileImage(
  file: File,
  token?: string,
): Promise<ProfileImageUploadResult> {
  const formData = new FormData();
  formData.append("userProfile", file);

  try {
    const response = await apiFormPatchCall(
      "update_profile_image",
      formData,
      token ?? getAccessToken() ?? undefined,
    );

    if (!isApiSuccess(response.status)) {
      return {
        ok: false,
        message: getApiErrorMessage(
          response.data,
          "Failed to update profile image.",
          response.status,
        ),
        status: response.status,
      };
    }

    const fromEntity = extractApiEntity<{ profileImageURL?: string }>(
      response.data,
      "profileImageURL",
    );
    const profileImageURL = fromEntity?.profileImageURL ?? null;

    return { ok: true, profileImageURL };
  } catch {
    return { ok: false, message: "Cannot reach backend." };
  }
}

export type DoctorViewProfile = {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  profileImageURL?: string;
  doctor?: Record<string, unknown>;
};

type FetchDoctorProfileResult =
  | { ok: true; data: DoctorViewProfile }
  | { ok: false; message: string; status?: number };

export async function fetchDoctorViewProfile(
  userId: number,
  token?: string,
): Promise<FetchDoctorProfileResult> {
  try {
    const response = await apiGetCall({
      endpoint: "view_profile",
      pathParams: { userId },
      token: token ?? getAccessToken() ?? undefined,
    });

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

    const body = response.data as { message?: DoctorViewProfile; data?: DoctorViewProfile };
    const data = body.message ?? body.data;

    if (!data || typeof data !== "object") {
      return { ok: false, message: "Invalid doctor profile response." };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, message: "Cannot reach backend." };
  }
}
