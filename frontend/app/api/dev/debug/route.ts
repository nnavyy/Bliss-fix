import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {
    NODE_ENV: process.env.NODE_ENV,
    HAS_DATABASE_URL: !!process.env.DATABASE_URL,
    HAS_JWT_SECRET: !!process.env.JWT_SECRET,
  };

  try {
    const count = await prisma.doctor.count();
    checks.db_connected = true;
    checks.doctor_count = count;

    if (count > 0) {
      const doctors = await prisma.doctor.findMany({
        select: { doctorId: true, createdAt: true },
      });
      checks.doctors = doctors;
    }
  } catch (err) {
    checks.db_connected = false;
    checks.db_error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(checks);
}
