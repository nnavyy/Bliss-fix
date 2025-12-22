"use client";

import { useState } from "react";
import { getHistory, ScanHistoryItem } from "@/services/history-service";
import CTOverlay from "@/components/ct-overlay";

export default function HistoryPage() {
  const [history] = useState<ScanHistoryItem[]>(getHistory());
  const [selected, setSelected] = useState<ScanHistoryItem | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold">Riwayat CT Scan</h1>

        {/* LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow p-4 cursor-pointer hover:ring-2 ring-blue-500"
              onClick={() => setSelected(item)}
            >
              <img
                src={item.image}
                className="rounded-lg h-40 w-full object-cover mb-3"
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

      {/* MODAL DETAIL */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-1">
              {selected.patientName}
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              {selected.date}
            </p>

            <CTOverlay
              imageSrc={selected.image}
              predictions={selected.predictions}
              opacity={0.4}
            />

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
          </div>
        </div>
      )}
    </div>
  );
}
