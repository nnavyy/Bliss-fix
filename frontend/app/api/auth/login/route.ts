import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import{ prisma }from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { doctorId, token } = await req.json();

    if (!doctorId || !token) {
      return NextResponse.json(
        { success: false, message: "Doctor ID dan Token wajib diisi" },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { doctorId },
    });

    if (!doctor || doctor.token !== token) {
      return NextResponse.json(
        { success: false, message: "Doctor ID atau Token salah" },
        { status: 401 }
      );
    }

    const accessToken = jwt.sign(
      { doctorId }, 
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        doctorId,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
