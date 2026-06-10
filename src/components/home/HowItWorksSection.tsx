"use client";

import { CalendarCheck, ClipboardText, UserCircle } from "@phosphor-icons/react";
import SectionBand from "./SectionBand";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    icon: UserCircle,
    title: "Create your account",
    text: "Register as a patient or doctor and complete your profile.",
  },
  {
    icon: CalendarCheck,
    title: "Book & approve visits",
    text: "Patients book appointments; doctors approve and manage schedules.",
  },
  {
    icon: ClipboardText,
    title: "Care & prescriptions",
    text: "Doctors add prescriptions and recommendations; patients download PDFs.",
  },
];

export default function HowItWorksSection() {
  return (
    <SectionBand id="how-it-works">
      <SectionHeading
        title="How it works"
        subtitle="A simple flow from registration to ongoing diabetes care"
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="relative rounded-2xl border border-teal-100 bg-white p-6 shadow-sm"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
              {index + 1}
            </span>
            <step.icon size={28} weight="duotone" className="mt-4 text-teal-600" />
            <h3 className="mt-3 font-semibold text-teal-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{step.text}</p>
          </div>
        ))}
      </div>
    </SectionBand>
  );
}
