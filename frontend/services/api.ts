import axios from "axios";

const api = axios.create({
  baseURL: "/api", //"/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
console.log("API INSTANCE FROM services/api.ts");

export default api;
