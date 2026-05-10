"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">📬</div>
          <h1 className="text-xl font-semibold text-gray-900">Check your email</h1>
          <p className="text-gray-500 text-sm">
            We sent a magic link to <span className="font-medium text-gray-700">{email}</span>.
            Tap it to log in — no password needed.
          </p>
          <button
            onClick={() => { setSubmitted(false); setEmail(""); }}
            className="text-sm text-blue-600 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Case Prep Tracker</h1>
          <p className="text-gray-500 text-sm">Enter your email to get a login link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm
              text-gray-900 placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm
              hover:bg-blue-700 active:bg-blue-800
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>
      </div>
    </div>
  );
}
