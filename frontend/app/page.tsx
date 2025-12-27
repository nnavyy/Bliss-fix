"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Masuk ke Medikidney</h1>
        <p className="text-gray-500 mt-2">Loading...</p>

        {/* spinner */}
        <div className="mt-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black mx-auto" />
      </div>
    </div>
  );
}
