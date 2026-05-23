"use client";

import { useState, useRef } from "react";
import { scanCTScan } from "@/services/scan-services";
import CTOverlay from "@/components/ct-overlay";
import { saveHistoryLocal } from "@/services/history-service";

function determineResult(predictions: any[]): "Batu Ginjal" | "Normal" {
  const stoneDetected = predictions.some(
    (p) => p.class?.toLowerCase().includes("stone") && p.confidence >= 0.5,
  );
  return stoneDetected ? "Batu Ginjal" : "Normal";
}

// Simple Icon Components
const UploadIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
const FileIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
const ErrorIcon = () => (
  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const SuccessIcon = () => (
  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function UploadCTScanPage() {
  const [patientName, setPatientName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Upload CT Scan</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Upload a kidney CT scan image to receive an AI-powered analysis
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
          {/* PATIENT NAME */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Patient Name <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. John Smith"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none disabled:bg-gray-50 transition duration-200"
            />
          </div>

          {/* FILE UPLOAD */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              CT Scan File <span className="text-blue-600">*</span>
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
                  ? "cursor-not-allowed opacity-60 bg-gray-50"
                  : isDragging
                    ? "border-blue-500 bg-blue-50 scale-[1.01] shadow-lg shadow-blue-100"
                    : file
                      ? "border-blue-400 bg-blue-50/50 hover:border-blue-500"
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
                  e.target.value = "";
                }}
                disabled={loading}
              />

              {isDragging && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-blue-50/80 backdrop-blur-sm z-10 pointer-events-none">
                  <UploadIcon />
                  <p className="text-blue-600 font-bold text-sm mt-3">
                    Drop your file here
                  </p>
                </div>
              )}

              <div className="p-10 text-center">
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileIcon />
                    </div>
                    <p className="text-sm font-semibold text-blue-800 mt-2">
                      {file.name}
                    </p>
                    <p className="text-xs text-blue-600/70 font-medium">
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
                      className="mt-2 text-xs text-gray-400 hover:text-red-600 font-medium transition"
                    >
                      Remove file
                    </button>
                  </div>
                ) : dropError ? (
                  <div className="flex flex-col items-center gap-2">
                    <ErrorIcon />
                    <p className="text-sm font-semibold text-red-600 mt-2">
                      {dropError}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropError(null);
                      }}
                      className="mt-2 text-xs text-blue-600 hover:underline font-medium"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-2 text-blue-500">
                      <UploadIcon />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      Drag & drop your CT scan here
                    </p>
                    <p className="text-xs text-gray-500">
                      or{" "}
                      <span className="text-blue-600 font-semibold underline">
                        click to browse
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-3 bg-white rounded-md px-3 py-1.5 border border-gray-100 font-medium">
                      JPG &nbsp;&middot;&nbsp; PNG &nbsp;&middot;&nbsp; WEBP
                      &nbsp;&nbsp;|&nbsp;&nbsp; Max 10 MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          {preview && (
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Image Preview
              </p>
              <img
                src={preview}
                alt="CT Scan Preview"
                className="max-h-72 rounded-xl border border-gray-200 mx-auto object-contain bg-gray-50/50"
              />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50/50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <ErrorIcon />
              <span className="font-medium mt-0.5">{error}</span>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={loading || !file || !patientName.trim()}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition duration-200 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 shadow-sm shadow-blue-600/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full" />
                  Analyzing Scan...
                </span>
              ) : (
                "Analyze CT Scan"
              )}
            </button>
            {(result || file) && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition duration-200 text-sm font-medium disabled:opacity-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* RESULTS CARD */}
        {result && preview && (
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* RESULT HEADER */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Analysis Results
              </h3>
              {result.scan && (
                <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Saved to database
                </span>
              )}
            </div>

            {/* PATIENT INFO */}
            <div className="bg-gray-50 rounded-xl px-5 py-4 text-sm grid grid-cols-2 gap-4 border border-gray-100">
              <div>
                <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">
                  Patient Name
                </span>
                <p className="font-semibold text-gray-900 mt-1">
                  {patientName}
                </p>
              </div>
              {result.scan && (
                <div>
                  <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">
                    Scan Reference ID
                  </span>
                  <p className="font-mono text-xs text-gray-600 mt-1.5 truncate bg-white px-2 py-1 rounded border border-gray-200 w-fit">
                    {result.scan.id}
                  </p>
                </div>
              )}
            </div>

            {/* DIAGNOSIS BANNER */}
            <div
              className={`flex items-center gap-5 p-6 rounded-xl border ${
                hasStone
                  ? "bg-red-50/50 border-red-200 text-red-900"
                  : "bg-green-50/50 border-green-200 text-green-900"
              }`}
            >
              <div className={`p-3 rounded-full ${hasStone ? "bg-red-100" : "bg-green-100"}`}>
                {hasStone ? <ErrorIcon /> : <SuccessIcon />}
              </div>
              <div>
                <p className={`text-xl font-bold ${hasStone ? "text-red-700" : "text-green-700"}`}>
                  {hasStone
                    ? "Kidney Stone Detected"
                    : "No Kidney Stone Detected"}
                </p>
                <p className="text-sm font-medium mt-1 opacity-80">
                  Confidence Score:{" "}
                  <strong className={hasStone ? "text-red-700" : "text-green-700"}>
                    {Math.round((result.computed?.confidence ?? 0) * 100)}%
                  </strong>
                </p>
              </div>
            </div>

            {/* DISCLAIMER */}
            <div className="flex items-start gap-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
              <div className="mt-0.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="leading-relaxed">
                <span className="font-semibold text-gray-900">Clinical Disclaimer:</span> This AI analysis is
                intended as a decision-support tool only. It does not replace professional diagnosis by a qualified medical specialist.
              </p>
            </div>

            {/* VISUALIZATION SETTINGS */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 space-y-5">
              <h4 className="font-semibold text-sm text-gray-900">
                Visualization Controls
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span className="font-medium">Confidence Threshold</span>
                    <span className="font-bold text-blue-600">
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
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span className="font-medium">Overlay Opacity</span>
                    <span className="font-bold text-blue-600">
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

              <div className="flex gap-8 text-sm pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={showStone}
                    onChange={() => setShowStone(!showStone)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-gray-900 transition">Show Kidney Stones</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={showAbnormal}
                    onChange={() => setShowAbnormal(!showAbnormal)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-gray-900 transition">Show Abnormalities</span>
                </label>
              </div>
            </div>

            {/* CT OVERLAY */}
            {filteredPredictions.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Detection Overlay
                </p>
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                  <CTOverlay
                    imageSrc={preview}
                    predictions={filteredPredictions}
                    opacity={opacity}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
                <div className="w-8 h-8 text-gray-300 mb-2">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                No detections at current threshold
              </div>
            )}

            {/* DETECTION DETAILS */}
            {filteredPredictions.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Detection Details
                </p>
                <div className="space-y-2">
                  {filteredPredictions.map((p: any, i: number) => {
                    const isStone = p.class?.toLowerCase().includes("stone");
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-5 py-3 rounded-xl border text-sm ${
                          isStone
                            ? "bg-red-50/50 border-red-100"
                            : "bg-orange-50/50 border-orange-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2 h-2 rounded-full shadow-sm ${
                              isStone ? "bg-red-500 shadow-red-200" : "bg-orange-400 shadow-orange-200"
                            }`}
                          />
                          <span className="font-semibold text-gray-800">
                            {p.class}
                          </span>
                        </div>
                        <span
                          className={`font-bold ${isStone ? "text-red-600" : "text-orange-600"}`}
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
