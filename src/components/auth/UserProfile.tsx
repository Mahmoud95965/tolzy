import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { LogOut, User } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { userData } = useUserData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-3 space-x-reverse focus:outline-none">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User profile'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          )}
        </div>
        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
          {userData?.displayName || user.displayName || user.email || 'المستخدم'}
        </span>
      </button>

      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">        <div className="py-1" role="menu" aria-orientation="vertical">
          {isAdmin && (
            <Link
              to="/admin/tools-review"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              لوحة التحكم
            </Link>
          )}
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <User className="h-4 w-4 ml-2" />
            الملف الشخصي
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;