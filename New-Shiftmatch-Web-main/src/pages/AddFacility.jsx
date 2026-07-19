import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notify, baseUrl, urls } from "../constants/config";
import { FaHospitalAlt, FaMobileAlt } from "react-icons/fa";
import { MdMarkEmailRead } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { registerSchema } from "../schemas/registerSchema";
import { otpSchema } from "../schemas/forgotPasswordSchema";

const AddFacility = ({ isModal = false, onClose, onSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [mobileOtp, setMobileOtp] = useState(["", "", "", "", "", ""]);

  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  const [emailTimer, setEmailTimer] = useState(60);
  const [mobileTimer, setMobileTimer] = useState(60);

  const emailRefs = useRef([]);
  const mobileRefs = useRef([]);
  const [emailResending, setEmailResending] = useState(false);
  const [mobileResending, setMobileResending] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");
  const [mobileOtpError, setMobileOtpError] = useState("");
  const [formErrors, setFormErrors] = useState({ fullName: "", email: "", mobileNumber: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // ================= GENERATE OTP =================
  const handleSubmit = async () => {
    if (!isTermsAccepted) return notify(false, "Accept terms first");

    // ── Zod validation ─────────────────────────────────────────
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setFormErrors({
        fullName: fe.fullName?.[0] || "",
        email: fe.email?.[0] || "",
        mobileNumber: fe.mobileNumber?.[0] || "",
        password: fe.password?.[0] || "",
      });
      return;
    }
    setFormErrors({ fullName: "", email: "", mobileNumber: "", password: "" });
    // ───────────────────────────────────────────────────────────

    try {
      setIsRegistering(true);

      const res = await fetch(
        `${baseUrl}${urls.otps.generateRegisterOtps}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            mobileNumber: formData.mobileNumber,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, "OTP sent successfully");
        // Clear old OTP state before showing the modal
        setEmailOtp(["", "", "", "", "", ""]);
        setMobileOtp(["", "", "", "", "", ""]);
        setEmailVerified(false);
        setMobileVerified(false);
        setEmailOtpError("");
        setMobileOtpError("");
        setEmailTimer(60);
        setMobileTimer(60);
        setShowOtpModal(true);
      } else {
        notify(false, data.message || "OTP generation failed");
      }
    } catch {
      notify(false, "Server error");
    } finally {
      setIsRegistering(false);
    }
  };

  // ================= TIMER =================
  useEffect(() => {
    if (!showOtpModal) return;

    const interval = setInterval(() => {
      setEmailTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setMobileTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [showOtpModal]);

  const handleOtpChange = (value, index, type) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated =
      type === "email" ? [...emailOtp] : [...mobileOtp];

    updated[index] = value;

    const refs = type === "email" ? emailRefs : mobileRefs;

    if (type === "email") setEmailOtp(updated);
    else setMobileOtp(updated);

    if (value && index < 5) refs.current[index + 1]?.focus();
    if (!value && index > 0) refs.current[index - 1]?.focus();
  };

  const handleOtpVerify = async (type) => {
    const otpValue =
      type === "email"
        ? emailOtp.join("")
        : mobileOtp.join("");

    // ── Zod OTP validation ──
    const result = otpSchema.safeParse({ otp: otpValue });
    if (!result.success) {
      const msg = result.error.flatten().fieldErrors.otp?.[0] || "Invalid OTP";
      if (type === "email") setEmailOtpError(msg);
      else setMobileOtpError(msg);
      return;
    }
    if (type === "email") setEmailOtpError("");
    else setMobileOtpError("");

    const mode = type === "email" ? "Email" : "Mobile";
    const emailMobile =
      type === "email"
        ? formData.email
        : formData.mobileNumber;

    try {
      if (type === "email") setIsVerifyingEmail(true);
      else setIsVerifyingMobile(true);

      const res = await fetch(
        `${baseUrl}${urls.otps.verifyOtp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: mode,
            emailMobile: emailMobile,
            otp: otpValue,
            type: "Register",
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, `${mode} verified successfully`);

        if (type === "email") {
          setEmailVerified(true);
          setEmailTimer(0); // 🔥 STOP EMAIL TIMER
        } else {
          setMobileVerified(true);
          setMobileTimer(0); //
        }
      }

      else {
        notify(false, data.message || "OTP verification failed");
      }

    } catch {
      notify(false, "Server error");
    } finally {
      if (type === "email") setIsVerifyingEmail(false);
      else setIsVerifyingMobile(false);
    }
  };

  // ================= RESEND =================
  const handleResendOtp = async (mode, emailMobile) => {
    try {
      if (mode === "Email") setEmailResending(true);
      else setMobileResending(true);

      const res = await fetch(
        `${baseUrl}${urls.otps.resendOtp}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: mode,
            emailMobile: emailMobile,
            type: "Register",
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, `${mode} OTP resent`);

        if (mode === "Email") {
          setEmailTimer(60);
        } else {
          setMobileTimer(60);
        }

      } else {
        notify(false, data.message || "Resend failed");
      }

    } catch {
      notify(false, "Server error");
    } finally {
      if (mode === "Email") setEmailResending(false);
      else setMobileResending(false);
    }
  };

  // ================= FINAL SIGNUP =================
  const handleContinue = async () => {
    if (!emailVerified || !mobileVerified)
      return notify(false, "Verify both OTPs first");

    try {
      setIsRegistering(true);

      const res = await fetch(
        `${baseUrl}${urls.authentication.register}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            roleId: 2,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, "Facility registered successfully");
        setShowOtpModal(false);
        if (isModal) {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        } else {
          navigate("/dashboard2", { replace: true });
        }
      } else {
        notify(false, data.message || "Signup failed");
      }
    } catch {
      notify(false, "Server error");
    } finally {
      setIsRegistering(false);
    }
  };

  const formContent = (
    <>
      <h1 className="text-xl font-bold mb-4">
        Add New Healthcare Facility
      </h1>

      {["fullName", "email", "mobileNumber", "password"].map(
        (field) => {
          const Icon =
            field === "fullName"
              ? FaHospitalAlt
              : field === "mobileNumber"
                ? FaMobileAlt
                : field === "password"
                  ? TbLockPassword
                  : MdMarkEmailRead;

          return (
            <div key={field} className="mb-3">
              <label className="flex items-center gap-2 mb-1">
                <Icon className="text-[#4039AD]" />
                {field === "fullName"
                  ? "Hospital Full Name"
                  : field === "mobileNumber"
                    ? "Mobile Number"
                    : field === "password"
                      ? "System Password"
                      : "Email Address"}
              </label>

              {field === "mobileNumber" ? (
                <div>
                  <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#4039AD]/30 focus-within:border-[#4039AD] ${formErrors.mobileNumber ? "border-red-400 ring-2 ring-red-400" : ""}` }>
                    <span className="bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 border-r select-none whitespace-nowrap flex items-center gap-2">
                      <img src="https://flagcdn.com/w20/za.png" alt="South Africa Flag" className="w-5 h-auto rounded-[2px]" /> +27
                    </span>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      placeholder="e.g. 712345678"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          setFormData({ ...formData, mobileNumber: value });
                          setFormErrors((prev) => ({ ...prev, mobileNumber: "" }));
                        }
                      }}
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="flex-1 px-4 py-2 outline-none text-sm"
                    />
                  </div>
                  {formErrors.mobileNumber ? (
                    <p className="text-red-500 text-xs mt-1 pl-1">{formErrors.mobileNumber}</p>
                  ) : (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Enter exactly 9 digits · e.g. <strong>712345678</strong> → full number: +27 712345678
                    </p>
                  )}
                </div>
              ) : field === "password" ? (
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg text-sm ${formErrors.password ? "border-red-400 ring-2 ring-red-400" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-red-500 text-xs mt-1 pl-1">{formErrors.password}</p>}
                </div>
              ) : (
                <div>
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg text-sm ${formErrors[field] ? "border-red-400 ring-2 ring-red-400" : ""}`}
                  />
                  {formErrors[field] && <p className="text-red-500 text-xs mt-1 pl-1">{formErrors[field]}</p>}
                </div>
              )}
            </div>
          );
        }
      )}

      <div className="flex items-center gap-3 mt-4 text-sm">
        <input
          type="checkbox"
          checked={isTermsAccepted}
          onChange={() =>
            setIsTermsAccepted(!isTermsAccepted)
          }
        />
        <p>I agree to Terms & Conditions</p>
      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={handleSubmit}
          disabled={isRegistering}
          className="px-8 py-2 bg-[#4039AD] text-white rounded-xl text-sm font-medium"
        >
          {isRegistering
            ? "Sending OTP..."
            : "Register Facility"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {isModal ? (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-40 p-4">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl p-6 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
            {formContent}
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex bg-gray-100">
          <aside className="w-[260px] bg-[#4039AD] text-white flex flex-col justify-between">
            <div className="px-6 py-6">
              <img src="/logo.png" className="w-[160px]" />
            </div>
            <div className="px-6 py-6 text-yellow-300 cursor-pointer">
              Logout
            </div>
          </aside>

          <main className="flex-1 p-10 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-md p-8">
              {formContent}
            </div>
          </main>
        </div>
      )}

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[520px] p-8 rounded-3xl shadow-2xl relative">

            <button
              onClick={() => {
                setShowOtpModal(false);
                setEmailOtp(["", "", "", "", "", ""]);
                setMobileOtp(["", "", "", "", "", ""]);
                setEmailVerified(false);
                setMobileVerified(false);
                setEmailOtpError("");
                setMobileOtpError("");
                setEmailTimer(60);
                setMobileTimer(60);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4 text-8xl">
                🔐
              </div>
              <h2 className="text-xl font-bold">
                Verify Your Email & Mobile
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Enter the 6 digit verification codes.
              </p>
            </div>

            {/* EMAIL OTP */}
            <div className="mb-8">
              <p className="font-medium mb-3">Email OTP</p>
              <div className="flex items-center gap-3">
                {emailOtp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (emailRefs.current[i] = el)}
                    maxLength="1"
                    value={digit}
                    disabled={emailVerified}
                    onChange={(e) => {
                      handleOtpChange(e.target.value, i, "email");
                      setEmailOtpError("");
                    }}
                    className={`w-12 h-12 border rounded-lg text-center ${emailOtpError ? "border-red-400 ring-2 ring-red-400" : ""} ${emailVerified ? "bg-green-50" : ""}`}
                  />
                ))}

                {!emailVerified ? (
                  <button
                    onClick={() => handleOtpVerify("email")}
                    disabled={emailVerified || isVerifyingEmail}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-60 flex items-center gap-2 min-w-[80px] justify-center"
                  >
                    {isVerifyingEmail ? (
                      <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span> Verifying...</>
                    ) : "Verify"}
                  </button>
                ) : (
                  <span className="text-green-600 font-semibold">Verified ✓</span>
                )}
              </div>
              {emailOtpError && <p className="text-red-500 text-xs mt-1">{emailOtpError}</p>}

              {emailTimer > 0 ? (
                <p className="mt-2 text-sm">
                  Resend in {emailTimer}s
                </p>
              ) : (
                <button
                  onClick={() =>
                    handleResendOtp("Email", formData.email)
                  }
                  disabled={emailResending}
                  className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition 
  ${emailResending
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#4039AD] text-white "
                    }`}
                >
                  {emailResending ? "Sending..." : "Resend OTP"}
                </button>

              )}
            </div>

            {/* MOBILE OTP */}
            <div className="mb-8">
              <p className="font-medium mb-3">Mobile OTP</p>
              <div className="flex items-center gap-3">
                {mobileOtp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (mobileRefs.current[i] = el)}
                    maxLength="1"
                    value={digit}
                    disabled={mobileVerified}
                    onChange={(e) => {
                      handleOtpChange(e.target.value, i, "mobile");
                      setMobileOtpError("");
                    }}
                    className={`w-12 h-12 border rounded-lg text-center ${mobileOtpError ? "border-red-400 ring-2 ring-red-400" : ""} ${mobileVerified ? "bg-green-50" : ""}`}
                  />
                ))}

                {!mobileVerified ? (
                  <button
                    onClick={() => handleOtpVerify("mobile")}
                    disabled={mobileVerified || isVerifyingMobile}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-60 flex items-center gap-2 min-w-[80px] justify-center"
                  >
                    {isVerifyingMobile ? (
                      <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span> Verifying...</>
                    ) : "Verify"}
                  </button>
                ) : (
                  <span className="text-green-600 font-semibold">Verified ✓</span>
                )}
              </div>
              {mobileOtpError && <p className="text-red-500 text-xs mt-1">{mobileOtpError}</p>}

              {mobileTimer > 0 ? (
                <p className="mt-2 text-sm">
                  Resend in {mobileTimer}s
                </p>
              ) : (
                <button
                  onClick={() =>
                    handleResendOtp("Mobile", formData.mobileNumber)
                  }
                  disabled={mobileResending}
                  className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition 
  ${mobileResending
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#4039AD] text-white"
                    }`}
                >
                  {mobileResending ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={!emailVerified || !mobileVerified || isRegistering}
              className={`w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 ${!emailVerified || !mobileVerified || isRegistering
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 text-white"
                }`}
            >
              {isRegistering ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span> Registering...</>
              ) : "Click Here To Continue"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFacility;