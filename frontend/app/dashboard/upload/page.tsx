"use client";

import { useState, useRef } from "react";
import { scanCTScan } from "@/services/scan-services";
import CTOverlay from "@/components/ct-overlay";
import { saveHistoryLocal } from "@/services/history-service";

// Internal stored value remains "Batu Ginjal" | "Normal"
function determineResult(predictions: any[]): "Batu Ginjal" | "Normal" {
  const stoneDetected = predictions.some(
    (p) => p.class?.toLowerCase().includes("stone") && p.confidence >= 0.5,
  );
  return stoneDetected ? "Batu Ginjal" : "Normal";
}

export default function UploadCTScanPage() {
  const [patientName, setPatientName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const MAX_SIZE_MB = 10;

  const validateAndSetFile = (f: File) => {
    setDropError(null);
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setDropError(
        `File type "${f.type || f.name.split(".").pop()}" is not supported. Please use JPG, PNG, or WEBP.`,
      );
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setDropError(
        `File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`,
      );
      return;
    }
    handleFileChange(f);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset if truly leaving the drop zone (not moving over a child element)
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (loading) return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  // Visualization controls
  const [confidence, setConfidence] = useState(0.5);
  const [opacity, setOpacity] = useState(0.4);
  const [showStone, setShowStone] = useState(true);
  const [showAbnormal, setShowAbnormal] = useState(true);

  const rawPredictions: any[] = result?.result?.predictions ?? [];

  const filteredPredictions = rawPredictions.filter((p: any) => {
    const isStone = p.class?.toLowerCase().includes("stone");
    const isAbnormal = p.class?.toLowerCase().includes("abnormal");
    if (isStone && !showStone) return false;
    if (isAbnormal && !showAbnormal) return false;
    return p.confidence >= confidence;
  });

  const hasStone = result
    ? (result.computed?.hasStone ??
      determineResult(rawPredictions) === "Batu Ginjal")
    : false;

  const handleFileChange = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!file || !patientName.trim()) {
      setError("Patient name and CT scan file are required.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await scanCTScan(file, patientName);
      setResult(res);

      // Save to localStorage if not saved to DB (no auth / DB unavailable)
      if (!res.scan && preview) {
        const predictions: any[] = res?.result?.predictions ?? [];
        const finalResult = determineResult(predictions);
        const maxConf =
          predictions.length > 0
            ? Math.max(...predictions.map((p: any) => p.confidence))
            : 0;

        saveHistoryLocal({
          id: `CT-${Date.now()}`,
          patientName,
          date: new Date().toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: preview,
          result: finalResult,
          confidence: maxConf,
          predictions,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process CT scan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setDropError(null);
    setPatientName("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload CT Scan</h1>
          <p className="text-gray-600 text-sm mt-1">
            Upload a kidney CT scan image to receive an AI-powered analysis
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* PATIENT NAME */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. John Smith"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400 transition"
            />
          </div>

          {/* FILE UPLOAD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              CT Scan File <span className="text-red-500">*</span>
            </label>

            {/* DROP ZONE */}
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                !loading && document.getElementById("ct-upload")?.click()
              }
              className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer select-none ${
                loading
                  ? "cursor-not-allowed opacity-60"
                  : isDragging
                    ? "border-blue-500 bg-blue-50 scale-[1.01] shadow-lg shadow-blue-100"
                    : file
                      ? "border-blue-400 bg-blue-50 hover:border-blue-500"
                      : dropError
                        ? "border-red-300 bg-red-50 hover:border-red-400"
                        : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                id="ct-upload"
                onChange={(e) => {
                  if (e.target.files?.[0])
                    validateAndSetFile(e.target.files[0]);
                  // reset input value so same file can be re-selected
                  e.target.value = "";
                }}
                disabled={loading}
              />

              {/* DRAG OVERLAY BADGE */}
              {isDragging && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-blue-50/80 backdrop-blur-sm z-10 pointer-events-none">
                  <span className="text-5xl mb-2">📥</span>
                  <p className="text-blue-600 font-bold text-base">
                    Drop your file here
                  </p>
                </div>
              )}

              <div className="p-8 text-center">
                {file ? (
                  // ─── FILE SELECTED ───────────────────────────────
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                      🖼️
                    </div>
                    <p className="text-sm font-semibold text-blue-700 mt-1">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                        setDropError(null);
                      }}
                      className="mt-1 text-xs text-gray-400 hover:text-red-500 underline transition"
                    >
                      Remove file
                    </button>
                  </div>
                ) : dropError ? (
                  // ─── DROP ERROR ───────────────────────────────────
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-3xl">❌</span>
                    <p className="text-sm font-semibold text-red-600 mt-1">
                      {dropError}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropError(null);
                      }}
                      className="mt-1 text-xs text-blue-500 hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  // ─── EMPTY STATE ──────────────────────────────────
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-1">
                      ☁️
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Drag & drop your CT scan here
                    </p>
                    <p className="text-xs text-gray-500">
                      or{" "}
                      <span className="text-blue-600 font-semibold underline">
                        click to browse
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2 bg-white rounded-lg px-3 py-1.5 border border-gray-100">
                      JPG &nbsp;·&nbsp; PNG &nbsp;·&nbsp; WEBP
                      &nbsp;&nbsp;│&nbsp;&nbsp; Max 10 MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          {preview && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Preview
              </p>
              <img
                src={preview}
                alt="CT Scan Preview"
                className="max-h-72 rounded-xl border border-gray-200 mx-auto object-contain bg-gray-50"
              />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading || !file || !patientName.trim()}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Analyzing...
                </span>
              ) : (
                "Analyze CT Scan"
              )}
            </button>
            {(result || file) && (
              <button
                onClick={handleReset}
                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* RESULTS CARD */}
        {result && preview && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            {/* RESULT HEADER */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Analysis Results
              </h3>
              {result.scan && (
                <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                  ✓ Saved to database
                </span>
              )}
            </div>

            {/* PATIENT INFO */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400 text-xs uppercase font-semibold">
                  Patient
                </span>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {patientName}
                </p>
              </div>
              {result.scan && (
                <div>
                  <span className="text-gray-400 text-xs uppercase font-semibold">
                    Scan ID
                  </span>
                  <p className="font-mono text-xs text-gray-600 mt-0.5 truncate">
                    {result.scan.id}
                  </p>
                </div>
              )}
            </div>

            {/* DIAGNOSIS BANNER */}
            <div
              className={`flex items-center gap-4 p-5 rounded-xl border-2 ${
                hasStone
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <span className="text-4xl">{hasStone ? "⚠️" : "✅"}</span>
              <div>
                <p
                  className={`text-lg font-bold ${hasStone ? "text-red-700" : "text-green-700"}`}
                >
                  {hasStone
                    ? "Kidney Stone Detected"
                    : "No Kidney Stone Detected"}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Confidence score:{" "}
                  <strong
                    className={hasStone ? "text-red-600" : "text-green-600"}
                  >
                    {Math.round((result.computed?.confidence ?? 0) * 100)}%
                  </strong>
                </p>
              </div>
            </div>

            {/* DISCLAIMER */}
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>
                <strong>Medical Disclaimer:</strong> This AI analysis is
                intended as a decision-support tool only and does{" "}
                <strong>not</strong> replace diagnosis by a qualified medical
                specialist.
              </span>
            </div>

            {/* VISUALIZATION SETTINGS */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">
                Visualization Settings
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Confidence Threshold</span>
                    <span className="font-semibold text-gray-700">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Overlay Opacity</span>
                    <span className="font-semibold text-gray-700">
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showStone}
                    onChange={() => setShowStone(!showStone)}
                    className="accent-red-500"
                  />
                  <span className="text-gray-700">Kidney Stone</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showAbnormal}
                    onChange={() => setShowAbnormal(!showAbnormal)}
                    className="accent-orange-500"
                  />
                  <span className="text-gray-700">Abnormal</span>
                </label>
              </div>
            </div>

            {/* CT OVERLAY */}
            {filteredPredictions.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Detection Overlay
                </p>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <CTOverlay
                    imageSrc={preview}
                    predictions={filteredPredictions}
                    opacity={opacity}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-28 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                <span className="text-2xl mb-1">🔍</span>
                No detections at current threshold
              </div>
            )}

            {/* DETECTION DETAILS */}
            {filteredPredictions.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Detection Details
                </p>
                <div className="space-y-2">
                  {filteredPredictions.map((p: any, i: number) => {
                    const isStone = p.class?.toLowerCase().includes("stone");
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm ${
                          isStone
                            ? "bg-red-50 border-red-100"
                            : "bg-orange-50 border-orange-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isStone ? "bg-red-500" : "bg-orange-400"
                            }`}
                          />
                          <span className="font-medium text-gray-700">
                            {p.class}
                          </span>
                        </div>
                        <span
                          className={`font-bold ${isStone ? "text-red-600" : "text-orange-500"}`}
                        >
                          {Math.round(p.confidence * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
