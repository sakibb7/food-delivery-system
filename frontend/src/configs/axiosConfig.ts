import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL, MAINTENANCE } from ".";

// Dedicated axios instance for token refresh — no interceptors to avoid infinite loops
const TokenRefreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
});

export const publicInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
});

export const privateInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  },
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

// ─── Request interceptor (single, deduplicated) ───────────────────────────────
privateInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_NAME ?? "token");
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────
privateInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const config = error?.config;

    // ── Token refresh ──────────────────────────────────────────────────────────
    if (status === 401 && data?.errorCode === "InvalidAccessToken") {
      // Queue subsequent requests while a refresh is already in flight
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config });
        });
      }

      isRefreshing = true;

      try {
        await TokenRefreshClient.get("/auth/refresh");

        // Re-read the new token set by the server (via cookie) and update defaults
        const newToken = Cookies.get(
          process.env.NEXT_PUBLIC_TOKEN_NAME ?? "token",
        );
        privateInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newToken}`;

        processQueue(null);
        return privateInstance(config); // retry original request
      } catch (refreshError) {
        processQueue(refreshError);

        Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_NAME ?? "token");
        window.location.href = `/sign-in?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Existing 401 redirect (non-refresh-related) ────────────────────────────
    if (status === 401) {
      Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_NAME ?? "token");
      const pathname = window.location.pathname;
      if (
        pathname.startsWith("/profile") ||
        pathname.startsWith("/create-profile")
      ) {
        window.location.href = "/sign-in";
      }
    }

    // ── Maintenance mode ───────────────────────────────────────────────────────
    if (status === 503) {
      Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_NAME ?? "token");
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
      Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_NAME ?? "token");
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

export const updatePrivateAxiosInstance = (token: string) => {
  privateInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};
