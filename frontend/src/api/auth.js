import axios from 'axios';

const API_URL = 'http://localhost:5000/auth';

// Set up Axios interceptor to add token to headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const logout = async () => {
    try {
        await axios.post(`${API_URL}/logout`);
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const sendOtp = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/send-otp`, { email });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const verifyOtp = async (email, otp) => {
    try {
        const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};