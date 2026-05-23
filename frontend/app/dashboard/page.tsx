"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getHistoryFromAPI, ScanHistoryItem } from "@/services/history-service";

// Simple SVG Icons
const LungsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12c0-1.232.046-2.453.138-3.662a4.006 4.006 0 013.7-3.7 48.678 48.678 0 017.324 0 4.006 4.006 0 013.7 3.7c.017.22.032.441.046.662M4.5 12l-3-3m3 3l3-3m12 3l3-3m-3 3l-3-3" />
  </svg>
);
const ActivityIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const DocumentIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const AlertIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const EmptyStateIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);


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
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
      {/* SYSTEM DESCRIPTION */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
        <div className="flex items-start gap-5">
          <div className="shrink-0 w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <ActivityIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
              Kidney Stone Detection System
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              This AI-powered application assists medical professionals in
              analyzing <strong>kidney CT scan images</strong> to identify early
              indicators of kidney stones. Upload a CT scan to receive an
              instant AI-assisted assessment.
            </p>
            <div className="mt-4 flex items-start gap-2.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <span className="shrink-0 mt-0.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <span>
                <span className="font-semibold text-gray-800">Clinical Disclaimer:</span> Analysis results are decision-support tools and do{" "}
                <strong>not</strong> replace clinical diagnosis by a qualified
                specialist.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total */}
        <div className="bg-blue-600 text-white rounded-2xl p-7 shadow-sm shadow-blue-600/20 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-white/10">
            <ActivityIcon className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-blue-100 font-semibold tracking-wide uppercase">Total Scans Analyzed</p>
            {loading ? (
              <div className="animate-pulse h-12 w-20 bg-blue-500 rounded mt-3" />
            ) : (
              <p className="text-5xl font-bold mt-3 tracking-tight">{totalScan}</p>
            )}
          </div>
        </div>

        {/* Stone count */}
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
          <p className="text-sm text-red-500 font-semibold tracking-wide uppercase">
            Kidney Stones Detected
          </p>
          {loading ? (
            <div className="animate-pulse h-12 w-20 bg-gray-100 rounded mt-3" />
          ) : (
            <>
              <p className="text-5xl font-bold mt-3 text-red-600 tracking-tight">
                {totalStone}
              </p>
              {totalScan > 0 && (
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {Math.round((totalStone / totalScan) * 100)}% of total scans
                </p>
              )}
            </>
          )}
        </div>

        {/* Last scan */}
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-sm text-gray-500 font-semibold tracking-wide uppercase">Last Scan Result</p>
          {loading ? (
            <div className="animate-pulse h-10 w-32 bg-gray-100 rounded mt-3" />
          ) : lastScan ? (
            <>
              <div className="mt-3 flex items-center gap-2">
                <span className={`p-1.5 rounded-full ${lastScan.result === "Batu Ginjal" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                  {lastScan.result === "Batu Ginjal" ? <AlertIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                </span>
                <p
                  className={`text-2xl font-bold tracking-tight ${
                    lastScan.result === "Batu Ginjal"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {lastScan.result === "Batu Ginjal"
                    ? "Kidney Stone"
                    : "Normal"}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-2 truncate font-medium">
                {lastScan.patientName} &middot; {lastScan.date.split(',')[0]}
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-sm mt-4 font-medium flex items-center gap-2">
              No scans performed yet
            </p>
          )}
        </div>
      </section>

      {/* CTA UPLOAD */}
      <section className="bg-white border border-blue-100 rounded-2xl p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
            <DocumentIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Analyze a New CT Scan</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Upload a kidney CT scan image and receive an AI-powered analysis in
              seconds.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/upload")}
          className="bg-blue-600 text-white px-7 py-3.5 rounded-xl hover:bg-blue-700 transition font-semibold whitespace-nowrap shrink-0 shadow-sm shadow-blue-600/20 active:bg-blue-800"
        >
          Upload CT Scan
        </button>
      </section>

      {/* RECENT HISTORY */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Scans</h3>
            {!loading && history.length > 0 && (
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {totalScan} total &middot; {totalStone} kidney stone &middot;{" "}
                {totalNormal} normal
              </p>
            )}
          </div>
          <button
            onClick={() => router.push("/dashboard/history")}
            className="text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-semibold transition duration-200"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex gap-5 items-center py-3 border-b border-gray-50 last:border-0"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
                <div className="h-5 bg-gray-100 rounded-full w-24" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
            <div className="text-gray-300 flex justify-center mb-4">
              <EmptyStateIcon />
            </div>
            <p className="text-base font-bold text-gray-800">
              No scan history yet
            </p>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Upload your first CT scan to get started
            </p>
            <button
              onClick={() => router.push("/dashboard/upload")}
              className="mt-6 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 hover:text-gray-900 transition font-semibold shadow-sm"
            >
              Upload CT Scan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/4">
                    Patient Name
                  </th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Scan Image
                  </th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    AI Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.slice(0, 5).map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 cursor-pointer group transition duration-150"
                    onClick={() => router.push("/dashboard/history")}
                  >
                    <td className="py-4 font-bold text-gray-900">
                      {item.patientName}
                    </td>
                    <td className="py-4 text-gray-500 text-xs font-medium">{item.date}</td>
                    <td className="py-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shadow-sm group-hover:shadow transition">
                        <img
                          src={item.image}
                          alt={item.patientName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border ${
                          item.result === "Batu Ginjal"
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-green-50 border-green-200 text-green-700"
                        }`}
                      >
                        {item.result === "Batu Ginjal"
                          ? "Stone Detected"
                          : "Normal"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.result === "Batu Ginjal"
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.round(item.confidence * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-700 font-bold text-xs">
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
