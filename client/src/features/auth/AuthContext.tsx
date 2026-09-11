import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  _id: string;
  phone: string;
  role: 'CITIZEN' | 'AUTHORITY' | 'ADMIN';
};

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In Phase 0, we'll try to fetch /me using the refresh token if access token is absent.
    // For simplicity here, we assume user is null initially.
    setLoading(false);
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setAccessToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
