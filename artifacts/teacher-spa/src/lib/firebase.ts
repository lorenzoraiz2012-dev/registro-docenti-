// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
// Per collegare l'app a Firebase Firestore:
// 1. Vai su https://console.firebase.google.com/
// 2. Crea un nuovo progetto (o usa uno esistente)
// 3. In "Impostazioni progetto" > "App web", registra l'app
// 4. Copia i valori dalla configurazione fornita qui sotto
// 5. Decommentare il codice e inserire le tue credenziali
//
// NOTA: Questi valori sono pubblici ma il progetto è protetto
// dalle Firebase Security Rules configurate nella console.
// ============================================================
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importante per il database
import { getAuth } from "firebase/auth";           // Importante per il login

const firebaseConfig = {
  apiKey: "AIzaSyCsrq0NKZCWq6p7AROuG-q0trdQhw5INdE",
  authDomain: "registro-docente-e34da.firebaseapp.com",
  projectId: "registro-docente-e34da",
  storageBucket: "registro-docente-e34da.firebasestorage.app",
  messagingSenderId: "501048364718",
  appId: "1:501048364718:web:f584e3528d610b29dc273f"
};

// Inizializza Firebase una sola volta
const app = initializeApp(firebaseConfig);

// Esporta i servizi per usarli nelle altre parti dell'app
export const db = getFirestore(app);
export const auth = getAuth(app);
// ============================================================
// FIRESTORE COLLECTIONS da usare nell'app:
//
// - "lessons"   → Collezione lezioni
// - "meetings"  → Collezione riunioni
// - "hearings"  → Collezione udienze
// - "classes"   → Collezione classi con sottocollezione studenti
// - "quickNotes"→ Document "notes" con campo "text"
// ============================================================


// Placeholder: rimuovere questo commento dopo aver configurato Firebase
export {};
