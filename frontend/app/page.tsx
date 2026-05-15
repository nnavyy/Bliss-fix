"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/medikidney2.png"
            alt="MediKidney"
            width={64}
            height={64}
            priority
            onError={() => {}}
          />
        </div>
        <h1 className="text-2xl font-bold text-blue-600">MediKidney</h1>
        <p className="text-gray-500 text-sm mt-1">
          Kidney Stone Detection System
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-blue-500 border-t-transparent" />
        </div>
      </div>
    </div>
  );
}
