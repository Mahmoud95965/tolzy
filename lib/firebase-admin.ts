import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK for server-side operations
function initAdmin() {
    if (getApps().length === 0) {
        try {
            // For Vercel deployment, use environment variables
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

            if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
                console.warn('⚠️ Firebase Admin credentials not found, using client SDK fallback');
                return null;
            }

            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });

            console.log('✅ Firebase Admin initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Firebase Admin:', error);
            return null;
        }
    }

    return getFirestore();
}

export const adminDb = initAdmin();

// Helper function to get all tools for SSR/SSG
export async function getAllToolsFromFirebase() {
    try {
        if (!adminDb) {
            console.warn('⚠️ Admin DB not available, returning empty array');
            return [];
        }

        const toolsSnapshot = await adminDb.collection('tools').get();

        const tools = toolsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(`✅ Fetched ${tools.length} tools from Firebase Admin`);
        return tools;
    } catch (error) {
        console.error('❌ Error fetching tools from Firebase Admin:', error);
        return [];
    }
}

// Helper function to get a single tool by ID
export async function getToolByIdFromFirebase(id: string) {
    try {
        if (!adminDb) {
            console.warn('⚠️ Admin DB not available');
            return null;
        }

        const toolDoc = await adminDb.collection('tools').doc(id).get();

        if (!toolDoc.exists) {
            return null;
        }

        return {
            id: toolDoc.id,
            ...toolDoc.data(),
        };
    } catch (error) {
        console.error(`❌ Error fetching tool ${id} from Firebase Admin:`, error);
        return null;
    }
}
