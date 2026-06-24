import { getAllDoctors } from "@/lib/userApi";
import { getNetworkErrorMessage, isApiSuccess } from "@/helper/apiErrors";
import { extractApiArray } from "@/helper/apiResponse";
import { apiGetCall } from "@/helper/apiService";
import { normalizeBookings } from "@/types/booking";

export type BookableDoctor = {
  /** Doctor account user id (display + reference) */
  userId: number;
  /** Doctor profile id for POST /book-appointment/:doctorId when available */
  bookingDoctorId: number;
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

function readDoctorProfileId(raw: Record<string, unknown>): number | null {
  const doctor = raw.doctor;
  if (doctor && typeof doctor === "object" && doctor !== null && "id" in doctor) {
    const id = (doctor as { id: unknown }).id;
    if (typeof id === "number" && id > 0) return id;
  }
  return null;
}

export async function loadBookableDoctors(
  token: string,
): Promise<{ doctors: BookableDoctor[]; error: string | null }> {
  try {
    const [doctorsResult, doctorsResponse, bookingsResponse] = await Promise.all([
      getAllDoctors(token),
      apiGetCall({ endpoint: "doctors", token }),
      apiGetCall({ endpoint: "bookings", token }),
    ]);

    if (!doctorsResult.ok) {
      return {
        doctors: [],
        error: doctorsResult.message,
      };
    }

    const profileIdByUserId = new Map<number, number>();
    const profileIdByName = new Map<string, number>();

    if (isApiSuccess(doctorsResponse.status)) {
      for (const raw of extractApiArray<Record<string, unknown>>(doctorsResponse.data)) {
        const userId = typeof raw.userId === "number" ? raw.userId : null;
        const profileId = readDoctorProfileId(raw);
        if (userId && profileId) {
          profileIdByUserId.set(userId, profileId);
        }
      }
    }

    if (isApiSuccess(bookingsResponse.status)) {
      for (const booking of normalizeBookings(bookingsResponse.data)) {
        if (booking.doctor.id > 0) {
          profileIdByName.set(normalizeDoctorName(booking.doctor.name), booking.doctor.id);
        }
      }
    }

    const options = new Map<number, BookableDoctor>();

    for (const user of doctorsResult.data) {
      if (!user || user.isActive !== "ACTIVE") continue;

      const name = displayDoctorName(user.firstName, user.lastName);
      const bookingDoctorId =
        profileIdByUserId.get(user.userId) ??
        profileIdByName.get(normalizeDoctorName(name)) ??
        user.userId;

      options.set(user.userId, {
        userId: user.userId,
        bookingDoctorId,
        name,
        specialization: undefined,
      });
    }

    if (isApiSuccess(bookingsResponse.status)) {
      for (const booking of normalizeBookings(bookingsResponse.data)) {
        for (const doctor of options.values()) {
          if (normalizeDoctorName(doctor.name) === normalizeDoctorName(booking.doctor.name)) {
            doctor.specialization = booking.doctor.specialization;
            if (booking.doctor.id > 0) {
              doctor.bookingDoctorId = booking.doctor.id;
            }
          }
        }
      }
    }

    const doctors = [...options.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    console.group("[Team14] Doctor dropdown — loadBookableDoctors");
    console.log("GET /api/v1/doctors status:", doctorsResponse.status);
    console.log(
      "Raw doctors API (first item sample):",
      extractApiArray<Record<string, unknown>>(doctorsResponse.data)[0] ?? "empty",
    );
    console.log(
      "Normalized doctors from getAllDoctors:",
      doctorsResult.data.map((d) => ({
        userId: d.userId,
        name: `${d.firstName} ${d.lastName}`,
        email: d.email,
        isActive: d.isActive,
        role: d.role,
      })),
    );
    console.log(
      "Profile id map (userId → doctor profile id):",
      Object.fromEntries(profileIdByUserId),
    );
    console.log(
      "Profile id from bookings (name → doctor profile id):",
      Object.fromEntries(profileIdByName),
    );
    console.log(
      "Dropdown options (what appears in <select>):",
      doctors.map((d) => ({
        label: `${d.name} (User ID: ${d.userId})`,
        value: String(d.userId),
        userId: d.userId,
        bookingDoctorId: d.bookingDoctorId,
        specialization: d.specialization ?? null,
      })),
    );
    if (doctors.length === 0) {
      console.warn("Dropdown is empty — no ACTIVE doctors returned.");
    }
    console.groupEnd();

    if (doctors.length === 0) {
      return {
        doctors: [],
        error: "No active doctors are available to book yet.",
      };
    }

    return { doctors, error: null };
  } catch (error) {
    return {
      doctors: [],
      error: getNetworkErrorMessage(error),
    };
  }
}
