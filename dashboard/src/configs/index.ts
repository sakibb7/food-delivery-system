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

