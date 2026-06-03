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
      {/* Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-16 text-white">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-100">
          Team 14 · Mental Health Cloud App
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          Your wellness journey starts here
        </h1>
        <p className="mt-4 max-w-xl text-lg text-teal-50">
          Track mood, book counselors, and access mental health resources — all in one secure platform.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-teal-800 hover:bg-teal-50 transition-colors"
          >
            Get started
            <ArrowRightIcon size={18} weight="bold" />
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white px-6 py-3 font-semibold hover:bg-teal-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-teal-100 bg-teal-50 p-6 text-center">
            <stat.icon size={32} weight="duotone" className="mx-auto text-teal-600" />
            <p className="mt-3 text-2xl font-bold text-teal-700">{stat.value}</p>
            <p className="mt-1 text-sm text-zinc-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="mt-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-teal-800">Everything you need in one place</h2>
          <p className="mt-3 text-zinc-600 max-w-2xl mx-auto">
            Comprehensive tools designed to support your mental wellness journey
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group rounded-xl border border-teal-100 p-6 hover:shadow-lg transition-all hover:border-teal-300">
              <feature.icon size={40} weight="duotone" className={feature.color} />
              <h3 className="mt-4 text-lg font-semibold text-teal-800">{feature.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mt-16 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-100 px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-teal-800">Loved by thousands</h2>
          <p className="mt-3 text-zinc-600">See what our community is saying</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} size={16} weight="fill" className="text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">"{testimonial.content}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                  {testimonial.initial}
                </div>
                <div>
                  <p className="font-semibold text-teal-800">{testimonial.name}</p>
                  <p className="text-xs text-zinc-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-teal-800">Simple steps to better wellness</h2>
          <p className="mt-3 text-zinc-600">Start your journey in minutes</p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { step: "01", title: "Create account", text: "Sign up for free and set up your profile", icon: UsersIcon },
            { step: "02", title: "Track mood", text: "Log your daily emotional state", icon: SmileyIcon },
            { step: "03", title: "Get support", text: "Connect with counselors or access resources", icon: VideoConferenceIcon }
          ].map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-700">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-teal-800">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 rounded-2xl bg-teal-700 px-8 py-12 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to prioritize your mental health?</h2>
        <p className="mt-3 text-teal-100 max-w-md mx-auto">
          Join thousands of others who have taken the first step toward better wellness.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
        >
          Start your free trial
          <ArrowRightIcon size={18} weight="bold" />
        </Link>
        <p className="mt-4 text-xs text-teal-200">No credit card required · Cancel anytime</p>
      </div>
    </section>
  );
}