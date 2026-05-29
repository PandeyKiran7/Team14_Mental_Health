"use client";

import { useState } from "react";
import { apiGetCall } from "@/helper/apiService";
import { API_CONSTANTS } from "@/constants/staticConstant";

export default function BackendStatus() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function testConnection() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await apiGetCall({ endpoint: "health" });

      if (response?.status === API_CONSTANTS.success) {
        const data = response.data as { status: string; service: string };
        setMessage(`Connected: ${data.service} (${data.status})`);
      } else {
        setMessage("Backend returned an error. Check terminal logs.");
      }
    } catch {
      setMessage(
        "Cannot reach backend. Run: cd backend → npm run dev (port 4000)",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-teal-200 bg-teal-50 p-6">
      <h2 className="font-semibold text-teal-800">API test (Style B)</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Uses <code className="rounded bg-white px-1">apiGetCall(&#123; endpoint: &quot;health&quot; &#125;)</code>
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
