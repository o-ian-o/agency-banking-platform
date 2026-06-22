import axios from "axios";

// In a real app, load this from .env (e.g., import.meta.env.VITE_API_KEY)
const API_KEY = "agent-app-dev-key-7f3a9b2c1e4d";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY,
  },
});

// Response interceptor for centralized error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Response:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default apiClient;
