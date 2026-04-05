const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// Use Vite proxy in local dev; otherwise prefer explicit env var.
export const API_BASE_URL =
  envApiBaseUrl || (isLocalhost ? 'http://localhost:5000/api' : '/api');

