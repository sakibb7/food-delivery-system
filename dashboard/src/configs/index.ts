/** @format */

export const SERVER_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL =
  SERVER_URL + (import.meta.env.VITE_API_VERSION_PATH || "/api/v1");

export const ASSETS_URL = import.meta.env.VITE_ASSETS_URL || SERVER_URL;

export const TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || "token";

export const APP_BASE_URL = import.meta.env.VITE_BASE_URL;

export const ONBOARDING_POSITION = "ONBOARDING_POSITION";

export const MAINTENANCE = "MAINTENANCE";

export const LOCALE_KEY = "LOCALE_KEY";

export const DEFAULT_CACHE_KEY = "default";
/**
 * server side api urls with cache keys
 */
export const SERVER_SIDE_API_URLS = {
  INFO: {
    url: "/info",
    cacheKey: "info",
  },
  ROBOTS: {
    url: "/app-robots",
    cacheKey: "app-robots",
  },
  SITEMAP: {
    url: "/app-sitemap",
    cacheKey: "app-sitemap",
  },
  PAGES: {
    url: "/pages",
    cacheKey: "pages",
  },
  MENUS: {
    url: "/menus",
    cacheKey: "menus",
  },
  TRANSLATION: {
    url: "/lang",
    cacheKey: "lang",
  },
};
/**
 * onboarding steps
 */
export const ONBOARDING_STEPS = {
  verification: {
    value: "verification",
    url: "/verify-otp",
  },
  kyc: {
    value: "kyc",
    url: "/kyc",
  },
  waiting: {
    value: "waiting",
    url: "/waiting",
  },
  completed: {
    value: "completed",
    url: "/dashboard/profile",
  },
};

/**
 * check if the user is trying to access protected paths without a valid token also check if the user is verifying their email or phone
 * if the user is not authenticated, redirect to the sign-in page
 * if the user is authenticated and trying to access the verification or kyc page, redirect
 */
export const PROTECTED_PATHS = [
  "/dashboard",
  "/payment",
  "/checkout",
  "/play/contest",
  "/play/quiz",
  "/games",
];
