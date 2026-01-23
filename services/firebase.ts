
import * as firebase from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Fix for ImportMeta env type error by casting to any
const env = (import.meta as any).env;

// Usa variáveis de ambiente (Vercel) ou fallback para valores fixos fornecidos
const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY || "AIzaSyB56DwaPzvAW-jNVKJLXqIVv6cEA2y3hbw",
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || "minetask-c8186.firebaseapp.com",
  databaseURL: env?.VITE_FIREBASE_DB_URL || "https://minetask-c8186-default-rtdb.firebaseio.com",
  projectId: env?.VITE_FIREBASE_PROJECT_ID || "minetask-c8186",
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET || "minetask-c8186.firebasestorage.app",
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "579509559103",
  appId: env?.VITE_FIREBASE_APP_ID || "1:579509559103:web:399538c5f64eddbe1ebd8a"
};

// Singleton para inicialização do Firebase para evitar múltiplas instâncias
const app = !firebase.getApps().length ? firebase.initializeApp(firebaseConfig) : firebase.getApp();

// Exporta o banco de dados passando explicitamente a URL do config
export const db = getDatabase(app, firebaseConfig.databaseURL);
