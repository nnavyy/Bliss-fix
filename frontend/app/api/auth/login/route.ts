import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/app/lib/prisma";

// ================================================================
// DEV MODE: Kredensial fallback jika tabel DB belum ada
// Aktif HANYA ketika NODE_ENV !== 'production'
// Hapus ini setelah DB migration berhasil dijalankan
// ================================================================
const DEV_FALLBACK_USERS: Record<string, string> = {
  user1: "user1",
  admin: "admin123",
};

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  try {
    let body: { doctorId?: string; token?: string } | null = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body tidak valid" },
        { status: 400 },
      );
    }

    const { doctorId, token } = body ?? {};

    if (!doctorId || !token) {
      return NextResponse.json(
        { success: false, message: "Doctor ID dan Token wajib diisi" },
        { status: 400 },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[LOGIN] JWT_SECRET tidak di-set");
      return NextResponse.json(
        { success: false, message: "Konfigurasi server bermasalah" },
        { status: 500 },
      );
    }

    // ─── Try DB lookup ───────────────────────────────────────────
    let isValid = false;

    try {
      const doctor = await prisma.doctor.findUnique({ where: { doctorId } });

      const inputBuf = Buffer.from(token);
      const storedBuf = Buffer.from(doctor?.token ?? "");
      const lengthMatch = inputBuf.length === storedBuf.length;
      isValid = !!doctor && lengthMatch && timingSafeEqual(inputBuf, storedBuf);
    } catch (dbErr) {
      // DB not available (tables missing, connection issue) → try dev fallback
      console.warn(
        "[LOGIN] DB tidak tersedia, coba dev fallback:",
        String(dbErr).split("\n")[0],
      );

      if (process.env.NODE_ENV !== "production") {
        const expectedToken = DEV_FALLBACK_USERS[doctorId];
        isValid = !!expectedToken && safeCompare(token, expectedToken);

        if (isValid) {
          console.log(`[LOGIN] DEV FALLBACK: login berhasil untuk ${doctorId}`);
        }
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Doctor ID atau Token salah" },
        { status: 401 },
      );
    }

    const accessToken = jwt.sign({ doctorId }, secret, { expiresIn: "1d" });

    return NextResponse.json({
      success: true,
      data: { accessToken, doctorId },
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
