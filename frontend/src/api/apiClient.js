import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": "your-secure-secret-key",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("agency_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      config.headers["X-USER-ID"] = user.id;
      config.headers["X-USER-ROLE"] = user.role;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
