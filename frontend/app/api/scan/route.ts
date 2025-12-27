import { NextResponse } from "next/server";
import {prisma} from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const image = formData.get("image") as File;
    const patientName = formData.get("patientName") as string;

    // ===============================
    // 🔧 FIX: doctorId DARI HEADER (BUKAN formData)
    // ===============================

    if (!image || !patientName) {
      return NextResponse.json(
        {
          success: false,
          message: "Gambar, nama pasien wajib diisi",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const url = `https://serverless.roboflow.com/${process.env.ROBOFLOW_MODEL}/${process.env.ROBOFLOW_VERSION}?api_key=${process.env.ROBOFLOW_API_KEY}`;

    // ===============================
    // ROBOFLOW (TIDAK DIUBAH)
    // ===============================
    const rfRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: base64Image,
    });

    if (!rfRes.ok) {
      const errText = await rfRes.text();
      console.error("Roboflow error:", errText);
      return NextResponse.json(
        { success: false, message: errText },
        { status: 500 }
      );
    }

    const rfData = await rfRes.json();

    // ===============================
    // LOGIC HASIL (single source of truth)
    // ===============================
    const hasStone = rfData.predictions.some(
      (p: any) =>
        p.class.toLowerCase().includes("stone") &&
        p.confidence >= 0.5
    );

    const maxConfidence = Math.max(
      ...rfData.predictions.map((p: any) => p.confidence),
      0
    );

    // ===============================
    // DATABASE (TIDAK DIUBAH)
    // ===============================
   /* const scan = await prisma.scan.create({
      data: {
        patientName,
        image: `data:image/png;base64,${base64Image}`,
        result: hasStone ? "Batu Ginjal" : "Normal",
        confidence: maxConfidence,
        predictions: rfData.predictions,
        doctorId, 
      },
    });
*/
    return NextResponse.json({
      success: true,
      //scan,
      result: rfData,
    });
  } catch (error) {
    console.error("SCAN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal error" },
      { status: 500 }
    );
  }
}
