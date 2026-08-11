import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { setTokenGetter } from '../services/api';
import { authEvents } from '../utils/authEvents';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [fetchingUser, setFetchingUser] = useState(false);

  // Wire Clerk token getter into Axios interceptor
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  // Handle forced logout from 401 errors
  useEffect(() => {
    authEvents.onLogout(() => {
      signOut();
      setUser(null);
    });
  }, [signOut]);

  // Fetch our Prisma user from /auth/me when Clerk signs in
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      fetchUser();
    } else {
      setUser(null);
    }
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  const fetchUser = async () => {
    if (fetchingUser) return;
    setFetchingUser(true);
    try {
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.warn('Error fetching user from /auth/me:', error);
      setUser(null);
    } finally {
      setFetchingUser(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
    }
  };

  const loading = !isLoaded || (isSignedIn === true && user === null && fetchingUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isSignedIn === true && user !== null,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
