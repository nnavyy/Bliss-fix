import { Router } from "express";
import jwt from "jsonwebtoken";
import  prisma from "../utils/prisma";

const router = Router();

router.post("/login", async (req, res) => {
  const { doctorId, token } = req.body;

  if (!doctorId || !token) {
    return res.status(400).json({
      success: false,
      message: "Doctor ID dan Token wajib diisi",
    });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor || doctor.token !== token) {
    return res.status(401).json({
      success: false,
      message: "Doctor ID atau Token salah",
    });
  }

  const accessToken = jwt.sign(
    { doctorId: doctor.id },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return res.json({
    success: true,
    data: {
      accessToken,
      doctorId: doctor.id,
    },
  });
});

export default router;
