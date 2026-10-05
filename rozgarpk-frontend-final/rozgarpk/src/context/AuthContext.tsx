import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../api/services';
import { connectSocket, disconnectSocket } from '../services/socket';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'worker' | 'admin';
  city: string;
  area: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: 'client' | 'worker') => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string; email: string; phone: string;
  password: string; role: 'client' | 'worker';
  city: string; area: string;
}

interface ProfileUpdateData {
  name: string; email: string; phone: string; city: string; area: string;
  currentPassword?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const savedToken = localStorage.getItem('rozgar_token');
      const savedUser = localStorage.getItem('rozgar_user');

      if (!savedToken || !savedUser) {
        localStorage.removeItem('rozgar_token');
        localStorage.removeItem('rozgar_user');
        if (mounted) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        disconnectSocket();
        return;
      }

      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        connectSocket(savedToken);

        const response = await authAPI.getMe();
        if (!mounted || localStorage.getItem('rozgar_token') !== savedToken) return;
        const currentUser = response.data.data;
        localStorage.setItem('rozgar_user', JSON.stringify(currentUser));
        setUser(currentUser);
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 401 || status === 404) {
          localStorage.removeItem('rozgar_token');
          localStorage.removeItem('rozgar_user');
          if (mounted) {
            setToken(null);
            setUser(null);
          }
          disconnectSocket();
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'rozgar_token' || event.key === null) void restoreSession();
    };

    void restoreSession();
    window.addEventListener('storage', handleStorageChange);
    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string, role?: 'client' | 'worker') => {
    try {
      const response = await authAPI.login({ email, password, role });
      const { user: userData, token: jwt } = response.data.data;

      localStorage.setItem('rozgar_token', jwt);
      localStorage.setItem('rozgar_user', JSON.stringify(userData));

      setToken(jwt);
      setUser(userData);
      connectSocket(jwt);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (data: RegisterData) => {
    const response = await authAPI.register(data);
    const { user: userData, token: jwt } = response.data.data;

    localStorage.setItem('rozgar_token', jwt);
    localStorage.setItem('rozgar_user', JSON.stringify(userData));

    setToken(jwt);
    setUser(userData);
    connectSocket(jwt);
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    const response = await authAPI.updateMe(data);
    const { user: userData, token: jwt } = response.data.data;

    localStorage.setItem('rozgar_user', JSON.stringify(userData));
    localStorage.setItem('rozgar_token', jwt);
    setUser(userData);
    setToken(jwt);
    connectSocket(jwt);
  };

  const logout = () => {
    localStorage.removeItem('rozgar_token');
    localStorage.removeItem('rozgar_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      login, register, updateProfile, logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
