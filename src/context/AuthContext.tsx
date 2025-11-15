import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Timeout للتأكد من عدم البقاء في حالة التحميل للأبد
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing load completion');
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        if (user.email === 'mahmoud@gmail.com') {
          // Set as admin for mahmoud@gmail.com
          try {
            const adminDocRef = doc(db, 'admins', user.uid);
            await setDoc(adminDocRef, {
              role: 'admin',
              email: user.email,
              createdAt: new Date().toISOString()
            });
            setIsAdmin(true);
          } catch (error) {
            console.warn('Could not set admin role in Firestore:', error);
            setIsAdmin(true); // Still set as admin locally
          }
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      
      // حفظ/تحديث بيانات المستخدم في Firestore
      try {
        const userDocRef = doc(db, 'users', result.user.uid);
        await setDoc(userDocRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          lastLoginAt: new Date().toISOString(),
          role: 'user'
        }, { merge: true }); // merge: true للحفاظ على البيانات الموجودة
        console.log('✅ User data saved/updated in Firestore');
      } catch (firestoreError) {
        console.warn('Could not save user data to Firestore:', firestoreError);
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      // رسائل خطأ أكثر تفصيلاً
      if (error.code === 'auth/popup-closed-by-user') {
        setError('تم إلغاء تسجيل الدخول');
      } else if (error.code === 'auth/popup-blocked') {
        setError('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة');
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول باستخدام جوجل');
      }
      throw error;
    }
  };
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      
      // التحقق من كون المستخدم هو المسؤول
      if (email === 'mahmoud@gmail.com' && result.user) {
        try {
          const adminDocRef = doc(db, 'admins', result.user.uid);
          await setDoc(adminDocRef, {
            role: 'admin',
            email: email,
            createdAt: new Date().toISOString()
          });
          setIsAdmin(true);
        } catch (error) {
          console.warn('Could not set admin role in Firestore:', error);
          setIsAdmin(true); // Still set as admin locally
        }
      }
    } catch (error: any) {
      console.error('Email sign in error:', error);
      
      // رسائل خطأ أكثر تفصيلاً
      if (error.code === 'auth/user-not-found') {
        setError('لا يوجد حساب بهذا البريد الإلكتروني');
      } else if (error.code === 'auth/wrong-password') {
        setError('كلمة المرور غير صحيحة');
      } else if (error.code === 'auth/invalid-email') {
        setError('البريد الإلكتروني غير صحيح');
      } else if (error.code === 'auth/too-many-requests') {
        setError('تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً');
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول');
      }
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      
      // حفظ بيانات المستخدم في Firestore
      try {
        const userDocRef = doc(db, 'users', result.user.uid);
        const displayName = firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0];
        await setDoc(userDocRef, {
          email: email,
          firstName: firstName || '',
          lastName: lastName || '',
          displayName: displayName,
          createdAt: new Date().toISOString(),
          photoURL: null,
          role: 'user'
        });
        console.log('✅ User data saved to Firestore');
      } catch (firestoreError) {
        console.warn('Could not save user data to Firestore:', firestoreError);
        // لا نرمي الخطأ هنا لأن التسجيل نجح في Firebase Auth
      }
    } catch (error: any) {
      console.error('Email sign up error:', error);
      
      // رسائل خطأ أكثر تفصيلاً
      if (error.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مستخدم بالفعل');
      } else if (error.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل');
      } else if (error.code === 'auth/invalid-email') {
        setError('البريد الإلكتروني غير صحيح');
      } else {
        setError('حدث خطأ أثناء إنشاء الحساب');
      }
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // رسائل خطأ أكثر تفصيلاً
      if (error.code === 'auth/user-not-found') {
        setError('لا يوجد حساب بهذا البريد الإلكتروني');
      } else if (error.code === 'auth/invalid-email') {
        setError('البريد الإلكتروني غير صحيح');
      } else {
        setError('حدث خطأ أثناء إعادة تعيين كلمة المرور');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
      setError('حدث خطأ أثناء تسجيل الخروج');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logout,
    isAdmin,
  };

  // Loading screen component
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
