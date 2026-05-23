import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    let body: { doctorId?: string; token?: string } | null = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { doctorId, token } = body ?? {};

    if (!doctorId || !token) {
      return NextResponse.json(
        { success: false, message: "Doctor ID and Password are required" },
        { status: 400 },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[LOGIN] JWT_SECRET is not set");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 },
      );
    }

    let isValid = false;

    try {
      const doctor = await prisma.doctor.findUnique({ where: { doctorId } });
      if (doctor) {
        isValid = await bcrypt.compare(token, doctor.passwordHash);
      }
    } catch (dbErr) {
      console.error("[LOGIN] DB Error:", dbErr);
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid Doctor ID or Password" },
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
