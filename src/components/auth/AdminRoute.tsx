"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Checking admin privileges based on email
  const isAdmin = user?.email === 'mahmoud@gmail.com';

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (!user || !isAdmin) {
    return null; // or a loader while redirecting
  }

  return <>{children}</>;
};

export default AdminRoute;
