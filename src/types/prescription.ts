import { extractApiEntity } from "@/helper/apiResponse";

export type Medicine = {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
};

export type Prescription = {
  prescriptionId: number;
  medicines: Medicine[];
  dosageInstructions?: string | null;
  notes?: string | null;
  createdAt?: string;
};

export function normalizePrescription(body: unknown): Prescription | null {
  return extractApiEntity<Prescription>(body, "prescriptionId");
}
