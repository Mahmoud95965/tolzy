import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Tool } from '@/src/types/tool';

// Initialize Firebase Admin SDK for server-side operations
function initAdmin() {
    if (getApps().length === 0) {
        try {
            // For Vercel deployment, use environment variables
            console.log('🔑 initializing admin with project:', process.env.FIREBASE_PROJECT_ID);
            // Handle formatting of the private key
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;

            if (privateKey) {
                // If the key is wrapped in quotes, remove them
                if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                    privateKey = privateKey.slice(1, -1);
                }

                // Replace literal \n with actual newlines
                privateKey = privateKey.replace(/\\n/g, '\n');

                // Ensure it has the correct headers/footers if missing?
                // Usually keys from Env are complete. 
                // Just checking if it looks valid
                if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
                    console.warn('⚠️ FIREBASE_PRIVATE_KEY seems to be missing the PEM header.');
                }
            }

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
export async function getAllToolsFromFirebase(): Promise<Tool[]> {
    try {
        if (!adminDb) {
            console.warn('⚠️ Admin DB not available, returning empty array');
            return [];
        }

        const toolsSnapshot = await adminDb.collection('tools').get();

        const tools = toolsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Tool[];

        console.log(`✅ Fetched ${tools.length} tools from Firebase Admin`);
        return tools;
    } catch (error) {
        console.error('❌ Error fetching tools from Firebase Admin:', error);
        return [];
    }
}

// Helper function to get a single tool by ID
export async function getToolByIdFromFirebase(id: string): Promise<Tool | null> {
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
        } as Tool;
    } catch (error) {
        console.warn(`⚠️ Error fetching tool ${id} from Firebase Admin (falling back to client):`, error.message);
        return null;
    }
}
