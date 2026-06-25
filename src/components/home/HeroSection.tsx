"use client";

import Link from "next/link";
import { HeartbeatIcon, ShieldCheckIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { homeContent } from "@/constants/homeContent";

export default function HeroSection() {
  const { hero } = homeContent;

  return (
    <section id="hero" className="px-4 pb-4 pt-8 md:pt-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 px-8 py-16 text-white md:px-12 md:py-20">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute bottom-0 right-0 hidden h-48 w-48 rounded-tl-full bg-white/5 md:block" />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-teal-100">
              Team 14 · CT071-3-3-DDAC
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
              {hero.title}
            </h1>
            <p className="mt-3 text-lg font-medium text-teal-100 md:text-xl">
              {hero.tagline}
            </p>
            <p className="mt-4 max-w-xl text-base text-teal-50 md:text-lg lg:mx-0 mx-auto">
              {hero.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href={hero.getStartedHref}
                className="rounded-full bg-white px-8 py-3 font-semibold text-teal-800 transition hover:bg-teal-50"
              >
                Get Started
              </Link>
              <Link
                href={hero.loginHref}
                className="rounded-full border-2 border-white px-8 py-3 font-semibold transition hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: HeartbeatIcon,
                title: "For patients",
                text: "Track health data, book doctors, view prescriptions.",
              },
              {
                icon: UsersThreeIcon,
                title: "For doctors",
                text: "Sign in with your admin-provided account to approve bookings and manage patients.",
              },
              {
                icon: ShieldCheckIcon,
                title: "Secure platform",
                text: "Role-based access with encrypted cloud storage.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
              >
                <card.icon size={24} weight="duotone" className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">{card.title}</p>
                  <p className="mt-1 text-sm text-teal-100">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
