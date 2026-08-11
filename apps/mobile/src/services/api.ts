import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { authEvents } from '../utils/authEvents';

// Module-level token getter — set by AuthContext once Clerk is loaded
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (__DEV__) {
  console.log('🌐 Axios configurado con baseURL:', API_BASE_URL);
}

api.interceptors.request.use(
  async (config) => {
    try {
      const token = _getToken ? await _getToken() : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error obteniendo token Clerk:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const is401 = error.response?.status === 401;
    const isAuthMeEndpoint = error.config?.url?.includes('/auth/me');
    const is404 = error.response?.status === 404;
    const isEventsEndpoint = error.config?.url?.includes('/events/');

    if (__DEV__ && !(is401 && isAuthMeEndpoint) && !(is404 && isEventsEndpoint)) {
      console.error('❌ API Error:', {
        url: `${API_BASE_URL}${error.config?.url}`,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    if (is401) {
      // Clerk handles token refresh automatically — emit logout so UI reacts
      authEvents.emitLogout();
    }

    return Promise.reject(error);
  }
);

export default api;
