"use client";

import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-4">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
