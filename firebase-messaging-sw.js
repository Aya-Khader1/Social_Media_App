/* global importScripts, firebase */
// Service worker for background push notifications.
// MUST live at the site root (/firebase-messaging-sw.js) — the browser
// only allows a service worker to control pages at or below its own path.

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

// same web config as the page — safe to expose, these are public identifiers
firebase.initializeApp({
  apiKey: "AIzaSyDcCHZyDHgDhKICIRlWCV3k2hoDho-hc-M",
  authDomain: "social-media-819cf.firebaseapp.com",
  projectId: "social-media-819cf",
  storageBucket: "social-media-819cf.firebasestorage.app",
  messagingSenderId: "571017638128",
  appId: "1:571017638128:web:7cca64e97019db87819235",
  measurementId: "G-6D8EKMF83E",
});
const messaging = firebase.messaging();

// fires when a push arrives while the tab is closed or in the background
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] background message:", payload);

  self.registration.showNotification(
    payload.notification?.title ?? "Social App",
    {
      body: payload.notification?.body ?? "",
      data: payload.data,
      requireInteraction: true,
    },
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
