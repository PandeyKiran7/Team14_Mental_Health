"use client";

import Link from "next/link";
import { useState } from "react";
import ApiMessage from "@/components/ui/ApiMessage";
import { contactContent } from "@/constants/contactContent";

const subjectOptions = [
  "General enquiry",
  "Technical support",
  "Account help",
  "Appointment assistance",
  "Feedback",
];

export default function ContactForm() {
  const { form } = contactContent;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjectOptions[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSuccess(true);
      setSubmitting(false);
      setFullName("");
      setEmail("");
      setSubject(subjectOptions[0]);
      setMessage("");
    }, 400);
  }

  if (success) {
    return (
      <div className="space-y-4">
        <ApiMessage message={form.successMessage} variant="success" />
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="text-sm font-medium text-teal-700 hover:text-teal-800 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-zinc-700">
            {form.fields.fullName} *
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
            {form.fields.email} *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-zinc-700">
          {form.fields.subject} *
        </label>
        <select
          id="subject"
          name="subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        >
          {subjectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-zinc-700">
          {form.fields.message} *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe how we can help you…"
          className="w-full resize-y rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      <p className="text-xs text-zinc-500">
        By submitting, you agree to our{" "}
        <Link href="/privacy" className="text-teal-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      {error && <ApiMessage message={error} variant="error" />}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-teal-600 px-8 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {submitting ? "Sending…" : form.submitLabel}
      </button>
    </form>
  );
}
