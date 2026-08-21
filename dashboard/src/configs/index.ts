export const SERVER_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL =
  SERVER_URL + (import.meta.env.VITE_API_VERSION_PATH || "/api/v1");

export const ASSETS_URL = import.meta.env.VITE_ASSETS_URL || SERVER_URL;


export const MAINTENANCE = "MAINTENANCE";

export const LOCALE_KEY = "LOCALE_KEY";

export const DEFAULT_CACHE_KEY = "default";


