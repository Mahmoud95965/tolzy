import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // التحقق من صلاحيات المسؤول بناءً على البريد الإلكتروني
  const isAdmin = user?.email === 'mahmoud@gmail.com';

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
