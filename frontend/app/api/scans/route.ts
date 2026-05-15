import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";

type ScanRecord = Prisma.ScanGetPayload<Record<string, never>>;

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const payload = verifyAuth(authHeader);

  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized - silakan login terlebih dahulu",
      },
      { status: 401 },
    );
  }

  try {
    const scans = await prisma.scan.findMany({
      where: { doctorId: payload.doctorId },
      orderBy: { scannedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      scans: scans.map((s: ScanRecord) => ({
        id: s.id,
        patientName: s.patientName,
        image: s.image,
        result: s.result as "Batu Ginjal" | "Normal",
        confidence: s.confidence,
        predictions: s.predictions,
        date: new Date(s.scannedAt).toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        scannedAt: s.scannedAt.toISOString(),
        doctorId: s.doctorId,
      })),
    });
  } catch (error) {
    console.error("[SCANS GET] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil riwayat scan" },
      { status: 500 },
    );
  }
}
