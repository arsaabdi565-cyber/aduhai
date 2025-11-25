import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Read env vars
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

const isConfigured = Boolean(apiKey && authDomain && projectId && appId);

let app: any = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

if (isConfigured) {
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };

  try {
    app = initializeApp(firebaseConfig);
    _auth = getAuth(app);
    _db = getFirestore(app);
  } catch (e) {
    // If initialization fails, keep nulls and continue (app won't crash)
    // eslint-disable-next-line no-console
    console.warn('Firebase initialization failed:', e);
    _auth = null;
    _db = null;
  }
} else {
  // Not configured - log info for developer
  // eslint-disable-next-line no-console
  console.info('Firebase not configured. To enable cloud sync, fill .env.local with Firebase credentials.');
}

// Provide a safe `auth` export that always has `onAuthStateChanged` to avoid runtime errors
export const auth: Auth = (_auth as Auth) || ({
  onAuthStateChanged: (cb: (user: any) => void) => {
    // Immediately call back with null (not authenticated)
    cb(null);
    // Return unsubscribe noop
    return () => {};
  },
} as unknown as Auth);

export const db: Firestore | null = _db;

export default app;
