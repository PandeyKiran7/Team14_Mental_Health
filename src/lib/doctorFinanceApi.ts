import { isApiSuccess, resolveAdminMutationError } from "@/helper/apiErrors";
import { apiPostCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import {
  normalizeDoctorFinanceDetails,
  normalizePayoutResult,
  type DoctorFinanceDetails,
  type PayoutResult,
} from "@/types/doctorFinance";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status?: number };

function getToken(): string | undefined {
  return getAccessToken() ?? undefined;
}

/** POST /api/v1/doctor-finance-details/:doctorId — doctor user id in URL */
export async function fetchDoctorFinanceDetails(
  doctorUserId: number,
): Promise<ActionResult<DoctorFinanceDetails>> {
  try {
    const response = await apiPostCall({  
      endpoint: "doctor_finance_details",
      pathParams: { doctorId: doctorUserId },
      token: getToken(),
    });

    if (response.status === 404) {
      return { ok: false, message: "No payment data found for this doctor.", status: 404 };
    }

    if (!isApiSuccess(response.status)) {
      return {
        ok: false,
        message: resolveAdminMutationError(
          response,
          "Failed to load doctor finance details.",
        ),
        status: response.status,
      };
    }

    const data = normalizeDoctorFinanceDetails(response.data);
    if (!data) {
      return { ok: false, message: "Invalid finance details response." };
    }

    if (process.env.NODE_ENV === "development") {
      console.info(
        `[Team14] POST /api/v1/doctor-finance-details/${doctorUserId}`,
        data,
      );
    }

    return { ok: true, data };
  } catch {
    return { ok: false, message: "Cannot reach backend." };
  }
}

/** POST /api/v1/payout/:userId — doctor user id */
export async function payDoctorSalary(
  doctorUserId: number,
): Promise<ActionResult<PayoutResult>> {
  try {
    const response = await apiPostCall({
      endpoint: "pay_salary",
      pathParams: { userId: doctorUserId },
      token: getToken(),
    });

    if (!isApiSuccess(response.status)) {
      return {
        ok: false,
        message: resolveAdminMutationError(response, "Failed to process payout."),
        status: response.status,
      };
    }

    const data = normalizePayoutResult(response.data);
    if (!data) {
      return { ok: false, message: "Invalid payout response." };
    }

    if (process.env.NODE_ENV === "development") {
      console.info(`[Team14] POST /api/v1/payout/${doctorUserId}`, data);
    }

    return { ok: true, data };
  } catch {
    return { ok: false, message: "Cannot reach backend." };
  }
}
