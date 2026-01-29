import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDKw-lfTtDF3nUrkkTvpcl5x-o9TT1YJYA",
  authDomain: "codeshare-1rerz.firebaseapp.com",
  projectId: "codeshare-1rerz",
  storageBucket: "codeshare-1rerz.firebasestorage.app",
  messagingSenderId: "184673938457",
  appId: "1:184673938457:web:ca97136c5a234c4359ce88",
  measurementId: "G-W86M2YX4Q0"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
