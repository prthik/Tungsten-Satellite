// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvlq7dpBwJXOREMNK5SMl04T49ZaAuoaQ",
  authDomain: "nasa-space-apps-813ba.firebaseapp.com",
  projectId: "nasa-space-apps-813ba",
  storageBucket: "nasa-space-apps-813ba.firebasestorage.app",
  messagingSenderId: "580187416591",
  appId: "1:580187416591:web:d46192819b2e694ec31b7a",
  measurementId: "G-CEJ4L7YYRJ",
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
