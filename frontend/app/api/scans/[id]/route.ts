import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get("Authorization");
  const payload = verifyAuth(authHeader);

  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    // Verify the scan belongs to this doctor
    const scan = await prisma.scan.findUnique({
      where: { id },
    });

    if (!scan) {
      return NextResponse.json(
        { success: false, message: "Scan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (scan.doctorId !== payload.doctorId) {
      return NextResponse.json(
        { success: false, message: "Forbidden - scan bukan milik Anda" },
        { status: 403 }
      );
    }

    await prisma.scan.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Scan berhasil dihapus" });
  } catch (error) {
    console.error("[SCAN DELETE] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus scan" },
      { status: 500 }
    );
  }
}
