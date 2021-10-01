import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const provider = new GoogleAuthProvider();

const staticMapKey = '';
const dynamicApiKey = '';

export { db, auth, provider, staticMapKey, dynamicApiKey };
