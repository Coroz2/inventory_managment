// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "inventory-managment-f566d.firebaseapp.com",
  projectId: "inventory-managment-f566d",
  storageBucket: "inventory-managment-f566d.appspot.com",
  messagingSenderId: "288602851988",
  appId: "1:288602851988:web:af59c7cd8130c642a10281",
  measurementId: "G-SGLPVSP4S9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
      if (supported) {
        const analytics = getAnalytics(app);
      }
    });
}
const firestore = getFirestore(app);

export {firestore}