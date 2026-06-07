"use client";

import { useState } from "react";
import { apiGetCall } from "@/helper/apiService";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { API_BASE_URL } from "@/helper/apiList";

export default function BackendStatus() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function testConnection() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await apiGetCall({ endpoint: "health" });

      if (response?.status === API_CONSTANTS.success) {
        const data = response.data as { message?: string };
        setMessage(`Connected (via proxy → localhost:4000) — ${data.message ?? "OK"}`);
      } else {
        setMessage("Backend returned an error. Check terminal logs.");
      }
    } catch {
      setMessage(
        `Cannot reach backend at ${API_BASE_URL}. Start it with: cd Diabetes_Health_Application_Group14 → npm run dev`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-teal-200 bg-teal-50 p-6">
      <h2 className="font-semibold text-teal-800">Backend connection test</h2>
      <p className="mt-1 text-sm text-zinc-600">
        API base: <code className="rounded bg-white px-1">{API_BASE_URL || "same origin (proxy → :4000)"}</code>
      </p>
      <button
        type="button"
        onClick={testConnection}
        disabled={loading}
        className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {loading ? "Testing…" : "Test backend connection"}
      </button>
      {message && (
        <p
          className={`mt-3 text-sm ${message.startsWith("Connected") ? "text-green-700" : "text-red-600"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
