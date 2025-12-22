"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import { getHistory, ScanHistoryItem } from "@/services/history-service";
import CTOverlay from "@/components/ct-overlay";

// ===============================
// GENERATE REPORT ID
// ===============================
function generateReportId() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RPT-${date}-${rand}`;
}

export default function HistoryPage() {
  const [history] = useState<ScanHistoryItem[]>(getHistory());
  const [selected, setSelected] = useState<ScanHistoryItem | null>(null);

  // ===============================
  // DOWNLOAD PDF HANDLER
  // ===============================
  const handleDownloadPDF = (item: ScanHistoryItem) => {
    const reportId = generateReportId(); // 🔥 REPORT ID

    const pdf = new jsPDF();

    // ===== HEADER =====
    pdf.setFontSize(16);
    pdf.text("Laporan Hasil CT Scan", 20, 20);

    pdf.setFontSize(10);
    pdf.text(`Report ID : ${reportId}`, 20, 28);

    // ===== DATA =====
    pdf.setFontSize(12);
    pdf.text(`Nama Pasien : ${item.patientName}`, 20, 40);
    pdf.text(`Tanggal     : ${item.date}`, 20, 50);
    pdf.text(`Hasil       : ${item.result}`, 20, 60);
    pdf.text(
      `Confidence  : ${Math.round(item.confidence * 100)}%`,
      20,
      70
    );

    // ===== IMAGE =====
    if (item.image.startsWith("data:image")) {
      pdf.addImage(item.image, "PNG", 20, 85, 170, 100);
    }

    // ===== FOOTER =====
    pdf.setFontSize(9);
    pdf.text(
      "Catatan: Laporan ini dihasilkan secara otomatis oleh sistem.",
      20,
      195
    );

    pdf.save(`${reportId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold">Riwayat CT Scan</h1>

        {/* ================= LIST HISTORY ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow p-4 cursor-pointer hover:ring-2 ring-blue-500"
              onClick={() => setSelected(item)}
            >
              <img
                src={item.image}
                alt="CT Scan"
                className="rounded-lg h-36 w-full object-contain bg-gray-100 mb-3"
              />

              <p className="font-semibold">{item.patientName}</p>
              <p className="text-xs text-gray-500">{item.date}</p>

              <p
                className={`mt-2 font-medium ${
                  item.result === "Batu Ginjal"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {item.result}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* ================= MODAL DETAIL ================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-1">
              {selected.patientName}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {selected.date}
            </p>

            {/* IMAGE VIEW */}
            <div className="relative w-full max-h-[60vh] overflow-hidden rounded-lg border bg-black flex items-center justify-center">
              <CTOverlay
                imageSrc={selected.image}
                predictions={selected.predictions}
                opacity={0.4}
              />
            </div>

            <p
              className={`mt-4 font-semibold ${
                selected.result === "Batu Ginjal"
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {selected.result}
            </p>

            <p className="text-sm mt-1">
              Confidence tertinggi:{" "}
              <b>{Math.round(selected.confidence * 100)}%</b>
            </p>

            {/* DOWNLOAD PDF */}
            <button
              onClick={() => handleDownloadPDF(selected)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
