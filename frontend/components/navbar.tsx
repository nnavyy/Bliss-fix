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
    const storedDoctorId = localStorage.getItem("doctorId");
    setDoctorId(storedDoctorId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("doctorId");
    router.replace("/login");
  };

  const menu = [
    { label: "Upload Scan", href: "/dashboard/upload" },
    { label: "Riwayat", href: "/dashboard/history" },
    { label: "Laporan", href: "/dashboard/report" },
  ];

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-3 items-center">

        {/* ================= LOGO (CLICKABLE → HOME) ================= */}
        {/* FIX: dibungkus link di klik MediKidney balik ke home */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
        >
          <Image
            src="/medikidney2.png"
            alt="MediKidney Logo"
            width={40}
            height={40}
            priority
          />
          <span className="font-bold text-lg text-blue-600">
            MediKidney
          </span>
        </Link>

        {/* ================= SAPAAN ================= */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Halo,{" "}
            <span className="font-semibold text-blue-600">
              Dokter {doctorId ?? "—"}
            </span>{" "}
            👋
          </span>
        </div>

        {/* ================= MENU ================= */}
        <nav className="flex items-center justify-end gap-6">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium ${
                pathname === item.href
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
