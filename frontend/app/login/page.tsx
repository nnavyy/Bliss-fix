"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginDoctor } from "@/services/auth-services";

export default function LoginPage() {
  const router = useRouter();

  const [doctorId, setDoctorId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!doctorId.trim() || !token.trim()) {
      setError("Doctor ID and Password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await loginDoctor({ doctorId: doctorId.trim(), token });

      if (!res.success) {
        setError(
          res.message || "Invalid Doctor ID or Password. Please try again.",
        );
        return;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("[LOGIN]", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* LOGO + TITLE */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center p-2">
              <Image
                src="/medikidney2.png"
                alt="MediKidney Logo"
                width={48}
                height={48}
                priority
                onError={() => {}}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">MediKidney</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Clinical Decision Support System
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Professional Access
          </h2>

          {/* ERROR */}
          {error && (
            <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50/50 border border-red-200 rounded-xl px-4 py-3">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* DOCTOR ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Doctor ID
              </label>
              <input
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                disabled={loading}
                autoComplete="username"
                autoFocus
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-50 transition duration-200"
                placeholder="Enter your registered ID"
              />
            </div>

            {/* TOKEN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-50 transition duration-200"
                placeholder="Enter your password"
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || !doctorId.trim() || !token.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-sm shadow-blue-600/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full" />
                  Authenticating...
                </span>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* DISCLAIMER */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Authorized medical personnel only.
            <br /> All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
