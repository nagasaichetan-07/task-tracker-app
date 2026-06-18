/**
 * ============================================================
 * FIREBASE INITIALIZATION & SETUP INSTRUCTIONS
 * ============================================================
 * 
 * 1. Create a Firebase Project:
 *    - Go to https://console.firebase.google.com/
 *    - Click "Add Project" and follow the wizard.
 * 
 * 2. Enable Google Sign-In:
 *    - Navigate to Build > Authentication.
 *    - Click "Get Started", then select the "Sign-in method" tab.
 *    - Click "Add new provider" and select "Google".
 *    - Enable Google provider, configure the support email, and Save.
 * 
 * 3. Create a Cloud Firestore Database:
 *    - Navigate to Build > Firestore Database.
 *    - Click "Create database", select "Start in production mode",
 *      and pick a regional location close to your users.
 * 
 * 4. Configure Security Rules:
 *    - Select the "Rules" tab in Firestore Database.
 *    - Paste the following security rules and click "Publish":
 * 
 *      rules_version = '2';
 *      service cloud.firestore {
 *        match /databases/{database}/documents {
 *          match /users/{userId}/{document=**} {
 *            allow read, write: if request.auth != null
 *              && request.auth.uid == userId;
 *          }
 *        }
 *      }
 * 
 * 5. Configure Local Environment Variables:
 *    - Copy the Web App credentials from Project Settings > General > Your apps.
 *    - Create a `.env` file in the root of the project (e:\Task Tracker App)
 *      and paste your configuration values:
 * 
 *      VITE_FIREBASE_API_KEY=your_api_key_here
 *      VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
 *      VITE_FIREBASE_PROJECT_ID=your_project_id_here
 *      VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
 *      VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
 *      VITE_FIREBASE_APP_ID=your_app_id_here
 * ============================================================
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
