"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    setDoctorId(localStorage.getItem("doctorId"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("doctorId");
    router.replace("/login");
  };

  const menu = [
    { label: "New Scan", href: "/dashboard/upload" },
    { label: "History", href: "/dashboard/history" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Image
            src="/medikidney2.png"
            alt="MediKidney"
            width={36}
            height={36}
            priority
            onError={() => {}}
          />
          <span className="font-bold text-lg text-blue-600 hidden sm:block">
            MediKidney
          </span>
        </Link>

        {/* GREETING — center */}
        <div className="hidden md:block text-sm text-gray-500 text-center">
          Welcome,{" "}
          <span className="font-semibold text-blue-600">
            Dr. {doctorId ?? "—"}
          </span>{" "}
          👋
        </div>

        {/* NAV + LOGOUT */}
        <nav className="flex items-center gap-1 shrink-0">
          {menu.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
}
