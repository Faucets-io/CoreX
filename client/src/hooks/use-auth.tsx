import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has an active session by making a test request
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('fluxtrade_user');
        console.log('AuthProvider initializing, stored user:', storedUser ? 'found' : 'not found');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Verify the session is still valid by fetching user data
          const response = await fetch(`/api/user/${parsedUser.id}`, {
            credentials: 'include'
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Session expired, clear stored data
            localStorage.removeItem('fluxtrade_user');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('fluxtrade_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.log('Login failed:', error);
        throw new Error(error.message || 'Invalid email or password');
      }

      const userData = await response.json();
      console.log('Login successful, user data received');

      // Store user data in localStorage
      localStorage.setItem('fluxtrade_user', JSON.stringify(userData));

      // Update state
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem('fluxtrade_user', JSON.stringify(userData));
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user/${user.id}`);
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('fluxtrade_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fluxtrade_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}