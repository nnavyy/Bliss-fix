// seed.mjs — Jalankan dengan: node seed.mjs
// 1. Buat tabel Doctor + Scan jika belum ada
// 2. Insert user prototype (user1 / user1)

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env manually ─────────────────────────────────────────
function loadEnv(filename) {
  try {
    const content = readFileSync(resolve(__dirname, filename), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // file not found — skip
  }
}

loadEnv(".env");
loadEnv(".env.local");

// ─── Prisma Client ───────────────────────────────────────────────
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("\n❌ DATABASE_URL tidak ditemukan di .env\n");
  process.exit(1);
}
const prisma = new PrismaClient({ datasourceUrl: dbUrl }).$extends(
  withAccelerate(),
);

// ─── Users to seed ──────────────────────────────────────────────
const USERS = [
  { doctorId: "user1", token: "user1" },
  { doctorId: "admin", token: "admin123" },
];

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log("\n🌱 MediKidney — Setup & Seeder\n");

  // STEP 1: Buat tabel jika belum ada
  console.log("📦 Membuat tabel (jika belum ada)...");
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Doctor" (
        "doctorId"  TEXT        NOT NULL,
        "token"     TEXT        NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Doctor_pkey" PRIMARY KEY ("doctorId")
      );
    `);
    console.log("  ✅  Tabel Doctor — OK");

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Scan" (
        "id"          TEXT          NOT NULL,
        "patientName" TEXT          NOT NULL,
        "image"       TEXT          NOT NULL,
        "result"      TEXT          NOT NULL,
        "confidence"  DOUBLE PRECISION NOT NULL,
        "predictions" JSONB         NOT NULL,
        "scannedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "doctorId"    TEXT          NOT NULL,
        CONSTRAINT "Scan_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Scan_doctorId_fkey"
          FOREIGN KEY ("doctorId")
          REFERENCES "Doctor"("doctorId")
          ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    console.log("  ✅  Tabel Scan — OK");
  } catch (err) {
    console.error("  ❌  Gagal membuat tabel:", err.message);
    process.exit(1);
  }

  // STEP 2: Seed users
  console.log("\n👤 Membuat user prototype...");
  for (const user of USERS) {
    try {
      const existing = await prisma.doctor.findUnique({
        where: { doctorId: user.doctorId },
      });

      if (existing) {
        console.log(`  ⏭  ${user.doctorId} — sudah ada (skip)`);
      } else {
        await prisma.doctor.create({ data: user });
        console.log(`  ✅  ${user.doctorId} — berhasil dibuat`);
      }
    } catch (err) {
      console.error(`  ❌  ${user.doctorId} — error: ${err.message}`);
    }
  }

  console.log("\n──────────────────────────────────────");
  console.log("📋 Kredensial login prototype:\n");
  for (const user of USERS) {
    console.log(`  Doctor ID : ${user.doctorId}`);
    console.log(`  Token     : ${user.token}`);
    console.log(`  URL       : http://localhost:3000/login\n`);
  }
  console.log("──────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed gagal:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
