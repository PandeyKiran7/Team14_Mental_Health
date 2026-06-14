import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveApiError,
} from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { normalizeUsers } from "@/types/admin";
import { normalizeBookings } from "@/types/booking";

export type BookableDoctor = {
  profileId: number;
  name: string;
  specialization?: string;
};

function normalizeDoctorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^dr\.\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function displayDoctorName(firstName: string, lastName: string): string {
  return `Dr. ${firstName} ${lastName}`.trim();
}

export async function loadBookableDoctors(
  token: string,
): Promise<{ doctors: BookableDoctor[]; error: string | null }> {
  try {
    const [doctorsResponse, bookingsResponse] = await Promise.all([
      apiGetCall({ endpoint: "doctors", token }),
      apiGetCall({ endpoint: "bookings", token }),
    ]);

    if (!isApiSuccess(doctorsResponse.status)) {
      return {
        doctors: [],
        error: resolveApiError(doctorsResponse, "Failed to load doctors."),
      };
    }

    const profileByName = new Map<string, BookableDoctor>();

    if (isApiSuccess(bookingsResponse.status)) {
      for (const booking of normalizeBookings(bookingsResponse.data)) {
        const key = normalizeDoctorName(booking.doctor.name);
        profileByName.set(key, {
          profileId: booking.doctor.id,
          name: booking.doctor.name,
          specialization: booking.doctor.specialization,
        });
      }
    }

    const options = new Map<number, BookableDoctor>();

    for (const user of normalizeUsers(doctorsResponse.data)) {
      const name = displayDoctorName(user.firstName, user.lastName);
      const matched = profileByName.get(normalizeDoctorName(name));

      const option: BookableDoctor = matched ?? {
        profileId: user.userId,
        name,
      };

      options.set(option.profileId, option);
    }

    for (const doctor of profileByName.values()) {
      if (!options.has(doctor.profileId)) {
        options.set(doctor.profileId, doctor);
      }
    }

    const doctors = [...options.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return { doctors, error: null };
  } catch (error) {
    return {
      doctors: [],
      error: getNetworkErrorMessage(error),
    };
  }
}
