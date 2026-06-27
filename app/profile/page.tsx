"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthClient } from "@/app/libs/authClient";
import Link from "next/link";

export default function Profile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return;
      try {
        const data = await AuthClient("/api/profile", "GET", session, update);
        if (data && data.success) {
          setProfileData(data.user);
        } else {
          setError("Failed to load profile data");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred fetching profile");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session, update]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans text-zinc-400">
        <div className="text-lg font-semibold tracking-wider animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col justify-between overflow-hidden">
      {/* Subtle Background Lights */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900/50 bg-zinc-950/80 backdrop-blur-md px-6 py-4 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="font-bold text-white text-base">F</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FastAuth</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition hover:border-zinc-700"
          >
            Home
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="rounded-lg bg-blue-950/30 border border-blue-900/50 px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-900/30 transition hover:border-blue-900/80"
          >
            Sign Out
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-2xl border border-zinc-900 bg-zinc-900/20 p-8 backdrop-blur-xl shadow-2xl">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-6 mb-8 gap-4">
            <div className="flex items-center gap-4">
              {/* User Avatar Circle */}
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
                {profileData?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-white">{profileData?.name || "User Profile"}</h1>
                  {profileData && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      profileData.isVerified 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${profileData.isVerified ? "bg-emerald-400" : "bg-amber-400"}`} />
                      {profileData.isVerified ? "Verified" : "Unverified"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-1">{profileData?.email}</p>
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-4 text-sm text-red-400 mb-8">
              {error}
            </div>
          ) : profileData ? (
            <div className="space-y-6">
              
              {/* User Info Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex gap-3 items-center">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Full Name</span>
                    <span className="mt-0.5 text-sm font-medium text-white block">{profileData.name}</span>
                  </div>
                </div>

                {/* Email Address */}
                <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex gap-3 items-center">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Email Address</span>
                    <span className="mt-0.5 text-sm font-medium text-white block truncate max-w-[200px]">{profileData.email}</span>
                  </div>
                </div>

                {/* Role Type */}
                <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex gap-3 items-center">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Role Type</span>
                    <span className="mt-0.5 text-sm font-medium text-indigo-400 capitalize block">{profileData.role}</span>
                  </div>
                </div>

                {/* Phone Number */}
                {profileData.phone && (
                  <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Phone Number</span>
                      <span className="mt-0.5 text-sm font-medium text-white block">{profileData.phone}</span>
                    </div>
                  </div>
                )}

                {/* Employee ID */}
                {profileData.employeeId && (
                  <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v1" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Employee ID</span>
                      <span className="mt-0.5 text-sm font-medium text-white block">{profileData.employeeId}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-sm text-zinc-400 text-center py-8">No profile details available.</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900/50 py-6 text-center text-xs text-zinc-600">
        <p>&copy; {new Date().getFullYear()} FastAuth App. All rights reserved.</p>
      </footer>
    </div>
  );
}
