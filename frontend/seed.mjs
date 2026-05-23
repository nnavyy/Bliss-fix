// seed.mjs
// 1. Create Doctor + Scan tables if not exist
// 2. Insert user prototype (user1 / user1)

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

const USERS = [
  { doctorId: "user1", passwordPlain: "user1" },
  { doctorId: "admin", passwordPlain: "admin123" },
];

async function main() {
  console.log("\nMediKidney - Setup & Seeder\n");


  console.log("\nMembuat user prototype...");
  for (const user of USERS) {
    try {
      const existing = await prisma.doctor.findUnique({
        where: { doctorId: user.doctorId },
      });

      if (existing) {
        console.log(`  ${user.doctorId} - sudah ada (skip)`);
      } else {
        const passwordHash = await bcrypt.hash(user.passwordPlain, 10);
        await prisma.doctor.create({ 
          data: { 
            doctorId: user.doctorId, 
            passwordHash 
          } 
        });
        console.log(`  ${user.doctorId} - berhasil dibuat`);
      }
    } catch (err) {
      console.error(`  ${user.doctorId} - error: ${err.message}`);
    }
  }

  console.log("\n--------------------------------------");
  console.log("Kredensial login prototype:\n");
  for (const user of USERS) {
    console.log(`  Doctor ID : ${user.doctorId}`);
    console.log(`  Password  : ${user.passwordPlain}`);
    console.log(`  URL       : http://localhost:3000/login\n`);
  }
  console.log("--------------------------------------\n");
}

main()
  .catch((e) => {
    console.error("\nSeed gagal:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
