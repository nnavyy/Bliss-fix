import jsPDF from "jspdf";
import { ScanHistoryItem } from "./history-service";

export function generateReportId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RPT-${date}-${rand}`;
}

export interface ReportOptions {
  item: ScanHistoryItem;
  doctorId?: string;
}

export function generateScanReport({
  item,
  doctorId = "—",
}: ReportOptions): void {
  const reportId = generateReportId();
  const pdf = new jsPDF();

  // ===== HEADER BAR =====
  pdf.setFillColor(37, 99, 235); // blue-600
  pdf.rect(0, 0, 210, 32, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text("MediKidney", 15, 14);
  pdf.setFontSize(10);
  pdf.text("Laporan Hasil Analisis CT Scan Ginjal", 15, 22);

  // ===== META =====
  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(9);
  pdf.text(`Report ID : ${reportId}`, 15, 40);
  pdf.text(`Tanggal   : ${item.date}`, 15, 47);
  pdf.text(`Dokter    : ${doctorId}`, 15, 54);

  // Divider
  pdf.setDrawColor(210, 210, 210);
  pdf.line(15, 58, 195, 58);

  // ===== PATIENT DATA =====
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(13);
  pdf.text("Informasi Pasien", 15, 66);

  pdf.setFontSize(10);
  pdf.setTextColor(50, 50, 50);
  pdf.text(`Nama Pasien    : ${item.patientName}`, 15, 75);

  // ===== RESULT =====
  pdf.setFontSize(13);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Hasil Analisis AI", 15, 90);

  const isStone = item.result === "Batu Ginjal";

  // Result badge background
  if (isStone) {
    pdf.setFillColor(254, 226, 226); // red-100
    pdf.setTextColor(185, 28, 28); // red-700
  } else {
    pdf.setFillColor(220, 252, 231); // green-100
    pdf.setTextColor(21, 128, 61); // green-700
  }
  pdf.roundedRect(15, 95, 100, 14, 3, 3, "F");
  pdf.setFontSize(11);
  pdf.text(
    isStone ? "⚠  Terdeteksi Batu Ginjal" : "✓  Tidak Terdeteksi Batu Ginjal",
    20,
    104,
  );

  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(10);
  pdf.text(`Confidence  : ${Math.round(item.confidence * 100)}%`, 15, 117);

  // ===== IMAGE =====
  if (item.image.startsWith("data:image")) {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(13);
    pdf.text("Citra CT Scan", 15, 128);
    pdf.addImage(item.image, "PNG", 15, 133, 180, 100);
  }

  // ===== DISCLAIMER =====
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  const disclaimerY = 242;
  pdf.setDrawColor(210, 210, 210);
  pdf.line(15, disclaimerY - 3, 195, disclaimerY - 3);
  pdf.text(
    "⚠ DISCLAIMER: Laporan ini dihasilkan secara otomatis oleh sistem AI MediKidney.",
    15,
    disclaimerY + 2,
  );
  pdf.text(
    "Hasil analisis bersifat PENDUKUNG KEPUTUSAN dan TIDAK menggantikan diagnosis dokter spesialis.",
    15,
    disclaimerY + 8,
  );
  pdf.text(
    `Dicetak: ${new Date().toLocaleString("id-ID")} | Dokter ID: ${doctorId}`,
    15,
    disclaimerY + 14,
  );

  pdf.save(`${reportId}.pdf`);
}
