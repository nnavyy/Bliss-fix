"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center p-2">
            <Image
              src="/medikidney2.png"
              alt="MediKidney"
              width={56}
              height={56}
              priority
              onError={() => {}}
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">MediKidney</h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">
          Clinical Decision Support System
        </p>
        <div className="mt-8 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
        </div>
      </div>
    </div>
  );
}
