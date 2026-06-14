import type { jsPDF } from "jspdf";
import type { Prescription } from "@/types/prescription";
import type { Recommendation } from "@/types/recommendation";
import { saveBlobAsFile } from "@/lib/downloadBlob";

const PAGE_WIDTH = 180;
const MARGIN = 14;

async function createPdfDocument() {
  const { jsPDF } = await import("jspdf");
  return new jsPDF();
}

function addWrappedText(doc: jsPDF, text: string, x: number, y: number): number {
  const lines = doc.splitTextToSize(text, PAGE_WIDTH);
  doc.text(lines, x, y);
  return y + lines.length * 7;
}

function ensureSpace(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 280) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

export async function downloadPrescriptionPdf(
  bookingId: number,
  prescription: Prescription,
) {
  const doc = await createPdfDocument();
  let y = MARGIN;

  doc.setFontSize(16);
  doc.text("Prescription", MARGIN, y);
  y += 10;

  doc.setFontSize(11);
  y = addWrappedText(doc, `Booking #${bookingId}`, MARGIN, y) + 6;

  prescription.medicines.forEach((med, index) => {
    y = ensureSpace(doc, y);
    y =
      addWrappedText(
        doc,
        `${index + 1}. ${med.name} — ${med.dose}, ${med.frequency}, ${med.duration}`,
        MARGIN,
        y,
      ) + 4;
  });

  if (prescription.dosageInstructions) {
    y = ensureSpace(doc, y);
    y = addWrappedText(doc, `Instructions: ${prescription.dosageInstructions}`, MARGIN, y) + 4;
  }

  if (prescription.notes) {
    y = ensureSpace(doc, y);
    addWrappedText(doc, `Notes: ${prescription.notes}`, MARGIN, y);
  }

  saveBlobAsFile(doc.output("blob"), `prescription-${bookingId}.pdf`);
}

export async function downloadRecommendationPdf(
  bookingId: number,
  recommendation: Recommendation,
) {
  const doc = await createPdfDocument();
  let y = MARGIN;

  doc.setFontSize(16);
  doc.text("Recommendation", MARGIN, y);
  y += 10;

  doc.setFontSize(11);
  y = addWrappedText(doc, `Booking #${bookingId}`, MARGIN, y) + 6;
  y = ensureSpace(doc, y);
  y = addWrappedText(doc, recommendation.advice, MARGIN, y) + 6;

  if (recommendation.lifestyleChanges) {
    y = ensureSpace(doc, y);
    y = addWrappedText(doc, `Lifestyle: ${recommendation.lifestyleChanges}`, MARGIN, y) + 6;
  }

  const diet = recommendation.dietPlan;
  if (diet) {
    const items = [
      diet.breakfast?.length ? `Breakfast: ${diet.breakfast.join(", ")}` : null,
      diet.lunch?.length ? `Lunch: ${diet.lunch.join(", ")}` : null,
      diet.dinner?.length ? `Dinner: ${diet.dinner.join(", ")}` : null,
    ].filter(Boolean) as string[];

    for (const item of items) {
      y = ensureSpace(doc, y);
      y = addWrappedText(doc, item, MARGIN, y) + 4;
    }
  }

  saveBlobAsFile(doc.output("blob"), `recommendation-${bookingId}.pdf`);
}
