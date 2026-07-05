import axios from 'axios';

// 🌐 Base URL of our Spring Boot backend
const BASE_URL = 'http://192.168.1.8:8080';

// 🧠 Why 10.0.2.2?
// Android emulator uses 10.0.2.2 to reach localhost on your laptop
// On real device you'd use your laptop's IP address like 192.168.1.x

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Auth APIs
export const authAPI = {
  register: (username, email, password) =>
    api.post('/api/auth/register', { username, email, password }),

  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
};

export default api;