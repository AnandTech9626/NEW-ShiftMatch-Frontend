import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ToastContainer } from "react-toastify";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import Login from "./Authentication.jsx/Login";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import AddFacility from "./pages/AddFacility";

const App = () => {

  const [liveNotification, setLiveNotification] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {

    let unsubscribe;

    const setupFCM = async () => {
      try {

        console.log("Requesting Notification Permission");

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.log(" Notification permission denied");
          return;
        }

        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        console.log(" Service Worker Registered:", registration);

        // messaging is null when running over plain HTTP (network IP) — FCM requires HTTPS
        if (!messaging) {
          console.warn("FCM not available (requires HTTPS or localhost). Skipping push notifications.");
          return;
        }

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        console.log(" FCM TOKEN:", token);

        sessionStorage.setItem("fcmToken", token);

        unsubscribe = onMessage(messaging, (payload) => {

          console.log(" FOREGROUND MESSAGE:", payload);

          const title =
            payload.notification?.title ||
            payload.data?.title ||
            "New Notification";

          const body =
            payload.notification?.body ||
            payload.data?.body ||
            "";

          if (Notification.permission === "granted") {
            navigator.serviceWorker.getRegistration().then((reg) => {
              reg.showNotification(title, {
                body: body,
                icon: "/logo.png",
                badge: "/logo.png"
              });
            });
          }

          setLiveNotification({
            title,
            body,
            id: Date.now()
          });

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
          }

          setTimeout(() => {
            setLiveNotification(null);
          }, 5000);

        });

      } catch (error) {
        console.error("FCM Setup Error:", error);
      }
    };

    setupFCM();

    return () => {
      if (unsubscribe) unsubscribe();
    };

  }, []);

  return (
    <>

      {/*  Notification Sound */}
      <audio
        ref={audioRef}
        src="/notification.mp3"
        preload="auto"
      />

      {/*  POPUP NOTIFICATION */}
      {liveNotification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">

          <div className="bg-white border shadow-xl w-80 rounded-xl p-4">

            <div className="flex justify-between items-start">

              <div>
                <h4 className="font-semibold text-gray-800 text-sm">
                  {liveNotification.title}
                </h4>

                <p className="text-xs text-gray-500 mt-1">
                  {liveNotification.body}
                </p>
              </div>

              <button
                onClick={() => setLiveNotification(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>

            </div>

            <button className="mt-3 bg-[#4039AD] text-white text-xs px-3 py-1 rounded">
              Check Now
            </button>

          </div>

        </div>
      )}

      <BrowserRouter>

        <ToastContainer />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard2" element={<Dashboard2 />} />
          <Route path="/add-facility" element={<AddFacility />} />
          <Route path="/login" element={<Login />} />

        </Routes>

      </BrowserRouter>

    </>
  );
};

export default App;