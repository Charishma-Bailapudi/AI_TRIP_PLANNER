import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { authService } from "../services/authService";
import { RegisterInput, LoginInput } from "../../../../../shared/src/validation/auth.schema";
import { AuthUserResponse } from "../../../../../shared/src/types/user";

interface AuthContextType {
  user: AuthUserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and check active session
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await authService.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Token expired or invalid
        localStorage.removeItem("accessToken");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginInput): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        localStorage.setItem("accessToken", response.data.accessToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Please verify credentials.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      if (response.success) {
        // Auto login after registration
        await login({ email: data.email, password: data.password });
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        clearError,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
