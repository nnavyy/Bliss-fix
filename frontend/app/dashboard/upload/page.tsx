"use client";

import { useState } from "react";
import { scanCTScan } from "@/services/scan-services";
import CTOverlay from "@/components/ct-overlay";
import { saveHistory } from "@/services/history-service";

// ===============================
// prediction to result logic
// ===============================
function determineResult(predictions: any[]) {
  const stoneDetected = predictions.some(
    (p) =>
      p.class.toLowerCase().includes("stone") &&
      p.confidence >= 0.5
  );

  return stoneDetected ? "Batu Ginjal" : "Normal";
}

export default function UploadCTScanPage() {
  const [patientName, setPatientName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ===============================
  // VISUALIZATION SETTINGS (UI ONLY)
  // ===============================
  const [confidence, setConfidence] = useState(0.5);
  const [opacity, setOpacity] = useState(0.4);

  // toggle class
  const [showStone, setShowStone] = useState(true);
  const [showAbnormal, setShowAbnormal] = useState(true);

  const rawPredictions = result?.result?.predictions || [];

  // ===============================
  // FILTER LOGIC (VISUAL ONLY)
  // ===============================
  const filteredPredictions = rawPredictions.filter((p: any) => {
    const isStone = p.class.toLowerCase().includes("stone");
    const isAbnormal = p.class.toLowerCase().includes("abnormal");

    if (isStone && !showStone) return false;
    if (isAbnormal && !showAbnormal) return false;

    return p.confidence >= confidence;
  });

  // ===============================
  // FIX: STATUS TIDAK TERGANTUNG SLIDER
  // ===============================
  const diagnosis = result
    ? determineResult(rawPredictions)
    : "Normal";

  const hasStone = diagnosis === "Batu Ginjal";

  const handleFileChange = (file: File) => {
    setFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!file || !patientName) {
      alert("Nama pasien dan file CT Scan wajib diisi");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await scanCTScan(file, patientName);
      setResult(res);

      // ===============================
      // FIX: SAVE HISTORY SETELAH SCAN
      // ===============================
      const predictions = res?.result?.predictions || [];
      const finalResult = determineResult(predictions);

      saveHistory({
        id: `CT-${Date.now()}`,
        patientName,
        date: new Date().toLocaleString("id-ID"),
        image: preview!, // preview aman karena upload sudah ada
        result: finalResult,
        confidence: Math.max(
          ...predictions.map((p: any) => p.confidence),
          0
        ),
        predictions, // RAW predictions (BUKAN filtered)
      });
    } catch (err) {
      console.error(err);
      alert("Gagal memproses CT Scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Upload CT Scan</h1>
          <p className="text-gray-600 text-sm mt-1">
            Unggah citra CT Scan ginjal untuk dianalisis oleh sistem AI
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          {/* NAMA PASIEN */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Pasien
            </label>
            <input
              type="text"
              placeholder="Contoh: Nanda Zhafran"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* FILE */}
          <div>
            <label className="block text-sm font-medium mb-2">
              File CT Scan
            </label>

            <div className="border-2 border-dashed rounded-xl p-6 text-center bg-gray-50">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                id="ct-upload"
                onChange={(e) =>
                  e.target.files && handleFileChange(e.target.files[0])
                }
              />

              <label
                htmlFor="ct-upload"
                className="cursor-pointer text-blue-600 font-medium"
              >
                Klik untuk memilih file
              </label>

              <p className="text-xs text-gray-500 mt-2">
                Format: JPG, PNG, JPEG, WEBP
              </p>
            </div>
          </div>

          {/* PREVIEW */}
          {preview && (
            <div>
              <p className="text-sm font-medium mb-2">Preview CT Scan</p>
              <img
                src={preview}
                alt="Preview"
                className="max-h-80 rounded-lg border mx-auto"
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Analisis CT Scan"}
          </button>
        </div>

        {/* HASIL */}
        {result && preview && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold">Hasil Analisis</h3>

            <p className="text-sm">
              Pasien: <b>{result.patientName}</b>
            </p>

            {/* STATUS */}
            <p
              className={`font-semibold ${
                hasStone ? "text-red-600" : "text-green-600"
              }`}
            >
              {hasStone
                ? "⚠️ Terdeteksi Batu Ginjal"
                : "✅ Tidak Terdeteksi Batu Ginjal"}
            </p>

            {/* SETTINGS */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm">
                Pengaturan Visualisasi
              </h4>

              <div>
                <label className="text-xs">
                  Confidence ({Math.round(confidence * 100)}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={confidence}
                  onChange={(e) =>
                    setConfidence(Number(e.target.value))
                  }
                />
              </div>

              <div>
                <label className="text-xs">
                  Opacity ({Math.round(opacity * 100)}%)
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(e) =>
                    setOpacity(Number(e.target.value))
                  }
                />
              </div>

              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showStone}
                    onChange={() => setShowStone(!showStone)}
                  />
                  Batu Ginjal
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showAbnormal}
                    onChange={() =>
                      setShowAbnormal(!showAbnormal)
                    }
                  />
                  Abnormal
                </label>
              </div>
            </div>

            {/* OVERLAY */}
            {filteredPredictions.length > 0 && (
              <CTOverlay
                imageSrc={preview}
                predictions={filteredPredictions}
                opacity={opacity}
              />
            )}

            {/* DETAIL */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                Detail Deteksi:
              </p>

              <ul className="text-sm space-y-1">
                {filteredPredictions.map(
                  (p: any, i: number) => (
                    <li key={i}>
                      • <b>{p.class}</b> —{" "}
                      {Math.round(p.confidence * 100)}%
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
