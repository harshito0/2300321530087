// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000
});

// You can add request/response interceptors here (e.g., auth token, logging)

export default api;
