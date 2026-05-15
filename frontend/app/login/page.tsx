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
      setError("Doctor ID and Token are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await loginDoctor({ doctorId: doctorId.trim(), token });

      if (!res.success) {
        setError(
          res.message || "Invalid Doctor ID or Token. Please try again.",
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

  const fillPrototype = () => {
    setDoctorId("user1");
    setToken("user1");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* LOGO + TITLE */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Image
              src="/medikidney2.png"
              alt="MediKidney Logo"
              width={56}
              height={56}
              priority
              onError={() => {}}
            />
          </div>
          <h1 className="text-2xl font-bold text-blue-600">MediKidney</h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-Powered Kidney Stone Detection
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
            Doctor Sign In
          </h2>

          {/* ERROR */}
          {error && (
            <div className="mb-5 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* DOCTOR ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor ID
              </label>
              <input
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                disabled={loading}
                autoComplete="username"
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition"
                placeholder="Enter your Doctor ID"
              />
            </div>

            {/* TOKEN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token / Password
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition"
                placeholder="Enter your Token"
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || !doctorId.trim() || !token.trim()}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* DEV HINT — prototype only */}
          {process.env.NEXT_PUBLIC_DISABLE_AUTH !== "false" && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">
                Prototype Mode — Demo credentials:
              </p>
              <button
                type="button"
                onClick={fillPrototype}
                className="w-full text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg py-2 transition font-medium"
              >
                Use demo account: <b>user1</b> / <b>user1</b>
              </button>
            </div>
          )}
        </div>

        {/* DISCLAIMER */}
        <p className="text-center text-xs text-gray-400 mt-5">
          This system is for authorized medical use only.
        </p>
      </div>
    </div>
  );
}
