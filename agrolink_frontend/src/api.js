import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL ||"http://127.0.0.1:8000/api/",
});

// Attach token automatically if stored
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use( (response) => response, async (error) => { const originalRequest = error.config; if (error.response?.status === 401 && !originalRequest._retry) { originalRequest._retry = true; const refreshToken = localStorage.getItem("refreshToken"); if (refreshToken) { try { const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh: refreshToken, }); localStorage.setItem("accessToken", res.data.access); API.defaults.headers.Authorization = `Bearer ${res.data.access}`; return API(originalRequest); } catch (refreshError) { console.error("Token refresh failed:", refreshError); } } } return Promise.reject(error); }
);

export default API;
