import ky from "ky";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4545";

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 300000,
  retry: {
    limit: 2,
    methods: ["get", "post"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
});
