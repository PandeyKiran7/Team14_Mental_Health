import { getAllDoctors } from "@/lib/userApi";
import { getNetworkErrorMessage, isApiSuccess } from "@/helper/apiErrors";
import { extractApiArray } from "@/helper/apiResponse";
import { apiGetCall } from "@/helper/apiService";
import { normalizeBookings } from "@/types/booking";

export type BookableDoctor = {
  userId: number;
  /** Doctor profile id for POST /book-appointment/:doctorId */
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

  const directId = raw.doctorProfileId ?? raw.profileId;
  if (typeof directId === "number" && directId > 0) return directId;

  return null;
}

function assignSequentialProfileIds(
  doctors: { userId: number }[],
  profileIdByUserId: Map<number, number>,
) {
  const unmapped = doctors
    .filter((doctor) => !profileIdByUserId.has(doctor.userId))
    .sort((a, b) => a.userId - b.userId);

  const usedIds = new Set(profileIdByUserId.values());
  let nextId = 1;

  for (const doctor of unmapped) {
    while (usedIds.has(nextId)) nextId += 1;
    profileIdByUserId.set(doctor.userId, nextId);
    usedIds.add(nextId);
    nextId += 1;
  }
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

    const activeDoctors = doctorsResult.data.filter((user) => user.isActive === "ACTIVE");

    for (const user of activeDoctors) {
      const name = displayDoctorName(user.firstName, user.lastName);
      const fromName = profileIdByName.get(normalizeDoctorName(name));
      if (fromName && !profileIdByUserId.has(user.userId)) {
        profileIdByUserId.set(user.userId, fromName);
      }
    }

    assignSequentialProfileIds(activeDoctors, profileIdByUserId);

    const options = new Map<number, BookableDoctor>();

    for (const user of activeDoctors) {
      const name = displayDoctorName(user.firstName, user.lastName);
      const bookingDoctorId = profileIdByUserId.get(user.userId);

      if (!bookingDoctorId) continue;

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
              profileIdByUserId.set(doctor.userId, booking.doctor.id);
            }
          }
        }
      }
    }

    const doctors = [...options.values()].sort((a, b) => a.name.localeCompare(b.name));

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
