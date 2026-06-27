"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100 flex flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900/50 bg-zinc-950/80 backdrop-blur-md px-6 py-4 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="font-bold text-white text-base">F</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FastAuth</span>
        </div>
        
        <nav className="flex items-center gap-4">
          {status === "authenticated" ? (
            <>
              <Link
                href="/profile"
                className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition hover:border-zinc-700"
              >
                Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="rounded-lg bg-blue-950/30 border border-blue-900/50 px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-900/30 transition hover:border-blue-900/80"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-zinc-400 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto">
        {/* Banner Tag */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/30 px-4 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          Powered by FastAPI & NextAuth
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Secure, Lightweight <br className="hidden sm:inline"/>
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Authentication Redefined
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
          A state-of-the-art authentication system combining Next.js App Router, 
          NextAuth, and a fully modularized FastAPI Python backend with JWT session security.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center px-4 max-w-sm sm:max-w-none">
          {status === "authenticated" ? (
            <Link
              href="/profile"
              className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 text-sm font-semibold text-white transition hover:opacity-95 shadow-xl shadow-indigo-600/20"
            >
              Go to Profile
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 text-sm font-semibold text-white transition hover:opacity-95 shadow-xl shadow-indigo-600/20"
              >
                Get Started Free
              </Link>
              <Link
                href="/sign-in"
                className="flex h-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 px-8 text-sm font-semibold text-zinc-300 transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-sm">
            <div className="mb-4 h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              ⚡
            </div>
            <h3 className="font-bold text-white text-base">FastAPI Backend</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Ultra-fast Python ASGI server powered by FastAPI handling secure registration, OTP and token rotations.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-sm">
            <div className="mb-4 h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              🛡️
            </div>
            <h3 className="font-bold text-white text-base">NextAuth.js Integration</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Stateless JWT session cookies managed securely with automatic client-side token rotation intercepts.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-sm">
            <div className="mb-4 h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              🔑
            </div>
            <h3 className="font-bold text-white text-base">Secure OTP Flow</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Built-in verification safeguards checking single-use codes and expiries before confirming signups.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/50 py-8 text-center text-xs text-zinc-600">
        <p>&copy; {new Date().getFullYear()} FastAuth App. All rights reserved.</p>
      </footer>
    </div>
  );
}
