// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Helper to read required Firebase environment variables
const getEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize app only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Named export `auth` (this is what your pages import)
export const auth = getAuth(app);

// Analytics should only run in the browser. Call initAnalytics() from client code if you want analytics.
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  try {
    if (await isSupported()) {
      return getAnalytics(app);
    }
  } catch (e) {
    // analytics not supported / blocked
    return null;
  }
  return null;
}

// Also export app if you need it elsewhere
export default app;
