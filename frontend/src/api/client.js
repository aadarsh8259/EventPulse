
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints that do not require an access token.
const publicEndpoints = [
  "/register/",
  "/token/",
  "/token/refresh/",
];

// Attach the access token only to protected API requests.
apiClient.interceptors.request.use(
  (config) => {
    const requestPath = (config.url || "").split("?")[0];

    const isPublicEndpoint = publicEndpoints.some(
      (endpoint) => requestPath.endsWith(endpoint)
    );

    // Never send an old token with registration or login requests.
    if (isPublicEndpoint) {
      if (config.headers) {
        if (typeof config.headers.delete === "function") {
          config.headers.delete("Authorization");
        } else {
          delete config.headers.Authorization;
        }
      }

      return config;
    }

    // Read the access token from localStorage.
    const accessToken = localStorage.getItem("access");

    if (accessToken) {
      if (typeof config.headers.set === "function") {
        config.headers.set(
          "Authorization",
          `Bearer ${accessToken}`
        );
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } else if (config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Authorization");
      } else {
        delete config.headers.Authorization;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
