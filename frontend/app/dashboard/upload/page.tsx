"use client";

import { useState } from "react";
import { readDicomMetadata } from "@/lib/dicom-reader";
import { dicomToImage } from "@/lib/dicom-image";

export default function UploadCTScanPage() {
  const [metadata, setMetadata] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    // 1️⃣ baca metadata pasien
    const meta = await readDicomMetadata(file);
    setMetadata(meta);

    // 2️⃣ convert DICOM → image
    const canvas = await dicomToImage(file);
    const imageBase64 = canvas.toDataURL("image/png");

    setPreview(imageBase64);

    // 3️⃣ KIRIM ke Roboflow (nanti)
    /*
      fetch("ROBOFLOW_API", {
        method: "POST",
        body: imageBase64
      })
    */
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <input
        type="file"
        accept=".dcm"
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
      />

      {metadata && (
        <div className="bg-gray-100 p-4 rounded text-sm">
          <p><b>Nama Pasien:</b> {metadata.patientName}</p>
          <p><b>ID Pasien:</b> {metadata.patientId}</p>
          <p><b>Jenis Kelamin:</b> {metadata.patientSex}</p>
          <p><b>Umur:</b> {metadata.patientAge}</p>
        </div>
      )}

      {preview && (
        <img src={preview} alt="CT Scan Preview" className="rounded" />
      )}
    </div>
  );
}
