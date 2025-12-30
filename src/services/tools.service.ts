import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Tool } from '../types/index';

export const convertFirestoreDoc = (doc: QueryDocumentSnapshot<DocumentData>): Tool => {
  const data = doc.data();

  // معالجة أسماء حقول مختلفة للصور
  let imageUrl = data.imageUrl || data.image || data.logo || data.icon || data.img || '';

  // إصلاح المسارات النسبية للصور
  if (imageUrl && imageUrl.startsWith('public/')) {
    // تحويل public/image/tools/xxx.png إلى /image/tools/xxx.png
    imageUrl = imageUrl.replace('public/', '/');
  } else if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    // إذا كان المسار نسبي بدون public، أضف /
    imageUrl = '/' + imageUrl;
  }

  return {
    ...data,
    id: doc.id,
    imageUrl: imageUrl, // تأكد من وجود imageUrl
    votes: data.votes || { helpful: [], notHelpful: [] },
    savedBy: data.savedBy || [],
    votingStats: data.votingStats || {
      helpfulCount: 0,
      notHelpfulCount: 0,
      totalVotes: 0
    },
    isNew: data.isNew || false,
    isFeatured: data.isFeatured || false,
    isPopular: data.isPopular || false
  } as Tool;
};

export const getFeaturedTools = async (maxTools: number = 4) => {
  try {
    const toolsRef = collection(db, 'tools');
    const q = query(
      toolsRef,
      where('isFeatured', '==', true),
      orderBy('rating', 'desc'),
      limit(maxTools)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreDoc);
  } catch (error: unknown) {
    console.error('Error getting featured tools:', error);
    throw error;
  }
};

export const getPopularTools = async (maxTools: number = 4) => {
  try {
    const toolsRef = collection(db, 'tools');
    const q = query(
      toolsRef,
      where('isPopular', '==', true),
      orderBy('rating', 'desc'),
      limit(maxTools)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreDoc);
  } catch (error: unknown) {
    console.error('Error getting popular tools:', error);
    throw error;
  }
};

export const getNewTools = async (maxTools: number = 4) => {
  try {
    const toolsRef = collection(db, 'tools');
    const q = query(
      toolsRef,
      where('isNew', '==', true),
      orderBy('submittedAt', 'desc'),
      limit(maxTools)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreDoc);
  } catch (error: unknown) {
    console.error('Error getting new tools:', error);
    throw error;
  }
};

export const getToolById = async (id: string) => {
  try {
    const normalizedId = id.toString().padStart(3, '0');
    const toolRef = doc(db, 'tools', normalizedId);
    const snapshot = await getDoc(toolRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      ...snapshot.data(),
      id: snapshot.id
    } as Tool;
  } catch (error: unknown) {
    console.error('Error getting tool by ID:', error);
    throw error;
  }
};