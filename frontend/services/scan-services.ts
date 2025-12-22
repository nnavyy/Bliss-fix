export async function scanCTScan(file: File, patientName: string) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("patientName", patientName);



  const res = await fetch("/api/scan", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Scan gagal");
  }

  return res.json();
}
