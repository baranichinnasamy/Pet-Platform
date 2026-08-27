import axios from 'axios';
import type { ApiResponse, AuthResponse, User, Pet, DashboardStats } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post<ApiResponse<AuthResponse>>('/api/auth/refresh', {
            refreshToken,
          });
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', payload),
  login: (payload: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', payload),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  getProfile: () => api.get<ApiResponse<User>>('/auth/profile'),
};

export const petApi = {
  getAll: (params?: { mine?: boolean; species?: string; page?: number }) =>
    api.get<ApiResponse<{ pets: Pet[]; pagination: { page: number; limit: number; total: number } }>>('/pets', { params }),
  getById: (id: string) => api.get<ApiResponse<Pet>>(`/pets/${id}`),
  create: (payload: Partial<Pet>) => api.post<ApiResponse<Pet>>('/pets', payload),
  update: (id: string, payload: Partial<Pet>) => api.put<ApiResponse<Pet>>(`/pets/${id}`, payload),
  delete: (id: string) => api.delete(`/pets/${id}`),
};

export const adminApi = {
  getDashboard: () => api.get<ApiResponse<DashboardStats>>('/admin/dashboard'),
  getUsers: (page = 1) => api.get('/admin/users', { params: { page } }),
  getPendingListings: () => api.get('/admin/listings/pending'),
  approveListing: (id: string) => api.post(`/admin/listings/${id}/approve`),
};

export default api;
