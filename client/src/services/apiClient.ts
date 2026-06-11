import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds
});

// Request Interceptor: Attach access token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Format responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the formatted custom standard response data
    return response.data;
  },
  (error) => {
    // If unauthorized (401), we can handle redirection or refresh token calls
    if (error.response?.status === 401) {
      // Handle logout or trigger token refresh routine
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(error.response?.data || error.message);
  },
);

export default apiClient;
export { apiClient };
