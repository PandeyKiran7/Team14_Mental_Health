"use client"

import Link from "next/link";
import { 
  SmileyIcon,
  CalendarCheckIcon,
  BookOpenIcon,
  ChartLineUpIcon,
  ShieldCheckIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  HeartbeatIcon,
  ChatCircleTextIcon,
  VideoConferenceIcon
} from "@phosphor-icons/react";

export default function HomePage() {
  const features = [
    {
      icon: SmileyIcon,
      title: "Mood tracking",
      text: "Log daily mood and view personalized trends over time.",
      color: "text-amber-500"
    },
    {
      icon: CalendarCheckIcon,
      title: "Appointments",
      text: "Book sessions with licensed counselors instantly.",
      color: "text-emerald-500"
    },
    {
      icon: BookOpenIcon,
      title: "Resources",
      text: "Articles, videos, and self-help tools curated by experts.",
      color: "text-sky-500"
    },
    {
      icon: ChartLineUpIcon,
      title: "Progress insights",
      text: "Track your mental wellness journey with detailed analytics.",
      color: "text-purple-500"
    },
    {
      icon: ShieldCheckIcon,
      title: "Private & secure",
      text: "Your data is encrypted and never shared with third parties.",
      color: "text-teal-500"
    },
    {
      icon: HeartbeatIcon,
      title: "Wellness plans",
      text: "Personalized daily exercises and mindfulness practices.",
      color: "text-rose-500"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active users", icon: UsersIcon },
    { value: "500+", label: "Certified counselors", icon: ChatCircleTextIcon },
    { value: "24/7", label: "Support availability", icon: ClockIcon },
    { value: "4.9", label: "Average rating", icon: StarIcon }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular user",
      content: "This app changed my life. The mood tracking helped me understand my triggers and patterns.",
      rating: 5,
      initial: "SJ"
    },
    {
      name: "Michael Chen",
      role: "User for 6 months",
      content: "Easy to use, great counselors, and the resources are top-notch. Highly recommended!",
      rating: 5,
      initial: "MC"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Clinical psychologist",
      content: "As a professional, I appreciate the evidence-based approach and the secure platform.",
      rating: 5,
      initial: "ER"
    }
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-16 text-white">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-100">
          Team 14 · Mental Health Cloud App
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          Your wellness journey starts here
        </h1>
        <p className="mt-4 max-w-xl text-lg text-teal-50">
          Track mood, book counselors, and access mental health resources.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="rounded-full bg-white px-6 py-3 font-semibold text-teal-800 hover:bg-teal-50"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white px-6 py-3 font-semibold hover:bg-teal-700"
          >
            Login
          </Link>
        </div>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          { title: "Mood tracking", text: "Log daily mood and view trends." },
          { title: "Appointments", text: "Book sessions with counselors." },
          { title: "Resources", text: "Articles, videos, and self-help tools." },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-teal-100 p-6">
            <h2 className="font-semibold text-teal-800">{card.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}