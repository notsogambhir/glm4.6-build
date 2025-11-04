'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthUser } from '@/types/user';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, collegeId?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserSelections: (updates: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert AuthUser to User
const authUserToUser = (authUser: AuthUser | null): User | null => {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    role: authUser.role,
    collegeId: authUser.collegeId || undefined,
    departmentId: authUser.departmentId || undefined,
    programId: authUser.programId || undefined,
    batchId: authUser.batchId || undefined,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
      console.log('Auth check timed out, setting loading to false');
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('obe-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('obe-user');
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      // First check if we have user data in localStorage
      const storedUser = localStorage.getItem('obe-user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Check if there's a selected batch from login
          const selectedBatch = localStorage.getItem('obe-selected-batch');
          if (selectedBatch && !parsedUser.batchId) {
            // Update user with the selected batch
            const updatedUser = { ...parsedUser, batchId: selectedBatch };
            setUser(authUserToUser(updatedUser));
            localStorage.setItem('obe-user', JSON.stringify(updatedUser));
            localStorage.removeItem('obe-selected-batch');
            console.log('Updated user with selected batch:', updatedUser);
          } else {
            setUser(authUserToUser(parsedUser));
          }
          console.log('Using stored user data:', parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('obe-user');
        }
      }

      // Then verify with server (but don't override if we already have a user)
      const response = await fetch(`/api/auth/me`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(authUserToUser(data.user));
        // Update localStorage with fresh user data
        localStorage.setItem('obe-user', JSON.stringify(data.user));
        console.log('Auth check successful, user:', data.user);
      } else {
        console.log('Auth check failed:', response.status);
        // Only set user to null if we don't have stored data
        if (!storedUser) {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only set user to null if we don't have stored data
      const storedUser = localStorage.getItem('obe-user');
      if (!storedUser) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, collegeId?: string) => {
    console.log('=== FRONTEND LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('College ID:', collegeId);
    
    // Use relative URL to work in both development and production
    console.log('Request URL: /api/auth/login');
    
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, collegeId }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('Login error response:', error);
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful, received data:', data);
      setUser(authUserToUser(data.user));
      
      // Update localStorage with the user data
      localStorage.setItem('obe-user', JSON.stringify(data.user));
      console.log('User data saved to localStorage');
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Use relative URL to work in both development and production
      await fetch(`/api/auth/logout`, { 
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Clear localStorage on logout
      localStorage.removeItem('obe-user');
    }
  };

  const updateUserSelections = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // localStorage will be automatically updated by the useEffect
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserSelections, loading }}>
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

export type { User, AuthUser } from '@/types/user';