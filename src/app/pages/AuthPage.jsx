import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase, Building2, Shield, ChevronRight,
  Lock, Zap, Award, AlertCircle,
} from "lucide-react";
import { authSchema } from "../utils/formValidation";
import { apiFetch } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";

const USER_CONFIG = {
  worker: { label: "Freelancer", Icon: Briefcase, bg: "bg-[#FF6B2C]", shadow: "shadow-[#FF6B2C]/30" },
  business: { label: "Business", Icon: Building2, bg: "bg-[#1B3FAB]", shadow: "shadow-[#1B3FAB]/30" },
  admin: { label: "Admin", Icon: Shield, bg: "bg-slate-700", shadow: "shadow-slate-500/20" },
};

const BRAND_FEATURES = [
  { I: Lock, t: "Protected payments held in escrow until you approve" },
  { I: Zap, t: "Protected payments released in 60 seconds" },
  { I: Shield, t: "Verified profiles and behavior-score trust system" },
  { I: Award, t: "Behavior score & trust badges system" },
];

const OTP_LENGTH = 6;

function normalizeIdentifier(value) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (/^91\d{10}$/.test(digits)) return digits.slice(2);
  if (/^\d{10}$/.test(digits)) return digits;
  return trimmed.toLowerCase();
}

function isPhoneIdentifier(value) {
  return /^\d{10}$/.test(value);
}

function isEmailIdentifier(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function displayIdentifier(value) {
  return isPhoneIdentifier(value) ? `+91 ${value}` : value;
}

export default function AuthPage({ userType, onSuccess, onBack }) {
  const isAdmin = userType === "admin";
  const [authStep, setAuthStep] = useState(isAdmin ? "admin" : "input");
  const [identifier, setIdentifier] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpInputs = useRef([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login, authenticate } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const cfg = USER_CONFIG[userType];

  useEffect(() => {
    setAuthStep(isAdmin ? "admin" : "input");
    setIdentifier("");
    setSentTo("");
    setIdentifierError("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setInfoMessage("");
    setSendingOtp(false);
    setVerifyingOtp(false);
    setResendCountdown(0);
    reset({ email: "", password: "" });
  }, [isAdmin, userType, reset]);

  useEffect(() => {
    if (authStep === "otp") {
      window.setTimeout(() => otpInputs.current[0]?.focus(), 0);
    }
  }, [authStep]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setTimeout(() => setResendCountdown((count) => count - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setIdentifierError("");
    setOtpError("");
    setInfoMessage("");

    const normalized = normalizeIdentifier(identifier);
    if (!isPhoneIdentifier(normalized) && !isEmailIdentifier(normalized)) {
      setIdentifierError("Enter a valid email address or 10-digit phone number.");
      return;
    }

    setSendingOtp(true);

    try {
      await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: {
          identifier: normalized,
          role: userType,
        },
      });

      setSentTo(normalized);
      setAuthStep("otp");
      setResendCountdown(60);
      setOtp(Array(OTP_LENGTH).fill(""));
      setInfoMessage(`A 6-digit code has been sent to ${displayIdentifier(normalized)}.`);
    } catch (err) {
      setIdentifierError(err.message ?? "Could not send OTP. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyCode = async (code) => {
    if (verifyingOtp) return;
    setOtpError("");
    setInfoMessage("");
    setVerifyingOtp(true);

    try {
      const { token, user } = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: {
          identifier: sentTo,
          otp: code,
          role: userType,
        },
      });

      authenticate(token, user);
      onSuccess(user);
    } catch (err) {
      setOtpError(err.message ?? "Invalid code. Check your digits and try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      otpInputs.current[0]?.focus();
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (index, event) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, 1);
    const nextOtp = [...otp];
    nextOtp[index] = nextValue;
    setOtp(nextOtp);

    if (nextValue && index < OTP_LENGTH - 1) {
      otpInputs.current[index + 1]?.focus();
    }

    if (nextOtp.every(Boolean)) {
      verifyCode(nextOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;
    event.preventDefault();

    if (otp[index]) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    if (index > 0) {
      const nextOtp = [...otp];
      nextOtp[index - 1] = "";
      setOtp(nextOtp);
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const nextOtp = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i += 1) {
      nextOtp[i] = pasted[i];
    }
    setOtp(nextOtp);
    otpInputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();

    if (pasted.length === OTP_LENGTH) {
      verifyCode(pasted);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || sendingOtp || !sentTo) return;
    setOtpError("");
    setInfoMessage("");
    setSendingOtp(true);

    try {
      await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: {
          identifier: sentTo,
          role: userType,
        },
      });
      setResendCountdown(60);
      setInfoMessage(`A new code has been sent to ${displayIdentifier(sentTo)}.`);
    } catch (err) {
      setOtpError(err.message ?? "Could not resend OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const canResend = resendCountdown === 0 && !sendingOtp;
  const isOtpComplete = otp.every(Boolean);

  const onAdminLogin = async (formData) => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const user = await login(formData.email, formData.password);
      onSuccess(user);
    } catch (err) {
      setErrorMessage(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left brand panel */}
      <div className="hidden md:flex flex-col w-5/12 bg-[#0A1128] p-10 relative overflow-hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm mb-14 w-fit"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to home
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#FF6B2C] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B2C]/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-extrabold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              WorkBridge
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {isAdmin ? "Admin access" : "A faster, safer sign in"}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            {userType === "worker" && "Access verified projects, track earnings, and get paid in under 60 seconds."}
            {userType === "business" && "Hire verified talent, keep payments secure, and scale with confidence."}
            {userType === "admin" && "Manage platform verifications, disputes, and real-time operations."}
          </p>

          <div className="space-y-4">
            {BRAND_FEATURES.map(({ I, t }) => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                  <I className="w-3.5 h-3.5 text-[#FF6B2C]" />
                </div>
                <span className="text-slate-300 text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#FF6B2C]/4 rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#1B3FAB]/8 rounded-full pointer-events-none" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-[#F4F6FF] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-7">
            <div className={`flex items-center gap-2 ${cfg.bg} shadow-lg ${cfg.shadow} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
              <cfg.Icon className="w-4 h-4" />
              {cfg.label} Account
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-[32px] overflow-hidden">
            <div className="p-7">
              {!isAdmin ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1B3FAB] mb-3">Secure login</p>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Sign in with OTP</h2>
                    <p className="mt-3 text-sm text-slate-500">
                      Enter the email or phone number for your {cfg.label.toLowerCase()} account.
                    </p>
                  </div>

                  {authStep === "input" ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                      {identifierError && (
                        <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {identifierError}
                        </div>
                      )}

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Email or phone number</label>
                        <input
                          value={identifier}
                          onChange={(event) => setIdentifier(event.target.value)}
                          placeholder="you@example.com or 9876543210"
                          className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#1B3FAB] focus:ring-2 focus:ring-[#1B3FAB]/20"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={sendingOtp}
                        className="w-full rounded-[24px] bg-[#1B3FAB] py-3.5 text-sm font-bold text-white transition hover:bg-[#1635A0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {sendingOtp ? "Sending OTP…" : "Send OTP"}
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.18)]">
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Enter the 6-digit code sent to</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 break-all">{displayIdentifier(sentTo)}</p>
                      </div>

                      <div className="mt-6 grid grid-cols-6 gap-3">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(element) => (otpInputs.current[index] = element)}
                            value={digit}
                            onChange={(event) => handleOtpChange(index, event)}
                            onKeyDown={(event) => handleOtpKeyDown(index, event)}
                            onPaste={handleOtpPaste}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            className="h-16 w-full rounded-3xl border border-slate-200 bg-slate-50 text-center text-2xl font-bold text-slate-900 shadow-sm outline-none transition focus:border-[#1B3FAB] focus:ring-2 focus:ring-[#1B3FAB]/20"
                          />
                        ))}
                      </div>

                      {otpError && <p className="mt-4 text-sm text-red-600">{otpError}</p>}
                      {infoMessage && <p className="mt-4 text-sm text-slate-500">{infoMessage}</p>}

                      <button
                        type="button"
                        onClick={() => verifyCode(otp.join(""))}
                        disabled={!isOtpComplete || verifyingOtp}
                        className="mt-6 w-full rounded-[24px] bg-[#FF6B2C] py-3.5 text-sm font-bold text-white transition hover:bg-[#e55a2b] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {verifyingOtp ? "Verifying…" : "Verify Code"}
                      </button>

                      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={!canResend}
                          className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {canResend ? "Resend Code" : `Resend in 0:${String(resendCountdown).padStart(2, "0")}`}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthStep("input")}
                          className="text-slate-400 transition hover:text-slate-600"
                        >
                          Use a different email or phone
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="px-7 pt-6 pb-1">
                    <p className="text-xs text-slate-400 text-center">
                      Admin accounts are provisioned internally — sign in below.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onAdminLogin)} className="space-y-4">
                    {errorMessage && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                      <input
                        type="email"
                        placeholder="admin@example.com"
                        {...register("email", { setValueAs: (value) => value.trim().toLowerCase() })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] transition-all"
                      />
                      {errors.email && <p className="mt-1 text-xs font-semibold text-red-500">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] transition-all"
                      />
                      {errors.password && <p className="mt-1 text-xs font-semibold text-red-500">{errors.password.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-[#1B3FAB] hover:bg-[#1635A0] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors mt-1 shadow-md shadow-[#1B3FAB]/20"
                    >
                      {submitting ? "Please wait…" : "Sign In"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
