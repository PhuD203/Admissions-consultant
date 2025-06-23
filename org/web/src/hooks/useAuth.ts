// src/hooks/useAuth.ts
'use client'; // This is important for client-side hooks

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

// Types (Keep these types here or in a separate types file)
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    userType: string;
    isMainConsultant: boolean;
    kpiGroupId: number;
    employmentDate: string;
    status: string;
    programType: string;
  };
}

interface LoginError {
  message: string;
  status?: number;
}

// Internal hook for login mutation (can be kept internal or exported if needed elsewhere)
export const useLoginMutation = () => { // Renamed to avoid confusion with the public `login` function
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, LoginError, LoginCredentials>({
    mutationFn: async ({ email, password }) => {
      return await authService.login(email, password);
    },
    onSuccess: (data) => {
      // We will handle localStorage in the component for more control,
      // but you can still cache user data here.
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['protected-data'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

// Main authentication hook
export const useAuth = () => {
  const [isClient, setIsClient] = useState(false);
  const loginMutation = useLoginMutation(); // Use the renamed internal mutation hook
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // The 'login' function that components will call
  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await loginMutation.mutateAsync(credentials);
      return result; // Return the result for the component to handle tokens
    } catch (error) {
      throw error; // Re-throw the error so the component can catch it
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    queryClient.clear(); // Clear all cached data
  };

  const isAuthenticated = () => {
    if (!isClient || typeof window === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('accessToken');
  };

  return {
    login, // This is the function you'll call in LoginForm
    logout,
    isAuthenticated,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    isError: loginMutation.isError,
    isSuccess: loginMutation.isSuccess,
    reset: loginMutation.reset,
  };
};

// Hook to get user data from cache
export const useUser = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<LoginResponse['user']>(['user']);
};