export async function scanCTScan(file: File, patientName: string) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("patientName", patientName);

  const headers: HeadersInit = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch("/api/scan", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = "Scan gagal";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return res.json();
}
