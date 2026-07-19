import React, { useState } from "react";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { baseUrl, notify, urls } from "../constants/config";
import { setupFCM } from "../utils/fcm";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { loginSchema } from "../schemas/loginSchema";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isLoggingIn) return;

    // ── Zod validation ──────────────────────────────────────────
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
      });
      return; // stop — do NOT hit the API
    }
    setErrors({ email: "", password: "" }); // clear errors on success
    // ────────────────────────────────────────────────────────────


    try {
      setIsLoggingIn(true);

      const response = await fetch(
        `${baseUrl}${urls?.authentication?.login}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      const success = data.success;
      const message = data.message;
      console.log(success);
      console.log(message)

      if (success) {
        const userData = data.data.userData;
        if (userData.roleId === 3) {
          notify(false, "You are not authorized to login");
        }
        else {
          sessionStorage.setItem("token", data.data.token);
          sessionStorage.setItem("userId", userData._id);
          sessionStorage.setItem("roleId", userData.roleId);
          console.log(userData.fcm);
          const fcmTokens = userData.fcm;
          const fcmToken = await setupFCM();
          if (fcmTokens.includes(fcmToken)) {
          }
          else {
            console.log(data.data.token);
            await fetch(
              `${baseUrl}${urls?.users?.updateFcm}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${data.data.token}`,
                },
                body: JSON.stringify({
                  fcm: fcmToken,
                  type: "Login",
                }),
              }
            );
          }




          // if (fcmToken) {
          //   sessionStorage.setItem("fcmToken", fcmToken);

          //   // if(fcmToken === userData.fcm){
          //   //   navigate("/dasboard")
          //   // }
          //   // else{
          //   //     notify(false,"Please login with same device")
          //   //     return;
          //   // }
          // }
          notify(true, message);
          if (userData.roleId === 1) {
            navigate("/dashboard2");
          } else {
            navigate("/dashboard");
          }

        }
      } else {
        notify(false, message);
      }
    } catch (error) {
      notify(false, "Server error");
    } finally {
      setIsLoggingIn(false);
    }
  };







  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full md:w-1/2 bg-[#4A42B8] flex flex-col items-center justify-center text-white py-10 md:h-screen">
        {/* Logo */}
        <div className="w-full flex flex-col items-center text-white pt-2 pb-10">
          <img
            src="/logo.png"
            alt="ShiftMatch Logo"
            className="w-[220px] md:w-[420px] object-contain mt-2"
          />

          <div className="flex flex-col items-center -mt-16 md:-mt-20">
            <h3 className="text-xl md:text-3xl font-semibold text-white tracking-wide">
              You're in safe hands
            </h3>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-white flex items-center justify-center py-10 md:py-0">
        <div className="w-[90%] md:w-[420px]">

          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Welcome Back
          </h2>

          <p className="text-gray-500 mb-8">
            To keep connected with us login with your personal info
          </p>

          {/* Email */}
          <div className="mb-5">
            <div className="relative">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
                className={`w-full pl-12 pr-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 ${
                  errors.email ? "ring-2 ring-red-400" : "focus:ring-[#4039AD]"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 pl-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5">
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "" })); }}
                className={`w-full pl-12 pr-12 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 ${
                  errors.password ? "ring-2 ring-red-400" : "focus:ring-[#4039AD]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <HiOutlineEyeOff className="text-lg" />
                ) : (
                  <HiOutlineEye className="text-lg" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 pl-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm mb-8">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="accent-[#4039AD]" />
              Remember me?
            </label>

            <button
              onClick={() => setShowForgotModal(true)}
              className="text-[#4039AD] hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full py-3 rounded-lg font-semibold text-white bg-[#4039AD] hover:opacity-90 transition"
          >
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </button>

        </div>
      </div>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
};

export default Login;