"use client";
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { useUserData } from '../hooks/useUserData';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import SavedTools from '../components/tools/SavedTools';
import { updateProfile } from 'firebase/auth';
import { User, Camera, Loader, Mail, Calendar, Shield, Settings, Edit2, Check, X, Award, Heart, Bookmark, Activity, Upload, BookOpen, FileText } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';


const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { tools, isLoading: isLoadingTools } = useTools();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(userData?.firstName || '');
  const [lastName, setLastName] = useState(userData?.lastName || '');

  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const storage = getStorage();

  // التحقق من صلاحيات المسؤول
  const isAdmin = userData?.role === 'admin' || user?.email === 'mahmoud@gmail.com';

  // Update local state when userData loads
  React.useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');

    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [userData, user]);

  // Auto-hide success message
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Get saved tools
  const savedTools = tools.filter(tool => tool.savedBy?.includes(user?.uid || ''));

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار صورة صالحة');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress(0);

      // Create a safe filename without special characters
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const safeFileName = `profile_${timestamp}.${fileExtension}`;

      // Upload image to Firebase Storage
      const storageRef = ref(storage, `profile-images/${user.uid}/${safeFileName}`);

      console.log('📤 Uploading image to:', `profile-images/${user.uid}/${safeFileName}`);

      const uploadResult = await uploadBytes(storageRef, file);
      setUploadProgress(40);

      console.log('✅ Upload complete, getting download URL...');

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      setUploadProgress(60);

      console.log('🔗 Download URL:', downloadURL);

      // Update user profile in Firebase Auth
      await updateProfile(auth.currentUser!, {
        photoURL: downloadURL
      });
      setUploadProgress(80);

      console.log('✅ Updated Firebase Auth');

      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        photoURL: downloadURL,
        updatedAt: new Date().toISOString()
      });
      setUploadProgress(100);

      console.log('✅ Updated Firestore');

      setSuccess('تم تحديث الصورة بنجاح!');

      // Force refresh to show new image
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      console.error('❌ Error uploading image:', err);
      console.error('Error details:', err.message, err.code);
      setError('حدث خطأ أثناء تحميل الصورة: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('يرجى إدخال الاسم الأول والأخير');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Update displayName in Firebase Auth
      const newDisplayName = `${firstName.trim()} ${lastName.trim()}`;
      await updateProfile(auth.currentUser!, {
        displayName: newDisplayName
      });

      // Update user data in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: newDisplayName,
        updatedAt: new Date().toISOString()
      });

      setSuccess('تم تحديث الملف الشخصي بنجاح!');
      setIsEditing(false);

      // Force refresh to show new name
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 animate-fade-in-down">
            <div className="bg-green-50 dark:bg-green-900/30 border-r-4 border-green-500 rounded-lg p-4 flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 animate-fade-in-down">
            <div className="bg-red-50 dark:bg-red-900/30 border-r-4 border-red-500 rounded-lg p-4 flex items-center gap-3">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl shadow-lg overflow-hidden mb-8 animate-fade-in border border-slate-200 dark:border-slate-700">
          <div className="relative h-32 bg-gradient-to-r from-slate-200/80 to-blue-100/80 dark:from-slate-700/80 dark:to-slate-600/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 dark:to-black/20"></div>
          </div>

          <div className="relative px-6 pb-6">
            {/* Profile Image */}
            <div className="flex items-start justify-between -mt-16">
              <div className="relative">
                {/* Image Container */}
                <div className="relative group cursor-pointer">
                  <label htmlFor="photo-upload" className="cursor-pointer block">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="h-32 w-32 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl group-hover:scale-105 transition-all duration-300">
                        <User className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center">
                        <Loader className="h-8 w-8 text-white animate-spin mb-2" />
                        <div className="text-white text-sm font-bold">{uploadProgress}%</div>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    {!isLoading && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                        <Camera className="h-8 w-8 text-white mb-2" />
                        <p className="text-sm font-bold text-white">تغيير الصورة</p>
                      </div>
                    )}
                  </label>

                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                </div>

                {/* Camera Button Badge */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-2.5 shadow-lg border-2 border-white dark:border-gray-800">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-all duration-300 shadow-md border border-slate-200 dark:border-slate-600"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    إلغاء
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" />
                    تعديل الملف
                  </>
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="mt-4 text-slate-800 dark:text-slate-100">
              <h2 className="text-3xl font-bold mb-2 animate-fade-in">
                {userData?.displayName || user?.displayName || 'مستخدم'}
              </h2>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                  <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">{user?.email}</span>
                </div>
                {userData?.createdAt && (
                  <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                    <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">عضو منذ {new Date(userData.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}
                {userData?.role === 'admin' && (
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-amber-700 dark:text-amber-300">مدير</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">الأدوات المحفوظة</p>
                <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{savedTools.length}</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-xl">
                <Bookmark className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">الأدوات المفضلة</p>
                <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                  {tools.filter(t => t.savedBy?.includes(user?.uid || '') && t.isFeatured).length}
                </p>
              </div>
              <div className="bg-rose-100 dark:bg-rose-900/20 p-4 rounded-xl">
                <Heart className="h-8 w-8 text-rose-500 dark:text-rose-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">النشاط</p>
                <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">نشط</p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/20 p-4 rounded-xl">
                <Activity className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl overflow-hidden mb-8 border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              معلومات الحساب
            </h3>
          </div>

          {/* Profile content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="group">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      الاسم الأول <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 dark:bg-slate-700 dark:text-white transition-all duration-300 hover:border-slate-400"
                        placeholder="أحمد"
                        dir="rtl"
                        required
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="group">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      الاسم الأخير <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 dark:bg-slate-700 dark:text-white transition-all duration-300 hover:border-slate-400"
                        placeholder="محمد"
                        dir="rtl"
                        required
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        disabled
                        className="block w-full pr-10 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        dir="rtl"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">لا يمكن تغيير البريد الإلكتروني</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                      setFirstName(userData?.firstName || '');
                      setLastName(userData?.lastName || '');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    الاسم الأول
                  </dt>
                  <dd className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {userData?.firstName || 'غير محدد'}
                  </dd>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    الاسم الأخير
                  </dt>
                  <dd className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {userData?.lastName || 'غير محدد'}
                  </dd>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </dt>
                  <dd className="text-lg font-bold text-slate-800 dark:text-slate-100 break-all">
                    {user?.email}
                  </dd>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    نوع الحساب
                  </dt>
                  <dd className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    {userData?.role === 'admin' ? (
                      <>
                        <Award className="h-5 w-5 text-yellow-500" />
                        مدير
                      </>
                    ) : (
                      'مستخدم'
                    )}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        {/* Admin Dashboard Section - للمسؤولين فقط */}
        {isAdmin && (
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">لوحة تحكم المسؤول</h3>
                    <p className="text-indigo-100 text-sm">إدارة وتحكم كامل بالموقع</p>
                  </div>
                </div>
                <Settings className="h-6 w-6 text-white/80" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* رفع الأدوات */}
                <Link
                  href="/admin/upload-tools"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-xl p-6 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">رفع الأدوات</h4>
                      <p className="text-sm text-indigo-100">
                        رفع أدوات جديدة من ملفات JSON أو Excel
                      </p>
                      <div className="mt-3 flex items-center text-white text-sm font-medium">
                        <span>الذهاب إلى الصفحة</span>
                        <svg className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* إدارة Tolzy Learn */}
                <Link
                  href="/admin/tolzy-learn"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-xl p-6 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">إدارة Tolzy Learn</h4>
                      <p className="text-sm text-indigo-100">
                        إضافة وتعديل المحتوى التقني والدورات
                      </p>
                      <div className="mt-3 flex items-center text-white text-sm font-medium">
                        <span>الذهاب إلى الصفحة</span>
                        <svg className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* إدارة الأخبار */}
                <Link
                  href="/admin/tolzy-learn?tab=news"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-xl p-6 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">إدارة الأخبار</h4>
                      <p className="text-sm text-indigo-100">
                        نشر وتعديل الأخبار والمقالات
                      </p>
                      <div className="mt-3 flex items-center text-white text-sm font-medium">
                        <span>الذهاب إلى الأخبار</span>
                        <svg className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* لوحة التحكم الرئيسية */}
                <Link
                  href="/admin"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-xl p-6 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">لوحة التحكم</h4>
                      <p className="text-sm text-indigo-100">
                        نظرة عامة وإحصائيات
                      </p>
                      <div className="mt-3 flex items-center text-white text-sm font-medium">
                        <span>الذهاب للوحة التحكم</span>
                        <svg className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-sm text-indigo-100 text-center">
                  🎉 مرحباً بك في لوحة التحكم! يمكنك الآن إدارة جميع الأقسام بسهولة
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Saved Tools Section */}
        <div className="mt-8">
          {isLoadingTools ? (
            <div className="flex justify-center py-4">
              <Loader className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : (
            <SavedTools tools={savedTools} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
