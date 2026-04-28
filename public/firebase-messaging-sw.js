importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBqmpVe3kxO2xVFLHqDXjORxH34YvP1O2E",
  authDomain: "raster-loma.firebaseapp.com",
  projectId: "raster-loma",
  storageBucket: "raster-loma.firebasestorage.app",
  messagingSenderId: "914851028614",
  appId: "1:914851028614:web:276939a1c0bfceb8f63b07",
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
