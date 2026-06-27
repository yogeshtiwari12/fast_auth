"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorData, setErrorData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/profile");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorData(null);
    setLoading(true);

    try {
      const response = await signIn("credentials", {
        redirect: false, // Prevents auto redirection
        email,
        password,
      });

      console.log("Sign-in response:", response);

      if (!response?.ok) {
        if (response?.error === "CredentialsSignin") {
          setErrorData("Incorrect email or password. Please try again.");
        } else {
          setErrorData(response?.error || "Unexpected error occurred please try again later");
        }
        console.error("Login failed:", response?.error);
      } else {
        console.log("Login successful");
        window.location.href = "/profile";
      }
    } catch (error) {
      setErrorData("Unexpected error occurred please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 font-sans text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-md shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to your account</p>
        </div>

        {errorData && (
          <div className="mb-6 rounded-lg bg-red-950/50 border border-red-800 p-3 text-sm text-red-400">
            {errorData}
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

          <div>
            <label className="block text-sm font-medium text-zinc-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign up
          </Link>
        </p>
        <p className="mt-3 text-center text-sm">
          <Link href="/forgot-password" className="font-medium text-zinc-500 hover:text-zinc-300 transition">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
