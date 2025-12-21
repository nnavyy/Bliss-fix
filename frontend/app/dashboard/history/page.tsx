"use client";

import { useState } from "react";
import Image from "next/image";

type HistoryItem = {
  id: string;
  tanggal: string;
  file: string;
  hasil: "Batu Ginjal" | "Normal";
  status: "Selesai" | "Diproses";
  image: string;
};

export default function HistoryPage() {
  const [preview, setPreview] = useState<string | null>(null);

  const data: HistoryItem[] = [
    {
      id: "SCAN-001",
      tanggal: "21-01-2025",
      file: "ct_scan_001.png",
      hasil: "Batu Ginjal",
      status: "Selesai",
      image: "/sample/ct1.png",
    },
    {
      id: "SCAN-002",
      tanggal: "20-01-2025",
      file: "ct_scan_002.png",
      hasil: "Normal",
      status: "Selesai",
      image: "/sample/ct2.png",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Riwayat Analisis CT Scan</h1>

      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-600 text-left">
              <th className="py-3">ID</th>
              <th>Tanggal</th>
              <th>Gambar</th>
              <th>Nama File</th>
              <th>Hasil</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b last:border-none">
                <td className="py-3 font-medium">{item.id}</td>
                <td>{item.tanggal}</td>

                <td>
                  <Image
                    src={item.image}
                    alt=""
                    width={60}
                    height={60}
                    className="rounded cursor-pointer hover:opacity-80"
                    onClick={() => setPreview(item.image)}
                  />
                </td>

                <td>{item.file}</td>

                <td
                  className={`font-semibold ${
                    item.hasil === "Batu Ginjal"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {item.hasil}
                </td>

                <td className="text-blue-600">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL PREVIEW */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <div className="bg-white p-4 rounded-xl">
            <Image
              src={preview}
              alt=""
              width={400}
              height={400}
              className="rounded"
            />
          </div>
        </div>
      )}
    </main>
  );
}
