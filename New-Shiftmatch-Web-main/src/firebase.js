// src/firebase.js

import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCG34E32g24IduwN1HFdLuXbha46kLuiLU",
  authDomain: "shiftmatch-427ab.firebaseapp.com",
  projectId: "shiftmatch-427ab",
  storageBucket: "shiftmatch-427ab.firebasestorage.app",
  messagingSenderId: "949023183545",
  appId: "1:949023183545:web:6ba213b87490b61ff58168",
  measurementId: "G-JD9546C4YP"
};

const app = initializeApp(firebaseConfig);

// getMessaging requires a secure context (HTTPS or localhost).
// On plain HTTP network access it will throw — guard against that gracefully.
let messaging = null;
isSupported()
  .then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  })
  .catch(() => {
    // Messaging not supported in this environment — silently ignore.
  });

export { messaging };