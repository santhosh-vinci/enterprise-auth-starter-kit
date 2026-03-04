import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { RefreshResponse } from '../types/auth';
import { tokenStore } from './tokenStore';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const refreshAccessToken = async (): Promise<string> => {
  const response = await axios.post<RefreshResponse>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );

  const { accessToken } = response.data;
  tokenStore.setToken(accessToken);

  return accessToken;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isRefreshCall = originalRequest.url?.includes('/auth/refresh');

    if (status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api.request(originalRequest);
      } catch (refreshError) {
        tokenStore.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
