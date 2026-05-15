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

// Translate stored result value to display label
function resultLabel(result: string) {
  return result === "Batu Ginjal" ? "Kidney Stone" : result;
}

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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? "Loading..."
                : `${history.length} scans total · ${totalStone} kidney stone · ${totalNormal} normal`}
            </p>
          </div>
          <button
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 font-medium transition mt-1"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>
              ↻
            </span>
            Refresh
          </button>
        </div>

        {/* SEARCH + FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            />
          </div>
          <select
            value={filterResult}
            onChange={(e) =>
              setFilterResult(e.target.value as typeof filterResult)
            }
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[140px]"
          >
            <option value="all">All Results</option>
            <option value="Batu Ginjal">Kidney Stone</option>
            <option value="Normal">Normal</option>
          </select>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm text-gray-400">Loading scan history...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">
              {history.length === 0 ? "📋" : "🔍"}
            </div>
            {history.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold text-gray-700">
                  No scan history yet
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Upload a CT scan to start building your history.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-700">
                  No matching results
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different search term or filter.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setFilterResult("all");
                  }}
                  className="mt-4 text-sm text-blue-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}

        {/* SCAN GRID */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 transition-all relative group"
                onClick={() => setSelected(item)}
              >
                {/* DELETE BUTTON */}
                <button
                  onClick={(e) => handleDelete(item, e)}
                  disabled={deletingId === item.id}
                  className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 text-xs"
                  title="Delete this scan"
                >
                  {deletingId === item.id ? (
                    <span className="animate-spin">↻</span>
                  ) : (
                    "✕"
                  )}
                </button>

                {/* IMAGE — white/light background so CT scans are visible */}
                <div className="h-40 bg-white flex items-center justify-center overflow-hidden border-b border-gray-100">
                  <img
                    src={item.image}
                    alt="CT Scan"
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* CARD BODY */}
                <div className="p-4">
                  {/* Result badge — top row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-bold text-gray-900 truncate text-sm">
                      {item.patientName}
                    </p>
                    <span
                      className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.result === "Batu Ginjal"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.result === "Batu Ginjal" ? "⚠️ Stone" : "✅ Normal"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{item.date}</p>

                  {/* CONFIDENCE BAR */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">
                        Confidence
                      </span>
                      <span className="font-bold text-gray-700">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selected.patientName}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{selected.date}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-5">
              {/* CT SCAN IMAGE */}
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                <CTOverlay
                  imageSrc={selected.image}
                  predictions={selected.predictions ?? []}
                  opacity={0.4}
                />
              </div>

              {/* RESULT BLOCK */}
              <div
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  selected.result === "Batu Ginjal"
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <span className="text-3xl">
                  {selected.result === "Batu Ginjal" ? "⚠️" : "✅"}
                </span>
                <div>
                  <p
                    className={`font-bold text-base ${
                      selected.result === "Batu Ginjal"
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    {selected.result === "Batu Ginjal"
                      ? "Kidney Stone Detected"
                      : "No Kidney Stone Detected"}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Confidence:{" "}
                    <strong
                      className={
                        selected.result === "Batu Ginjal"
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {Math.round(selected.confidence * 100)}%
                    </strong>
                  </p>
                </div>
              </div>

              {/* DISCLAIMER */}
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>
                  This result is a decision-support tool and does{" "}
                  <strong>not</strong> replace diagnosis by a qualified medical
                  specialist.
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => handleDownloadPDF(selected)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  📄 Download PDF Report
                </button>
                <button
                  onClick={(e) => handleDelete(selected, e)}
                  disabled={deletingId === selected.id}
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition text-sm font-medium disabled:opacity-50"
                >
                  {deletingId === selected.id ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin inline-block">↻</span>{" "}
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
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
