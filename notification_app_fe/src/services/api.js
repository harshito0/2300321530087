// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000
});

const CLIENT_ID = "c857b680-b7fe-4234-8c67-778511411e71";
const CLIENT_SECRET = "kqHVAaWhMApppsPs";

let cachedToken = null;
let isFetchingToken = false;
let tokenQueue = [];

async function getToken() {
  if (cachedToken) return cachedToken;
  if (isFetchingToken) {
    return new Promise((resolve, reject) => {
      tokenQueue.push({ resolve, reject });
    });
  }

  isFetchingToken = true;
  try {
    const res = await axios.post("http://localhost:3000/evaluation-service/oauth/token", {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });
    cachedToken = res.data.access_token;
    tokenQueue.forEach((q) => q.resolve(cachedToken));
    tokenQueue = [];
    isFetchingToken = false;
    return cachedToken;
  } catch (err) {
    tokenQueue.forEach((q) => q.reject(err));
    tokenQueue = [];
    isFetchingToken = false;
    throw err;
  }
}

api.interceptors.request.use(async (config) => {
  if (config.url.includes("/evaluation-service/notifications")) {
    const token = await getToken();
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config.retryCount = config.retryCount || 0;
    const maxRetries = 3;

    if (error.response && error.response.status === 401 && config.retryCount < maxRetries) {
      config.retryCount += 1;
      cachedToken = null;
      const token = await getToken();
      config.headers["Authorization"] = `Bearer ${token}`;
      return api(config);
    }

    if (error.response && error.response.status === 503 && config.retryCount < maxRetries) {
      config.retryCount += 1;
      await new Promise((r) => setTimeout(r, 1000));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
