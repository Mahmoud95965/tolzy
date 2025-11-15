import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

interface NewsletterSubscription {
  email: string;
  subscribedAt: string;
  locale: string;
}

export const subscribeToNewsletter = async (email: string, locale: string = 'ar'): Promise<boolean> => {
  try {
    const newsletterCollection = collection(db, 'newsletter-subscribers');
    await addDoc(newsletterCollection, {
      email,
      subscribedAt: new Date().toISOString(),
      locale
    } as NewsletterSubscription);
    
    return true;
  } catch (error) {
    console.error('خطأ في الاشتراك في النشرة البريدية:', error);
    return false;
  }
};
