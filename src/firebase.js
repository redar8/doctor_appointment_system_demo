import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBLFMwuJ0fUat9vyIPvDmbHFGoYN51SLSQ",
  authDomain: "redarstore-22fa9.firebaseapp.com",
  projectId: "redarstore-22fa9",
  storageBucket: "redarstore-22fa9.appspot.com",
  messagingSenderId: "530277072525",
  appId: "1:530277072525:web:1dd5c126479063193b2cc4",
  measurementId: "G-KZMTFHWRE1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Realtime Database
const realtimeDb = getDatabase(app);

// Export the services
export { db, auth, realtimeDb };
