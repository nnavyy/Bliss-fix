import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// ================================================================
// DEV-ONLY ENDPOINT — Tidak bisa diakses di production
// Buat user prototype untuk testing / demo
//
// Cara pakai:
//   1. Jalankan: npm run dev
//   2. Buka browser: http://localhost:3000/api/dev/seed
//   3. Setelah berhasil, login dengan:
//      - Doctor ID : user1
//      - Token     : user1
// ================================================================

const PROTOTYPE_USERS = [
  { doctorId: "user1", token: "user1" },
  { doctorId: "admin", token: "admin123" },
];

export async function GET() {
  // Block access in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, message: "Endpoint ini tidak tersedia di production" },
      { status: 403 }
    );
  }

  const results: { doctorId: string; status: "created" | "already_exists" | "error"; error?: string }[] = [];

  for (const user of PROTOTYPE_USERS) {
    try {
      const existing = await prisma.doctor.findUnique({
        where: { doctorId: user.doctorId },
      });

      if (existing) {
        results.push({ doctorId: user.doctorId, status: "already_exists" });
        continue;
      }

      await prisma.doctor.create({
        data: {
          doctorId: user.doctorId,
          token: user.token,
        },
      });

      results.push({ doctorId: user.doctorId, status: "created" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ doctorId: user.doctorId, status: "error", error: message });
    }
  }

  const allOk = results.every((r) => r.status !== "error");

  return NextResponse.json(
    {
      success: allOk,
      message: allOk
        ? "✅ Seed berhasil! Silakan login dengan user1 / user1"
        : "⚠️ Seed selesai dengan beberapa error",
      users: results,
      loginInfo: {
        url: "/login",
        credentials: PROTOTYPE_USERS.map((u) => ({
          doctorId: u.doctorId,
          token: u.token,
        })),
      },
    },
    { status: allOk ? 200 : 207 }
  );
}
