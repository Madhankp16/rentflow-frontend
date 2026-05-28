import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7000/api';
const api = axios.create({ baseURL: BASE_URL });

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          if (data.success) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            original.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(original);
          }
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// Assets
export const assetsAPI = {
  getAll: () => api.get('/assets'),
  getById: (id) => api.get(`/assets/${id}`),
  getByQR: (qr) => api.get(`/assets/qr/${qr}`),
  search: (params) => api.get('/assets/search', { params }),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  generateQR: (id) => api.post(`/assets/${id}/generate-qr`),
};

// Bookings
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getById: (id) => api.get(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/my'),
  getAll: (status) => api.get('/bookings', { params: status ? { status } : {} }),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  cancel: (id, reason) => api.delete(`/bookings/${id}`, { params: reason ? { reason } : {} }),
};

// Returns
export const returnsAPI = {
  process: (data) => api.post('/returns', data),
  getByBooking: (bookingId) => api.get(`/returns/booking/${bookingId}`),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.post('/notifications/mark-read'),
};

// Dashboard
export const dashboardAPI = {
  admin: () => api.get('/dashboard/admin'),
  member: () => api.get('/dashboard/member'),
};

export default api;
