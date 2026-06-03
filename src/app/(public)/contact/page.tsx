"use client";

import { useState } from "react";
import Link from "next/link";
import { EnvelopeIcon, PhoneIcon, ChatCircleIcon, HospitalIcon, MapPinIcon, ClockIcon, ShareNetworkIcon } from "@phosphor-icons/react";

const contactOptions = [
  {
    icon: EnvelopeIcon,
    title: "Email support",
    detail: "support@diabetescloud.com",
    note: "Response within 4 hours",
  },
  {
    icon: PhoneIcon,
    title: "PhoneIcon helpline",
    detail: "+1 (800) 555-0198",
    note: "Mon – Fri, 8 am – 8 pm EST",
  },
  {
    icon: ChatCircleIcon,
    title: "Live chat",
    detail: "Available in-app",
    note: "Average wait: 2 minutes",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Replace with your actual form submission logic
    setSubmitted(true);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-16 text-white">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-100">
          Team 14 · Diabetes Management System
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          We're here whenever you need us.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-teal-50">
          Questions about your account, clinical guidance, or partnership
          opportunities — reach out and a real person will get back to you.
        </p>
      </div>

      {/* Contact channels */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {contactOptions.map((c) => (
          <div key={c.title} className="rounded-xl border border-teal-100 p-6">
            <c.icon size={32} weight="duotone" className="text-teal-600" />
            <h3 className="mt-3 font-semibold text-teal-800">{c.title}</h3>
            <p className="mt-1 font-medium text-zinc-800">{c.detail}</p>
            <p className="mt-1 text-sm text-zinc-500">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Main content: form + info */}
      <div className="mt-16 grid gap-12 lg:grid-cols-5">

        {/* Form — takes 3 cols */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-teal-800">Send us a message</h2>
          <p className="mt-2 text-sm text-zinc-500">
            All fields marked * are required.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-xl bg-teal-50 border border-teal-200 p-8 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-teal-100 p-3">
                  <EnvelopeIcon size={32} weight="duotone" className="text-teal-600" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-teal-800">
                Message received!
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                Thanks, {form.name}. We'll reply to{" "}
                <span className="font-medium">{form.email}</span> within 4 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", subject: "general", message: "" });
                }}
                className="mt-6 rounded-full border border-teal-600 px-6 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Full name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Email address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="general">General enquiry</option>
                  <option value="technical">Technical support</option>
                  <option value="clinical">Clinical / medical question</option>
                  <option value="billing">Billing & account</option>
                  <option value="partnership">Partnership / research</option>
                  <option value="feedback">Feedback & suggestions</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe how we can help you…"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
                />
              </div>

              <p className="text-xs text-zinc-400">
                By submitting, you agree to our{" "}
                <Link href="/privacy" className="text-teal-600 hover:underline">
                  Privacy Policy
                </Link>
                . We never share your information with third parties.
              </p>

              <button
                type="submit"
                className="rounded-full bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800 transition-colors"
              >
                Send message
              </button>
            </form>
          )}
        </div>

        {/* Sidebar info — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-teal-100 p-6">
            <div className="flex items-center gap-2">
              <HospitalIcon size={24} weight="duotone" className="text-teal-600" />
              <h3 className="font-semibold text-teal-800">Clinical emergencies</h3>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              If you are experiencing a medical emergency or a severe
              hypoglycaemic episode, call{" "}
              <span className="font-bold text-zinc-800">911</span> or your
              local emergency services immediately. Do not rely on this form.
            </p>
          </div>

          <div className="rounded-xl border border-teal-100 p-6">
            <div className="flex items-center gap-2">
              <MapPinIcon size={24} weight="duotone" className="text-teal-600" />
              <h3 className="font-semibold text-teal-800">Office</h3>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              123 Wellness Boulevard, Suite 400
              <br />
              Boston, MA 02101
              <br />
              United States
            </p>
          </div>

          <div className="rounded-xl border border-teal-100 p-6">
            <div className="flex items-center gap-2">
              <ClockIcon size={24} weight="duotone" className="text-teal-600" />
              <h3 className="font-semibold text-teal-800">Support hours</h3>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600">
              <li className="flex justify-between">
                <span>Mon – Fri</span>
                <span className="font-medium">8 am – 8 pm EST</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="font-medium">10 am – 4 pm EST</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="font-medium text-zinc-400">Closed</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-teal-100 p-6">
            <div className="flex items-center gap-2">
              <ShareNetworkIcon size={24} weight="duotone" className="text-teal-600" />
              <h3 className="font-semibold text-teal-800">Also find us on</h3>
            </div>
            <div className="mt-3 flex gap-3 flex-wrap">
              {["Twitter / X", "LinkedIn", "Facebook"].map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 border border-teal-100"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}