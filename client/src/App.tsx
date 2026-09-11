import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { Landing } from './app/Landing';
import { Login } from './features/auth/Login';
import { VerifyOTP } from './features/auth/VerifyOTP';
import { CitizenShell } from './features/citizen/CitizenShell';
import { AuthorityShell } from './features/authority/AuthorityShell';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route 
        path="/citizen/*" 
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
            <CitizenShell />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/authority/*" 
        element={
          <ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']}>
            <AuthorityShell />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
