"use client";

import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import {
  getHistoryFromAPI,
  deleteHistoryFromAPI,
  deleteHistoryLocal,
  ScanHistoryItem,
} from "@/services/history-service";
import CTOverlay from "@/components/ct-overlay";

function generateReportId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RPT-${date}-${rand}`;
}

function resultLabel(result: string) {
  return result === "Batu Ginjal" ? "Kidney Stone" : result;
}

const RefreshIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const ErrorIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const DocumentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function HistoryPage() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ScanHistoryItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState<
    "all" | "Batu Ginjal" | "Normal"
  >("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoryFromAPI();
      setHistory(data);
    } catch {
      setError("Failed to load scan history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (item: ScanHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(
        `Delete scan for ${item.patientName}? This action cannot be undone.`,
      )
    )
      return;

    setDeletingId(item.id);
    try {
      const ok = await deleteHistoryFromAPI(item.id);
      if (ok) {
        setHistory((prev) => prev.filter((h) => h.id !== item.id));
        if (selected?.id === item.id) setSelected(null);
      } else {
        deleteHistoryLocal(item.id);
        setHistory((prev) => prev.filter((h) => h.id !== item.id));
        if (selected?.id === item.id) setSelected(null);
      }
    } catch {
      alert("Failed to delete scan. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPDF = (item: ScanHistoryItem) => {
    const reportId = generateReportId();
    const doctorId =
      typeof window !== "undefined"
        ? (localStorage.getItem("doctorId") ?? "—")
        : "—";

    const pdf = new jsPDF();

    // === HEADER ===
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, 210, 32, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.text("MediKidney", 15, 14);
    pdf.setFontSize(10);
    pdf.text("Kidney CT Scan Analysis Report", 15, 23);

    // === META ===
    pdf.setTextColor(80, 80, 80);
    pdf.setFontSize(9);
    pdf.text(`Report ID  : ${reportId}`, 15, 40);
    pdf.text(`Date       : ${item.date}`, 15, 47);
    pdf.text(`Doctor ID  : ${doctorId}`, 15, 54);

    pdf.setDrawColor(210, 210, 210);
    pdf.line(15, 58, 195, 58);

    // === PATIENT ===
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(13);
    pdf.text("Patient Information", 15, 66);

    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.text(`Patient Name   : ${item.patientName}`, 15, 75);
    pdf.text(`Analysis Result: ${resultLabel(item.result)}`, 15, 83);
    pdf.text(`Confidence     : ${Math.round(item.confidence * 100)}%`, 15, 91);

    // === RESULT BADGE ===
    const isStone = item.result === "Batu Ginjal";
    if (isStone) {
      pdf.setFillColor(254, 226, 226);
      pdf.setTextColor(185, 28, 28);
    } else {
      pdf.setFillColor(220, 252, 231);
      pdf.setTextColor(21, 128, 61);
    }
    pdf.roundedRect(15, 96, 100, 12, 3, 3, "F");
    pdf.setFontSize(10);
    pdf.text(
      isStone ? "! Kidney Stone Detected" : "V No Kidney Stone Detected",
      20,
      104,
    );
    pdf.setTextColor(0, 0, 0);

    // === IMAGE ===
    if (item.image.startsWith("data:image")) {
      pdf.setFontSize(12);
      pdf.text("CT Scan Image", 15, 116);
      pdf.addImage(item.image, "PNG", 15, 121, 180, 100);
    }

    // === FOOTER ===
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.line(15, 228, 195, 228);
    pdf.text(
      "DISCLAIMER: This report was generated automatically by the MediKidney AI system.",
      15,
      234,
    );
    pdf.text(
      "Results are intended as decision-support tools only and do NOT replace diagnosis by a qualified specialist.",
      15,
      240,
    );
    pdf.text(
      `Doctor ID: ${doctorId}  |  Generated: ${new Date().toLocaleString("en-US")}`,
      15,
      246,
    );

    pdf.save(`${reportId}.pdf`);
  };

  const filtered = history.filter((item) => {
    const matchSearch = item.patientName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter = filterResult === "all" || item.result === filterResult;
    return matchSearch && matchFilter;
  });

  const totalStone = history.filter((h) => h.result === "Batu Ginjal").length;
  const totalNormal = history.filter((h) => h.result === "Normal").length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Scan History</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {loading
                ? "Loading..."
                : `${history.length} scans total | ${totalStone} kidney stone | ${totalNormal} normal`}
            </p>
          </div>
          <button
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg disabled:opacity-50 font-medium transition duration-200 mt-1"
          >
            <span className={loading ? "animate-spin" : ""}>
              <RefreshIcon />
            </span>
            Refresh
          </button>
        </div>

        {/* SEARCH + FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white shadow-sm"
            />
          </div>
          <select
            value={filterResult}
            onChange={(e) =>
              setFilterResult(e.target.value as typeof filterResult)
            }
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none min-w-[150px] shadow-sm"
          >
            <option value="all">All Results</option>
            <option value="Batu Ginjal">Kidney Stone</option>
            <option value="Normal">Normal</option>
          </select>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50/50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <ErrorIcon />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-400">Loading scan history...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-dashed border-gray-200 rounded-2xl shadow-sm">
            <div className="text-gray-300 mb-4">
              {history.length === 0 ? <DocumentIcon className="w-16 h-16" /> : <SearchIcon className="w-16 h-16" />}
            </div>
            {history.length === 0 ? (
              <>
                <h3 className="text-lg font-bold text-gray-900">
                  No scan history yet
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Upload a CT scan to start building your history.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900">
                  No matching results
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Try a different search term or filter.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setFilterResult("all");
                  }}
                  className="mt-5 px-4 py-2 bg-blue-50 text-sm text-blue-600 rounded-lg hover:bg-blue-100 font-semibold transition"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}

        {/* SCAN GRID */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-200 relative group flex flex-col"
                onClick={() => setSelected(item)}
              >
                {/* DELETE BUTTON */}
                <button
                  onClick={(e) => handleDelete(item, e)}
                  disabled={deletingId === item.id}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-300 text-xs shadow-sm"
                  title="Delete this scan"
                >
                  {deletingId === item.id ? (
                    <span className="animate-spin"><RefreshIcon className="w-3.5 h-3.5" /></span>
                  ) : (
                    <CloseIcon className="w-4 h-4" />
                  )}
                </button>

                {/* IMAGE */}
                <div className="h-44 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 p-2">
                  <img
                    src={item.image}
                    alt="CT Scan"
                    className="h-full w-full object-contain rounded-lg"
                  />
                </div>

                {/* CARD BODY */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <p className="font-bold text-gray-900 truncate text-[15px]">
                        {item.patientName}
                      </p>
                      <span
                        className={`shrink-0 text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border ${
                          item.result === "Batu Ginjal"
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-green-50 border-green-200 text-green-700"
                        }`}
                      >
                        {item.result === "Batu Ginjal" ? "Stone" : "Normal"}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-4">{item.date}</p>
                  </div>

                  {/* CONFIDENCE BAR */}
                  <div className="pt-3 border-t border-gray-50 mt-auto">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500 font-medium tracking-wide uppercase text-[10px]">
                        AI Confidence
                      </span>
                      <span className="font-bold text-gray-800">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* DETAIL MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {selected.patientName}
                </h2>
                <p className="text-sm font-medium text-gray-500 mt-1">{selected.date}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              >
                <CloseIcon />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-7 space-y-6">
              {/* CT SCAN IMAGE */}
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                <CTOverlay
                  imageSrc={selected.image}
                  predictions={selected.predictions ?? []}
                  opacity={0.4}
                />
              </div>

              {/* RESULT BLOCK */}
              <div
                className={`flex items-center gap-5 p-5 rounded-xl border ${
                  selected.result === "Batu Ginjal"
                    ? "bg-red-50/50 border-red-200 text-red-900"
                    : "bg-green-50/50 border-green-200 text-green-900"
                }`}
              >
                <div className={`p-2.5 rounded-full ${selected.result === "Batu Ginjal" ? "bg-red-100" : "bg-green-100"}`}>
                  {selected.result === "Batu Ginjal" ? <ErrorIcon className="w-7 h-7 text-red-600" /> : <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </div>
                <div>
                  <p
                    className={`font-bold text-lg ${
                      selected.result === "Batu Ginjal"
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    {selected.result === "Batu Ginjal"
                      ? "Kidney Stone Detected"
                      : "No Kidney Stone Detected"}
                  </p>
                  <p className="text-sm font-medium opacity-80 mt-1">
                    Confidence:{" "}
                    <strong
                      className={
                        selected.result === "Batu Ginjal"
                          ? "text-red-700"
                          : "text-green-700"
                      }
                    >
                      {Math.round(selected.confidence * 100)}%
                    </strong>
                  </p>
                </div>
              </div>

              {/* DISCLAIMER */}
              <div className="flex items-start gap-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
                <div className="mt-0.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="leading-relaxed">
                  <span className="font-semibold text-gray-900">Clinical Disclaimer:</span> This result is a decision-support tool and does{" "}
                  <strong>not</strong> replace diagnosis by a qualified medical specialist.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => handleDownloadPDF(selected)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20"
                >
                  <DocumentIcon className="w-5 h-5" /> Download PDF Report
                </button>
                <button
                  onClick={(e) => handleDelete(selected, e)}
                  disabled={deletingId === selected.id}
                  className="px-6 py-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId === selected.id ? (
                    <><RefreshIcon className="w-4 h-4 animate-spin" /> Deleting...</>
                  ) : (
                    "Delete Record"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
