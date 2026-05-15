"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    // DEV MODE: Skip auth check if NEXT_PUBLIC_DISABLE_AUTH=true
    if (process.env.NEXT_PUBLIC_DISABLE_AUTH === "true") {
      console.log("[AUTH] Auth disabled (dev mode)");
      setChecking(false);
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUnauthorized(true);
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }

    setChecking(false);
  }, [router]);

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white border border-red-200 rounded-xl shadow p-6 max-w-sm text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Akses Tidak Diizinkan
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Silakan login terlebih dahulu untuk mengakses halaman ini.
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Mengalihkan ke halaman login...
          </p>
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto" />
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
