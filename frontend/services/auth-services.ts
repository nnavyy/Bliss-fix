import api from "./api";

export interface LoginPayload {
  doctorId: string;
  token: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    doctorId: string;
  };
  message?: string;
}

export async function loginDoctor(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const res = await api.post<LoginResponse>("/auth/login", payload);

    if (res.data.success && res.data.data?.accessToken) {
      localStorage.setItem("accessToken", res.data.data.accessToken);
      localStorage.setItem("doctorId", res.data.data.doctorId);
    }


    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Login gagal",
    };
  }
}
