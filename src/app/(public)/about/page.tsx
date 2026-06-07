"use client"

import Link from "next/link";
import { 
  LockIcon,
  StethoscopeIcon,
  HandHeartIcon,
  UsersIcon,
  ArrowRightIcon
} from "@phosphor-icons/react";

const teamMembers = [
  {
    name: "Dr. Aisha Patel",
    role: "Chief Medical Officer",
    bio: "Endocrinologist with 15+ years specializing in Type 1 and Type 2 diabetes care.",
    initials: "AP",
  },
  {
    name: "Marcus Chen",
    role: "Lead Engineer",
    bio: "Healthcare software architect focused on secure, HIPAA-compliant cloud systems.",
    initials: "MC",
  },
  {
    name: "Sara Ndlovu",
    role: "Patient Experience Lead",
    bio: "Lives with T1D and channels lived experience into intuitive product design.",
    initials: "SN",
  },
  {
    name: "James Okafor",
    role: "Data & AI Research",
    bio: "Builds predictive models that surface glucose trends before they become emergencies.",
    initials: "JO",
  },
];

const stats = [
  { value: "12,000+", label: "Active patients" },
  { value: "98%", label: "Uptime SLA" },
  { value: "4 min", label: "Average support response" },
  { value: "35%", label: "Average HbA1c improvement" },
];

const values = [
  {
    icon: LockIcon,
    title: "Privacy first",
    text: "Your health data belongs to you. We are HIPAA-compliant and never sell patient data.",
  },
  {
    icon: StethoscopeIcon,
    title: "Clinically grounded",
    text: "Every algorithm and recommendation is validated against peer-reviewed diabetes research.",
  },
  {
    icon: HandHeartIcon,
    title: "Accessible to all",
    text: "Designed for all literacy levels, languages, and assistive technologies from day one.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-16 text-white">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-100">
          Team 14 · Diabetes Management System
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          Built by clinicians, engineers, and patients — together.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-teal-50">
          We exist to make daily diabetes self-management simpler, smarter, and
          less stressful so people can focus on living, not just managing.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="rounded-full bg-white px-6 py-3 font-semibold text-teal-800 hover:bg-teal-50"
          >
            Get started
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white px-6 py-3 font-semibold hover:bg-teal-700"
          >
            Contact us
          </Link>
        </div>
      </div>

      {/* Mission */}
      <div className="mt-16 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-teal-800">Our mission</h2>
          <p className="mt-4 text-zinc-600 leading-relaxed">
            Diabetes demands constant attention — glucose readings, medication
            schedules, dietary choices, and medical appointments. Our platform
            consolidates every touchpoint into one secure, cloud-based home so
            patients and their care teams always have the full picture.
          </p>
          <p className="mt-4 text-zinc-600 leading-relaxed">
            We partner with certified diabetes educators, primary care
            physicians, and endocrinologists to ensure every feature reflects
            clinical best practice — not just technical convenience.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-teal-100 bg-teal-50 p-6"
            >
              <p className="text-3xl font-bold text-teal-700">{s.value}</p>
              <p className="mt-1 text-sm text-zinc-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-teal-800">What we stand for</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-teal-100 p-6">
              <Icon size={28} weight="duotone" className="text-teal-600" />
              <h3 className="mt-3 font-semibold text-teal-800">{title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-teal-800">Meet the team</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-teal-100 p-6 flex flex-col items-start"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {m.initials}
              </div>
              <h3 className="mt-4 font-semibold text-teal-800">{m.name}</h3>
              <p className="text-xs font-medium uppercase tracking-wide text-teal-500">
                {m.role}
              </p>
              <p className="mt-2 text-sm text-zinc-600">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA strip */}
      <div className="mt-16 flex flex-col items-center rounded-2xl bg-teal-50 border border-teal-100 px-8 py-10 text-center">
        <UsersIcon size={36} weight="duotone" className="text-teal-600" />
        <h2 className="mt-4 text-2xl font-bold text-teal-800">
          Ready to take control of your diabetes?
        </h2>
        <p className="mt-3 max-w-md text-zinc-600">
          Join thousands of patients who track smarter and connect with their
          care team in one place.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800"
        >
          Create a free account
          <ArrowRightIcon size={16} weight="bold" />
        </Link>
      </div>
    </section>
  );
}