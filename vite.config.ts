import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function firebaseSwPlugin(env: Record<string, string>) {
  function generate() {
    const content = `importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "${env.VITE_FIREBASE_API_KEY || ''}",
  authDomain: "${env.VITE_FIREBASE_AUTH_DOMAIN || ''}",
  projectId: "${env.VITE_FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${env.VITE_FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${env.VITE_FIREBASE_APP_ID || ''}",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Loma Rastreamento', {
    body: body || '',
    icon: icon || '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.data,
    requireInteraction: true,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.openWindow(url));
});
`
    fs.writeFileSync('public/firebase-messaging-sw.js', content)
  }

  return {
    name: 'firebase-sw',
    buildStart: generate,
    configureServer: generate,
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), firebaseSwPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
