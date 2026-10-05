import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studymate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid/expired and redirect if not on login/register page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('studymate_token');
        localStorage.removeItem('studymate_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service functions
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  seedDemoData: () => api.post('/auth/seed')
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data)
};

export const subjectService = {
  getSubjects: () => api.get('/subjects'),
  createSubject: (data) => api.post('/subjects', data),
  updateSubject: (id, data) => api.put(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`)
};

export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  deleteTask: (id) => api.delete(`/tasks/${id}`)
};

export const sessionService = {
  getSessions: (params) => api.get('/study-sessions', { params }),
  createSession: (data) => api.post('/study-sessions', data),
  updateSession: (id, data) => api.put(`/study-sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/study-sessions/${id}`)
};

export const goalService = {
  getGoals: () => api.get('/goals'),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`)
};

export const progressService = {
  getProgress: () => api.get('/progress')
};

export const timerService = {
  recordSession: (data) => api.post('/timer', data),
  getHistory: () => api.get('/timer/history')
};

export default api;
