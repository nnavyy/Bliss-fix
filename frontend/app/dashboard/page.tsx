"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getHistoryFromAPI, ScanHistoryItem } from "@/services/history-service";

// Display helper — keeps stored value ("Batu Ginjal") intact, only translates display
function resultDisplay(result: string): string {
  return result === "Batu Ginjal" ? "Kidney Stone" : result;
}

export default function DashboardPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistoryFromAPI()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const totalScan = history.length;
  const totalStone = history.filter((h) => h.result === "Batu Ginjal").length;
  const totalNormal = history.filter((h) => h.result === "Normal").length;
  const lastScan = history[0] ?? null;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* SYSTEM DESCRIPTION */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
            🫁
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Kidney Stone Detection System
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              This AI-powered application assists medical professionals in
              analyzing <strong>kidney CT scan images</strong> to identify early
              indicators of kidney stones. Upload a CT scan to receive an
              instant AI-assisted assessment.
            </p>
            <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>
                Analysis results are decision-support tools and do{" "}
                <strong>not</strong> replace clinical diagnosis by a qualified
                specialist.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow">
          <p className="text-sm opacity-80 font-medium">Total Scans Analyzed</p>
          {loading ? (
            <div className="animate-pulse h-10 w-16 bg-blue-500 rounded mt-3" />
          ) : (
            <p className="text-5xl font-bold mt-3">{totalScan}</p>
          )}
        </div>

        {/* Stone count */}
        <div className="bg-white rounded-2xl p-6 shadow border border-red-100">
          <p className="text-sm text-red-500 font-medium">
            Kidney Stones Detected
          </p>
          {loading ? (
            <div className="animate-pulse h-10 w-16 bg-red-100 rounded mt-3" />
          ) : (
            <>
              <p className="text-5xl font-bold mt-3 text-red-600">
                {totalStone}
              </p>
              {totalScan > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round((totalStone / totalScan) * 100)}% of total
                </p>
              )}
            </>
          )}
        </div>

        {/* Last scan */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Last Scan Result</p>
          {loading ? (
            <div className="animate-pulse h-10 w-32 bg-gray-100 rounded mt-3" />
          ) : lastScan ? (
            <>
              <p
                className={`text-2xl font-bold mt-3 ${
                  lastScan.result === "Batu Ginjal"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {lastScan.result === "Batu Ginjal"
                  ? "⚠️ Kidney Stone"
                  : "✅ Normal"}
              </p>
              <p className="text-sm text-gray-500 mt-1 truncate">
                {lastScan.patientName} &middot; {lastScan.date}
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-sm mt-3">No scans yet</p>
          )}
        </div>
      </section>

      {/* CTA UPLOAD */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white shadow">
        <div>
          <h3 className="text-lg font-semibold mb-1">Analyze a New CT Scan</h3>
          <p className="text-sm text-blue-100">
            Upload a kidney CT scan image and receive an AI-powered analysis in
            seconds.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/upload")}
          className="bg-white text-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-50 transition font-semibold whitespace-nowrap shrink-0 shadow-sm"
        >
          Upload CT Scan →
        </button>
      </section>

      {/* RECENT HISTORY */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Scans</h3>
            {!loading && history.length > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                {totalScan} total &middot; {totalStone} kidney stone &middot;{" "}
                {totalNormal} normal
              </p>
            )}
          </div>
          <button
            onClick={() => router.push("/dashboard/history")}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex gap-4 items-center py-2"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-100 rounded w-28" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-sm font-medium text-gray-500">
              No scan history yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Upload your first CT scan to get started
            </p>
            <button
              onClick={() => router.push("/dashboard/upload")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Upload CT Scan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Patient
                  </th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Preview
                  </th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Result
                  </th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.slice(0, 5).map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push("/dashboard/history")}
                  >
                    <td className="py-3 font-medium text-gray-800">
                      {item.patientName}
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{item.date}</td>
                    <td className="py-3">
                      <img
                        src={item.image}
                        alt={item.patientName}
                        className="w-11 h-11 rounded-lg object-cover bg-gray-100"
                      />
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                          item.result === "Batu Ginjal"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {item.result === "Batu Ginjal"
                          ? "⚠️ Kidney Stone"
                          : "✅ Normal"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.result === "Batu Ginjal"
                                ? "bg-red-400"
                                : "bg-green-400"
                            }`}
                            style={{
                              width: `${Math.round(item.confidence * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-500 text-xs">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
