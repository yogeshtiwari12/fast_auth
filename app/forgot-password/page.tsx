"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ForgotPassword() {
  const { status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/profile");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || "Failed to process request");
      } else {
        setMessage("A password reset verification code has been sent to your email.");
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 font-sans text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-md shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Forgot Password</h1>
          <p className="mt-2 text-sm text-zinc-400">Enter your email to request a reset code</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-950/50 border border-red-800 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg bg-emerald-950/50 border border-emerald-850 p-3 text-sm text-emerald-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="name@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
          >
            {loading ? "Sending reset code..." : "Send Reset Code"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-400">
          <Link href="/sign-in" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
