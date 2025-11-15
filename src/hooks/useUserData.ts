import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  role: string;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          // إذا لم توجد بيانات في Firestore، استخدم بيانات Firebase Auth
          setUserData({
            email: user.email || '',
            firstName: '',
            lastName: '',
            displayName: user.displayName || user.email?.split('@')[0] || 'المستخدم',
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            role: 'user'
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // في حالة الخطأ، استخدم بيانات Firebase Auth
        setUserData({
          email: user.email || '',
          firstName: '',
          lastName: '',
          displayName: user.displayName || user.email?.split('@')[0] || 'المستخدم',
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          role: 'user'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return { userData, loading };
};
