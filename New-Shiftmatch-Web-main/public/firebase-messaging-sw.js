importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

console.log("🔥 Service Worker Loaded");

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCG34E32g24IduwN1HFdLuXbha46kLuiLU",
  authDomain: "shiftmatch-427ab.firebaseapp.com",
  projectId: "shiftmatch-427ab",
  messagingSenderId: "949023183545",
  appId: "1:949023183545:web:6ba213b87490b61ff58168",
});

console.log("🔥 Firebase Initialized in SW");

const messaging = firebase.messaging();



// FORCE INSTALL
self.addEventListener("install", (event) => {
  console.log("🔥 Service Worker Installing...");
  self.skipWaiting();
});

// FORCE ACTIVATE
self.addEventListener("activate", (event) => {
  console.log("🔥 Service Worker Activated");
  event.waitUntil(self.clients.claim());
});


self.addEventListener("push", function (event) {
  console.log("🔥 Push event received:", event);
 
  const payload = event.data?.json();
  console.log("Payload:", payload);
 
  const title = payload.data?.title || "New Notification";
  const body = payload.data?.body || "";
 
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: "/logo.png",
      badge: "/logo.png",
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        url: payload.data?.url || "/"
      }
    })
  );
});

// 🔥 BACKGROUND MESSAGE HANDLER
// messaging.onBackgroundMessage(function (payload) {
//   console.log("🔥🔥 BACKGROUND MESSAGE RECEIVED:", payload);

//   const {title,body,url} = payload.data;

//   const options = {
//     body: body,
//     icon: "/logo.png",
//     badge: "/logo.png",
//     requireInteraction: true,
//     vibrate: [200, 100, 200],
//     data: {
//       url: url
//     }
//   };

//   self.registration
//     .showNotification(title, options)
//     .then(() => console.log("✅ Notification Shown Successfully"))
//     .catch((err) => console.error("❌ Notification Error:", err));
// });


// 🔥 CLICK HANDLER
// self.addEventListener("notificationclick", function (event) {
//   console.log("🔥 Notification Clicked");

//   event.notification.close();

//   const targetUrl = event.notification.data?.url || "/";

//   event.waitUntil(
//     clients.matchAll({ type: "window", includeUncontrolled: true })
//       .then(function (clientList) {
//         for (const client of clientList) {
//           if (client.url.includes(targetUrl) && "focus" in client) {
//             return client.focus();
//           }
//         }
//         if (clients.openWindow) {
//           return clients.openWindow(targetUrl);
//         }
//       })
//   );
// });