"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type HistoryItem = {
  id: string;
  tanggal: string;
  file: string;
  hasil: "Batu Ginjal" | "Normal";
  status: "Selesai";
  image: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const history: HistoryItem[] = [
    {
      id: "CT-001",
      tanggal: "21-01-2025",
      file: "ct_scan_001.png",
      hasil: "Batu Ginjal",
      status: "Selesai",
      image: "/sample/ct1.png",
    },
    {
      id: "CT-002",
      tanggal: "20-01-2025",
      file: "ct_scan_002.png",
      hasil: "Normal",
      status: "Selesai",
      image: "/sample/ct2.png",
    },
  ];

  const [preview, setPreview] = useState<HistoryItem | null>(null);

  const totalScan = history.length;
  const lastScan = history[0];

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* DESKRIPSI SISTEM */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-3">
          Sistem Deteksi Batu Ginjal
        </h2>

        <p className="text-gray-600 leading-relaxed">
          Sistem ini merupakan aplikasi berbasis <b>kecerdasan buatan</b> untuk
          membantu analisis citra <b>CT Scan ginjal</b>. Dokter dapat mengunggah
          citra CT Scan untuk memperoleh indikasi awal adanya batu ginjal.
        </p>

        <p className="text-gray-500 text-sm mt-3">
          ⚠️ Hasil analisis bersifat pendukung keputusan dan tidak menggantikan
          diagnosis medis.
        </p>
      </section>

      {/* RINGKASAN */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow">
          <p className="text-sm opacity-90">Jumlah CT Scan Dianalisis</p>
          <h2 className="text-4xl font-bold mt-2">{totalScan}</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border">
          <p className="text-sm text-gray-500">Hasil Scan Terakhir</p>
          <h3
            className={`text-2xl font-bold mt-2 ${
              lastScan.hasil === "Batu Ginjal"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {lastScan.hasil}
          </h3>

          <p className="text-sm text-gray-600 mt-1">
            File: {lastScan.file}
          </p>
        </div>
      </section>

      {/* CTA UPLOAD */}
      <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Analisis CT Scan</h3>
          <p className="text-sm text-gray-600">
            Unggah citra CT Scan ginjal untuk dianalisis oleh sistem AI.
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/upload")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Upload CT Scan
        </button>
      </section>

      {/* RIWAYAT */}
      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Riwayat Upload Terbaru</h3>
          <button
            onClick={() => router.push("/dashboard/history")}
            className="text-sm text-blue-600 hover:underline"
          >
            Lihat semua
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-600 text-left">
              <th>ID</th>
              <th>Tanggal</th>
              <th>CT Scan</th>
              <th>Hasil</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3 font-medium">{item.id}</td>
                <td>{item.tanggal}</td>
                <td>
                  <img
                    src={item.image}
                    alt={item.file}
                    className="w-14 h-14 rounded object-cover cursor-pointer hover:scale-105 transition"
                    onClick={() => setPreview(item)}
                  />
                </td>
                <td
                  className={
                    item.hasil === "Batu Ginjal"
                      ? "text-red-600 font-medium"
                      : "text-green-600 font-medium"
                  }
                >
                  {item.hasil}
                </td>
                <td className="text-green-600">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* MODAL PREVIEW */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full relative">
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>

            <h3 className="font-semibold mb-3">Preview CT Scan</h3>
            <img src={preview.image} className="rounded mb-4" />
            <p><b>ID:</b> {preview.id}</p>
            <p><b>File:</b> {preview.file}</p>
            <p><b>Hasil:</b> {preview.hasil}</p>
          </div>
        </div>
      )}
    </main>
  );
}
