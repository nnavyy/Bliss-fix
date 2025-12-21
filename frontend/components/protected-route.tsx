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
  console.log("ProtectedRoute mounted");

  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.log("NO TOKEN → UNAUTHORIZED");
    setUnauthorized(true);

    setTimeout(() => {
      router.replace("/login");
    }, 4000);
  } else {
    console.log("TOKEN FOUND");
    setChecking(false);
  }
}, [router]);

  // acces denied lol
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
          <div className="text-xs text-gray-400">
            Mengalihkan ke halaman login...
                                     
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        </div>
      </div>
          </div>
        </div>
    );
  }

  // ⏳ LOADING CEK TOKEN
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
