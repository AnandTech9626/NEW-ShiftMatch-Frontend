import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl, notify, urls } from "../constants/config";
import { useEffect } from "react";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { forgotEmailSchema, resetPasswordSchema, otpSchema } from "../schemas/forgotPasswordSchema";

const ForgotPasswordModal = ({ onClose }) => {

  const navigate = useNavigate(); const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailResending, setEmailResending] = useState(false);
  const [step1Error, setStep1Error] = useState("");
  const [step2Error, setStep2Error] = useState("");
  const [step3Errors, setStep3Errors] = useState({ newPassword: "", confirmPassword: "" });


  // ── Helper: returns true if the roleId is NOT allowed to use forgot password ──
  const isRoleDisabledForForgotPassword = (roleId) => {
    const disabledRoles = [3]; // roleId 3 is blocked; roleId 1 & 2 are allowed
    return disabledRoles.includes(roleId);
  };

  const handleSendOtp = async () => {
    // ── Zod validation ──
    const result = forgotEmailSchema.safeParse({ email: forgotEmail });
    if (!result.success) {
      setStep1Error(result.error.flatten().fieldErrors.email?.[0] || "");
      return;
    }
    setStep1Error("");

    try {
      setIsProcessing(true);

      const res = await fetch(
        `${baseUrl}${urls?.authentication?.forgetPassword}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      const data = await res.json();
      const success = data.success;
      const message = data.message;

      if (success) {
        const roleId = data.data?.roleId;

        // Use helper to check if this role is disabled for forgot password
        if (isRoleDisabledForForgotPassword(roleId)) {
          setStep1Error("Forgot password is not available for this account.");
          return;
        }

        // roleId 1 & 2 — proceed normally
        notify(true, message);
        setStep(2);
        setEmailTimer(60);
      } else {
        setStep1Error(message || "An error occurred");
      }

    } catch {
      notify(false, "Server error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePassword = async () => {
    // ── Zod validation ──
    const result = resetPasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      // fieldErrors won't have confirmPassword for refine errors — check formErrors
      const formErrors = result.error.flatten();
      setStep3Errors({
        newPassword: formErrors.fieldErrors.newPassword?.[0] || "",
        confirmPassword: formErrors.fieldErrors.confirmPassword?.[0] || formErrors.formErrors?.[0] || "",
      });
      return;
    }
    setStep3Errors({ newPassword: "", confirmPassword: "" });

    try {
      setIsProcessing(true);

      const res = await fetch(
        `${baseUrl}${urls?.authentication?.resetPassword}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotEmail,
            password: newPassword,
          }),
        }
      );

      const data = await res.json();
      const success = data.success;
      const message = data.message;

      if (success) {
        notify(true, message);
        onClose();
      } else {
        notify(false, message);
      }
    } catch {
      notify(false, "Server error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    // ── Zod validation ──
    const result = otpSchema.safeParse({ otp });
    if (!result.success) {
      setStep2Error(result.error.flatten().fieldErrors.otp?.[0] || "");
      return;
    }
    setStep2Error("");

    const mode = "Email";
    const emailMobile = forgotEmail;
    const type = "ForgotPassword";

    try {
      setIsProcessing(true);

      const res = await fetch(
        `${baseUrl}${urls?.otps?.verifyOtp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: mode,
            emailMobile: emailMobile,
            otp: otp,
            type: type,
          }),
        }
      );

      const data = await res.json();
      const success = data.success;
      const message = data.message;

      if (success) {
        notify(true, message);
        setStep(3);
      } else {
        setStep2Error(message || "Invalid OTP");
      }
    } catch {
      notify(false, "Server error");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (step !== 2 || emailTimer === 0) return;

    const interval = setInterval(() => {
      setEmailTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, emailTimer]);

  const handleResendOtp = async () => {
    if (emailTimer > 0 || emailResending) return;
    setStep2Error("");
    try {
      setEmailResending(true);

      const res = await fetch(
        `${baseUrl}${urls?.otps?.resendOtp}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "Email",
            emailMobile: forgotEmail,
            type: "ForgotPassword"
          }),
        }
      );

      const data = await res.json();
      const success = data.success;
      const message = data.message;


      if (success) {
        notify(true, message);
        setEmailTimer(60);
      } else {
        notify(false, message);
      }

    } catch {
      notify(false, "Server error");
    } finally {
      setEmailResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <HiOutlineShieldCheck />
            </div>
            <h2 className="font-semibold text-gray-800">
              {step === 1 && "Reset Password"}
              {step === 2 && "Verification"}
              {step === 3 && "Security Update"}
            </h2>
          </div>

          <button onClick={onClose}>
            <HiOutlineX className="text-gray-400 text-xl hover:text-gray-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-8 py-8">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Reset Password
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email or phone number below. We'll send you a
                secure Otp to reset your account password.
              </p>

              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email or phone number
              </label>

              <div className="mb-6 relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => { setForgotEmail(e.target.value); setStep1Error(""); }}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg bg-gray-100 border focus:ring-2 focus:ring-blue-500 outline-none ${step1Error ? "border-red-400 ring-2 ring-red-400" : "border-gray-200"}`}
                />
              </div>
              {step1Error && <p className="text-red-500 text-xs mt-1 pl-1 mb-5">{step1Error}</p>}
              <button
                onClick={handleSendOtp}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition"
              >
                {isProcessing ? "Sending..." : "Submit →"}
              </button>

              <p className="text-sm text-center text-gray-500 mt-6">
                Remember your password?{" "}
                <span
                  onClick={() => {
                    onClose();
                    navigate("/");
                  }}
                  className="text-blue-600 font-medium cursor-pointer hover:underline"
                >
                  Back to Login
                </span>
              </p>
            </>
          )}

          {/* STEP 2 OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineShieldCheck />
                </div>

                <h3 className="text-xl font-semibold mb-1">
                  Verification
                </h3>

                <p className="text-sm text-gray-500">
                  We've sent the code to your phone
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-4">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Only numbers allow
                      if (!/^[0-9]?$/.test(value)) return;

                      const newOtp = otp.split("");
                      newOtp[index] = value;
                      const updatedOtp = newOtp.join("");
                      setOtp(updatedOtp);
                      setStep2Error("");

                      // Auto move to next box
                      if (value && e.target.nextElementSibling) {
                        e.target.nextElementSibling.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" &&
                        !otp[index] &&
                        e.target.previousElementSibling
                      ) {
                        e.target.previousElementSibling.focus();
                      }
                    }}
                    className={`w-12 h-12 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${step2Error ? "border-red-400 ring-2 ring-red-400" : ""}`}
                  />
                ))}
              </div>
              {step2Error && <p className="text-red-500 text-xs text-center mb-4">{step2Error}</p>}

              <p className="text-sm text-center text-gray-500 mb-6">
                Didn’t receive the code?{" "}
                <span
                  onClick={handleResendOtp}
                  className={`font-medium ${emailTimer > 0 || emailResending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 cursor-pointer hover:underline"
                    }`}
                >
                  {emailResending ? "Resending..." : (emailTimer > 0 ? `Resend in ${emailTimer}s` : "Resend OTP")}
                </span>
              </p>

              <button
                onClick={handleVerifyOtp}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition"
              >
                {isProcessing ? "Verifying..." : "Verify →"}
              </button>

            </>
          )}

          {/* STEP 3 PASSWORD */}
          {step === 3 && (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Create New Password
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                Your new password must be different from your previous
                password to ensure your account security.
              </p>

              <label className="text-sm font-medium block mb-2">
                New Password
              </label>

              <div className="mb-1 relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter at least 8 characters"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setStep3Errors((p) => ({ ...p, newPassword: "" })); }}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-100 border focus:ring-2 focus:ring-blue-500 outline-none pr-12 ${step3Errors.newPassword ? "border-red-400 ring-2 ring-red-400" : "border-gray-200"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 focus:outline-none"
                >
                  {showNewPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                </button>
              </div>
              {step3Errors.newPassword && <p className="text-red-500 text-xs mt-1 pl-1 mb-3">{step3Errors.newPassword}</p>}

              <label className="text-sm font-medium block mb-2">
                Confirm Password
              </label>

              <div className="mb-1 relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setStep3Errors((p) => ({ ...p, confirmPassword: "" })); }}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-100 border focus:ring-2 focus:ring-blue-500 outline-none pr-12 ${step3Errors.confirmPassword ? "border-red-400 ring-2 ring-red-400" : "border-gray-200"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                </button>
              </div>
              {step3Errors.confirmPassword && <p className="text-red-500 text-xs mt-1 pl-1 mb-5">{step3Errors.confirmPassword}</p>}

              <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600 mb-6">
                • At least 8 characters long <br />
                • Include at least one uppercase letter<br />
                • Include at least one lowercase letter  <br />
                • Include at least one number (0–9) <br />
                • Include at least one special character
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition"
              >
                {isProcessing ? "Updating..." : "Update Password →"}
              </button>

              <p className="text-sm text-center text-gray-500 mt-6">
                Cancel and return to login
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;