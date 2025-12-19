"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    if (!doctorId || !token) {
      setError("Doctor ID dan Token wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const res = await loginDoctor({
        doctorId,
        token,
      });

      if (!res.success) {
        setError(res.message || "Login gagal");
        return;
      }

      // token & doctorId SUDAH disimpan di auth-services.ts
      router.push("/dashboard/upload");
    } catch (err) {
      setError("Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Login Dokter
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            Doctor ID
          </label>
          <input
            type="text"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            disabled={loading}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Masukkan Doctor ID"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">
            Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Masukkan Token"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Memproses..." : "Login"}
        </button>
      </form>
    </div>
  );
}
