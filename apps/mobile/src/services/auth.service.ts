import api from './api';
import { User } from '../types';

class AuthService {
  async getCurrentUserInfo(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
}

export const authService = new AuthService();
