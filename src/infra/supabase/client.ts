import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined

export const isMockMode =
  !projectId || projectId === 'SEU_PROJECT_ID' || projectId.includes('SEU_PROJECT_ID')

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) ?? 'placeholder',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) ?? 'placeholder.firebaseapp.com',
  projectId: isMockMode ? 'demo-project' : projectId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) ?? 'placeholder.appspot.com',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) ?? '000000000000',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) ?? '1:000:web:placeholder',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)
export const auth = getAuth(app)
