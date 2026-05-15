import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const image = formData.get("image") as File | null;
    const patientName = formData.get("patientName") as string | null;

    if (!image || !patientName) {
      return NextResponse.json(
        { success: false, message: "Gambar dan nama pasien wajib diisi" },
        { status: 400 },
      );
    }

    // Extract doctorId from JWT (optional - scan still works without auth)
    const authHeader = req.headers.get("Authorization");
    const payload = verifyAuth(authHeader);
    const doctorId = payload?.doctorId ?? null;

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString("base64");
    const imageDataUrl = `data:image/png;base64,${base64Image}`;

    const roboflowModel = process.env.ROBOFLOW_MODEL;
    const roboflowVersion = process.env.ROBOFLOW_VERSION;
    const roboflowApiKey = process.env.ROBOFLOW_API_KEY;

    if (!roboflowModel || !roboflowVersion || !roboflowApiKey) {
      console.error("[SCAN] Roboflow env vars missing");
      return NextResponse.json(
        { success: false, message: "Konfigurasi AI service tidak lengkap" },
        { status: 500 },
      );
    }

    const url = `https://serverless.roboflow.com/${roboflowModel}/${roboflowVersion}?api_key=${roboflowApiKey}`;

    const rfRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: base64Image,
    });

    if (!rfRes.ok) {
      const errText = await rfRes.text();
      console.error("[SCAN] Roboflow error:", errText);
      return NextResponse.json(
        { success: false, message: "Gagal menghubungi layanan AI. Coba lagi." },
        { status: 502 },
      );
    }

    const rfData = await rfRes.json();
    const predictions: any[] = rfData.predictions ?? [];

    const hasStone = predictions.some(
      (p: any) =>
        p.class?.toLowerCase().includes("stone") && p.confidence >= 0.5,
    );

    const maxConfidence =
      predictions.length > 0
        ? Math.max(...predictions.map((p: any) => p.confidence))
        : 0;

    const resultLabel = hasStone ? "Batu Ginjal" : "Normal";

    // Save to DB only if authenticated
    let savedScan = null;
    if (doctorId) {
      try {
        savedScan = await prisma.scan.create({
          data: {
            patientName,
            image: imageDataUrl,
            result: resultLabel,
            confidence: maxConfidence,
            predictions: predictions,
            doctorId,
          },
        });
      } catch (dbErr) {
        // Don't fail the scan request if DB save fails
        console.error("[SCAN] DB save failed:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      scan: savedScan
        ? {
            id: savedScan.id,
            patientName: savedScan.patientName,
            image: savedScan.image,
            result: savedScan.result,
            confidence: savedScan.confidence,
            predictions: savedScan.predictions,
            scannedAt: savedScan.scannedAt.toISOString(),
          }
        : null,
      result: rfData,
      computed: {
        hasStone,
        result: resultLabel,
        confidence: maxConfidence,
      },
    });
  } catch (error) {
    console.error("[SCAN] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
