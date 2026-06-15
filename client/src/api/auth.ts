import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth` : 'http://localhost:3000/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const authApi = {
  generateOtp: async (data: { email: string; name: string }) => {
    const response = await api.post('/otp-generate', data);
    return response.data;
  },
  
  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await api.post('/otp-verify', data);
    return response.data;
  },
};
