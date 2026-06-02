import { CheckCircle2, Cloud, MessageCircle, Shield } from "lucide-react";
import { homeContent } from "@/constants/homeContent";
import SectionBand from "./SectionBand";
import SectionHeading from "./SectionHeading";

const benefitIcons = [CheckCircle2, Shield, MessageCircle, Cloud];

export default function BenefitsSection() {
  const { benefits } = homeContent;

  return (
    <SectionBand id={benefits.id} alt>
      <SectionHeading title={benefits.title} />
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {benefits.items.map((benefit, index) => {
          const Icon = benefitIcons[index] ?? CheckCircle2;
          return (
            <div
              key={benefit}
              className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-white p-6 shadow-md"
            >
              <Icon className="h-9 w-9 shrink-0 text-teal-600" aria-hidden />
              <p className="font-medium text-teal-900">{benefit}</p>
            </div>
          );
        })}
      </div>
    </SectionBand>
  );
}
