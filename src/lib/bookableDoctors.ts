import { getAllDoctors } from "@/lib/userApi";
import { getNetworkErrorMessage } from "@/helper/apiErrors";

export type BookableDoctor = {
  userId: number;
  bookingDoctorId: number; 
  name: string;
  specialization?: string;
};

export async function loadBookableDoctors(
  token: string,
): Promise<{ doctors: BookableDoctor[]; error: string | null }> {
  try {
    const doctorsResult = await getAllDoctors(token);

    if (!doctorsResult.ok) {
      return {
        doctors: [],
        error: doctorsResult.message || "Failed to fetch doctors.",
      };
    }

    const activeDoctors = doctorsResult.data.filter(
      (user) => user.isActive === "ACTIVE"
    );

    if (activeDoctors.length === 0) {
      return {
        doctors: [],
        error: "No active doctors are available to book yet.",
      };
    }

    const doctors: BookableDoctor[] = activeDoctors.map((user) => ({
      userId: user.userId,
      bookingDoctorId: user.userId, 
      name: `Dr. ${user.firstName} ${user.lastName}`.trim(),
      specialization: undefined,
    }));

    doctors.sort((a, b) => a.name.localeCompare(b.name));

    return { doctors, error: null };
  } catch (error) {
    return {
      doctors: [],
      error: getNetworkErrorMessage(error),
    };
  }
}