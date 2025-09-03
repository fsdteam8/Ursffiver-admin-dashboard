import axios from "axios";
import { getSession } from "next-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (email: string, password: string, otp: string) =>
    api.post("/auth/reset-password", { email, password, otp }),
};

// User API functions
export const userApi = {
  getAllUsers: (page = 1, limit = 20) =>
    api.get(`/user/all-user?page=${page}&limit=${limit}`),
  getSingleUser: (userId: string) => api.get(`/user/single-user/${userId}`),
};

// Interest API functions
export const interestApi = {
  // ... other existing functions ...
  createCategory: (name: string) =>
    api.post("/interest/create-category", { name }),
  getCategories: () => api.get("/interest/categories"),
  updateCategory: (id: string, name: string) =>
    api.patch(`/interest/category/${id}`, { name }),
  createInterest: (data: { name: string; categoryId: string; color: string }) =>
    api.post("/interest/create-interest", {
      nameAndColor: [{ name: data.name, color: data.color }],
      interestCategory: data.categoryId,
    }),
  getInterests: () => api.get("/interest/"),
  updateInterest: (id: string, data: any) =>
    api.patch(`/interest/update-interest/${id}`, data),
  deleteInterest: (id: string) => api.delete(`/interest/delete-interest/${id}`),
  // Add deleteCategory function
  deleteCategory: (id: string) => api.delete(`/interest/category/${id}`),
};

// Badge API functions
export const badgeApi = {
  createBadge: (data: {
    name: string;
    tag: string;
    info: string;
    color: string;
  }) => api.post("/badges/", data),
  getBadges: (page = 1, limit = 20) =>
    api.get(`/badges/?page=${page}&limit=${limit}`),
  getSingleBadge: (id: string) => api.get(`/badges/${id}`),
  updateBadge: (
    id: string,
    data: { name: string; tag: string; info: string; color: string }
  ) => api.put(`/badges/${id}`, data),
  deleteBadge: (id: string) => api.delete(`/badges/${id}`),
};

// Report API functions
export const reportApi = {
  createReport: (formData: FormData) =>
    api.post("/reports/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getReports: (page = 1, limit = 20) =>
    api.get(`/reports/?page=${page}&limit=${limit}`),
  getSingleReport: (id: string) => api.get(`/reports/${id}`),
  updateReport: (id: string, data: any) => api.put(`/reports/${id}`, data),
  resolveReport: (id: string) => api.patch(`/reports/${id}/resolve`),
  deleteReport: (id: string) => api.delete(`/reports/${id}`),
};

export const interestsApi = interestApi;
export const reportsApi = reportApi;
