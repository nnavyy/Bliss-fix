"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();

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
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <h1 className="font-bold text-lg text-blue-600">
          MediKidney
        </h1>

        <nav className="flex items-center gap-6">
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
