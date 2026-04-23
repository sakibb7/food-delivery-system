import axios, { type AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL, MAINTENANCE } from ".";

// Dedicated axios instance for token refresh — no interceptors to avoid infinite loops
const TokenRefreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const publicInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const privateInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Track ongoing refresh to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: any;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      resolve(privateInstance(config));
    }
  });
  failedQueue = [];
};


// ─── Response interceptor ─────────────────────────────────────────────────────
privateInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const config = error?.config;

    // ── Token refresh ──────────────────────────────────────────────────────────
    // When the access token expires, silently refresh and retry the request.
    // ProtectedRoute handles all auth redirects — no window.location here.
    if (
      status === 401 &&
      data?.errorCode === "InvalidAccessToken" &&
      !config?._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config });
        });
      }

      isRefreshing = true;
      config._retry = true; // prevent infinite refresh loops

      try {
        await TokenRefreshClient.get("/auth/refresh");

        processQueue(null);
        return privateInstance(config); // retry original request
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Maintenance mode ───────────────────────────────────────────────────────
    if (status === 503) {
      Cookies.set(MAINTENANCE, "true");
      window.location.href = "/maintenance";
    } else if (
      [400, 500, 403, 404, 200, 201].includes(status) &&
      Cookies.get(MAINTENANCE)
    ) {
      Cookies.remove(MAINTENANCE);
    }

    return Promise.reject(error);
  },
);

publicInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 503) {

      Cookies.set(MAINTENANCE, "true");
      window.location.href = "/maintenance";
    } else if (
      [400, 500, 403, 404, 200, 201].includes(status) &&
      Cookies.get(MAINTENANCE)
    ) {
      Cookies.remove(MAINTENANCE);
    }

    return Promise.reject(error);
  },
);
