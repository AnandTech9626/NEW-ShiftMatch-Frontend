import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

export const setupFCM = async (setLiveNotification, audioRef) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    // messaging is null when FCM is unsupported (e.g. plain HTTP on network)
    if (!messaging) {
      console.warn("FCM not available in this context (requires HTTPS or localhost).");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log("✅ FCM TOKEN:", token);

    // 🔥 FOREGROUND MESSAGE (POPUP)
    onMessage(messaging, (payload) => {
      console.log("🔥 Foreground message:", payload);

      const title =
        payload.notification?.title || payload.data?.title;

      const body =
        payload.notification?.body || payload.data?.body;

      if (setLiveNotification) {
        setLiveNotification({
          title,
          body,
        });

        setTimeout(() => {
          setLiveNotification(null);
        }, 5000);
      }

      if (audioRef?.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    });

    return token;
  } catch (error) {
    console.error("FCM Setup Error:", error);
    return null;
  }
};