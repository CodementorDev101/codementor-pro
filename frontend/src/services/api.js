import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const exerciseAPI = {
  getAll: (params) => api.get('/exercises', { params }),
  getById: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
};

export const submissionAPI = {
  submit: (data) => api.post('/submissions/submit', data),
  getMySubmissions: (params) => api.get('/submissions/my-submissions', { params }),
  getById: (id) => api.get(`/submissions/${id}`),
  getAll: (params) => api.get('/submissions', { params }),
};

export const userAPI = {
  // Profile Management (All users)
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  // Admin User Management
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};

export const statsAPI = {
  getStats: () => api.get('/stats'),
};

// User Management API (Admin only - uses /api/admin/users)
export const userManagementAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// Analytics API (Admin only - uses /api/analytics)
export const analyticsAPI = {
  getOverallStats: () => api.get('/analytics/overall-stats'),
  getExerciseCompletionRates: () => api.get('/analytics/exercise-completion-rates'),
  getMostDifficultExercises: (limit = 5) => api.get('/analytics/most-difficult-exercises', { params: { limit } }),
  getMostPopularExercises: (limit = 5) => api.get('/analytics/most-popular-exercises', { params: { limit } }),
  getStudentPerformance: () => api.get('/analytics/student-performance'),
  getSubmissionsTrend: (days = 7) => api.get('/analytics/submissions-trend', { params: { days } }),
  getLanguageDistribution: () => api.get('/analytics/language-distribution'),
  getDifficultyDistribution: () => api.get('/analytics/difficulty-distribution'),
};

// Instructor Analytics API (Instructor only - uses /api/instructor-analytics)
export const instructorAnalyticsAPI = {
  getStats: () => api.get('/instructor-analytics/stats'),
  getExercises: () => api.get('/instructor-analytics/exercises'),
  getSubmissions: (limit = 10) => api.get('/instructor-analytics/submissions', { params: { limit } }),
  getPerformance: () => api.get('/instructor-analytics/performance'),
};

export default api;