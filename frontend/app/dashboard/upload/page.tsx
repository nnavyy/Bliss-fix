"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/protected-route";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan upload gambar CT-Scan terlebih dahulu");
      return;
    }

    setLoading(true);

    /**
     * NOTE:
     * Backend & ML belum ada
     * nanti di sini:
     * - kirim file ke API
     * - terima hasil prediksi
     */
    setTimeout(() => {
      setLoading(false);
      alert("Simulasi upload berhasil (backend belum aktif)");
    }, 1500);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-xl bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Upload CT-Scan Ginjal
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                File CT-Scan
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img
                  src={preview}
                  alt="Preview CT Scan"
                  className="w-full max-h-64 object-contain border rounded"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Upload & Analisis"}
            </button>
          </form>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            * Saat ini hanya simulasi UI. Backend & model ML akan ditambahkan.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
