import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Smartphone,
  User,
  Zap,
} from "lucide-react";
import { adminAuthSchema, authSchema, signupSchema } from "../utils/formValidation";
import { apiFetch } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";

const USER_CONFIG = {
  worker: { label: "Freelancer", Icon: Briefcase, bg: "bg-[#FF6B2C]", shadow: "shadow-[#FF6B2C]/30" },
  business: { label: "Business", Icon: Building2, bg: "bg-[#1B3FAB]", shadow: "shadow-[#1B3FAB]/30" },
  admin: { label: "Admin", Icon: Shield, bg: "bg-slate-700", shadow: "shadow-slate-500/20" },
};

const BRAND_FEATURES = [
  { Icon: Lock, text: "Protected payments held securely until approval" },
  { Icon: Zap, text: "Fast payouts released in under 60 seconds" },
  { Icon: Shield, text: "Verified profiles and behavior-score trust" },
  { Icon: Award, text: "Trust badges that reward great work" },
];

const OTP_LENGTH = 6;
const AUTH_INPUT_CLASS = "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1B3FAB] focus:bg-white focus:ring-4 focus:ring-[#1B3FAB]/10";

// DEV BYPASS: temporary dashboard-development auth bypass.
// Set this to false and restore the commented OTP call in onUserContinue before production.
const DEV_BYPASS_AUTH = true;
const DEV_BYPASS_TOKEN = "dev_bypass_token_123";
const DEV_BYPASS_USER_STORAGE_KEY = "workbridge_dev_bypass_user";

function createDevBypassUser(role) {
  return {
    id: "dev_999",
    email: "dev@workbridge.com",
    role: USER_CONFIG[role] ? role : "worker",
    name: "Dev User",
    verified: true,
    behavior_score: 100,
    avatar_url: null,
    title: role === "business" ? "Business Owner" : role === "admin" ? "Platform Admin" : "Freelancer",
    profile: {},
  };
}

function otpPayload(values, role, mode) {
  const email = values.email.trim().toLowerCase();
  const phone = (values.phone ?? "").replace(/\D/g, "").slice(-10);
  return {
    identifier: email,
    role,
    mode,
    email,
    password: values.password,
    ...(phone ? { phone } : {}),
    ...(mode === "signup" ? { name: values.fullName.trim() } : {}),
  };
}

export default function AuthPage({ userType, onSuccess, onBack }) {
  const isAdmin = userType === "admin";
  const cfg = USER_CONFIG[userType] ?? USER_CONFIG.worker;
  const [authStep, setAuthStep] = useState("input");
  const [authMode, setAuthMode] = useState("signin");
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const otpInputs = useRef([]);
  const verifyingRef = useRef(false);
  const { authenticate } = useAuth();

  const activeSchema = isAdmin
    ? adminAuthSchema
    : authMode === "signup"
      ? signupSchema
      : authSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(activeSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "" },
  });

  useEffect(() => {
    setAuthStep("input");
    setAuthMode("signin");
    setPendingCredentials(null);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setInfoMessage("");
    setFormError("");
    setResendCountdown(0);
    setShowPassword(false);
    reset({ fullName: "", email: "", phone: "", password: "" });
  }, [isAdmin, reset, userType]);

  useEffect(() => {
    if (authStep === "otp") {
      const focusTimer = window.setTimeout(() => otpInputs.current[0]?.focus(), 80);
      return () => window.clearTimeout(focusTimer);
    }
    return undefined;
  }, [authStep]);

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const timer = window.setTimeout(
      () => setResendCountdown((count) => Math.max(0, count - 1)),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const changeMode = (mode) => {
    if (mode === authMode) return;
    setAuthMode(mode);
    setFormError("");
    setShowPassword(false);
    reset({ fullName: "", email: "", phone: "", password: "" });
  };

  const requestOtp = async (credentials, isResend = false) => {
    setSendingOtp(true);
    setFormError("");
    setOtpError("");
    setInfoMessage("");

    try {
      const result = await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: credentials,
      });
      // The server resolves the real account role after the password check.
      // This lets an admin use either public sign-in entry and still receive
      // an admin-scoped OTP/JWT rather than trusting the selected UI role.
      setPendingCredentials({
        ...credentials,
        role: result?.role ?? credentials.role,
      });
      setOtp(Array(OTP_LENGTH).fill(""));
      setAuthStep("otp");
      setResendCountdown(result?.resendAfterSeconds ?? 60);
      setInfoMessage(isResend ? "A fresh code has been sent." : "Your secure code is on its way.");
    } catch (error) {
      const message = error.message ?? "Could not send the OTP. Please try again.";
      if (isResend) setOtpError(message);
      else setFormError(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const onUserContinue = (values) => {
    // DEV BYPASS: skip /api/auth/send-otp and inject a mock authenticated session.
    // This keeps the original OTP flow below intact for production restore.
    if (DEV_BYPASS_AUTH) {
      setFormError("");
      setOtpError("");
      setInfoMessage("DEV BYPASS: signed in without OTP.");

      const selectedRole = USER_CONFIG[userType] ? userType : "worker";
      const mockUser = createDevBypassUser(selectedRole);

      localStorage.setItem(DEV_BYPASS_USER_STORAGE_KEY, JSON.stringify(mockUser));
      authenticate(DEV_BYPASS_TOKEN, mockUser);
      onSuccess(mockUser);
      return;
    }

    /*
     * DEV BYPASS: original production OTP flow.
     * Uncomment this line and remove/disable the bypass block above before production.
     *
     * requestOtp(otpPayload(values, userType, authMode));
     */
  };

  const verifyCode = async (code) => {
    if (verifyingRef.current || code.length !== OTP_LENGTH || !pendingCredentials) return;
    verifyingRef.current = true;
    setVerifyingOtp(true);
    setOtpError("");
    setInfoMessage("");

    try {
      const { token, user } = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: { ...pendingCredentials, otp: code },
      });
      authenticate(token, user);
      onSuccess(user);
    } catch (error) {
      setOtpError(error.message ?? "That code is invalid or expired. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      window.setTimeout(() => otpInputs.current[0]?.focus(), 0);
    } finally {
      verifyingRef.current = false;
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (index, event) => {
    const digit = event.target.value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setOtpError("");

    if (digit && index < OTP_LENGTH - 1) otpInputs.current[index + 1]?.focus();
    if (nextOtp.every(Boolean)) window.queueMicrotask(() => verifyCode(nextOtp.join("")));
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputs.current[index - 1]?.focus();
      return;
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpInputs.current[index + 1]?.focus();
      return;
    }
    if (event.key !== "Backspace") return;
    if (otp[index]) return;
    if (index > 0) {
      event.preventDefault();
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
    const nextOtp = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? "");
    setOtp(nextOtp);
    otpInputs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
    if (pasted.length === OTP_LENGTH) window.queueMicrotask(() => verifyCode(pasted));
  };

  const handleResend = () => {
    if (resendCountdown > 0 || sendingOtp || !pendingCredentials) return;
    requestOtp(pendingCredentials, true);
  };

  const editDetails = () => {
    setAuthStep("input");
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setInfoMessage("");
    setPendingCredentials(null);
    setResendCountdown(0);
  };

  const isOtpComplete = otp.every(Boolean);

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <aside className="relative hidden w-5/12 flex-col overflow-hidden bg-[#0A1128] p-10 md:flex">
        <button
          type="button"
          onClick={onBack}
          className="z-10 mb-14 flex w-fit items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to home
        </button>

        <div className="z-10 flex max-w-sm flex-1 flex-col justify-center">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B2C] shadow-lg shadow-[#FF6B2C]/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              WorkBridge
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {isAdmin ? (
              "Secure admin access"
            ) : (
              <>
                {authMode === "signin" ? "Welcome back." : "Join India’s faster"}<br />
                <span className="text-[#FF6B2C]">
                  {authMode === "signin" ? "India’s freelance platform." : "freelance platform."}
                </span>
              </>
            )}
          </h1>
          <p className="mb-10 text-sm leading-relaxed text-slate-400">
            {userType === "worker" && "Access verified projects, track earnings, and get paid with confidence."}
            {userType === "business" && "Hire verified talent, protect every payment, and scale with confidence."}
            {userType === "admin" && "Manage platform verifications, disputes, and live operations securely."}
          </p>

          <div className="space-y-4">
            {BRAND_FEATURES.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.08]">
                  <Icon className="h-3.5 w-3.5 text-[#FF6B2C]" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 animate-pulse rounded-full bg-[#FF6B2C]/[0.05]" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[#1B3FAB]/10" />
      </aside>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#F4F6FF] px-4 py-10 sm:p-8">
        <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 animate-pulse rounded-full bg-[#FF6B2C]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-12 h-80 w-80 rounded-full bg-[#1B3FAB]/10 blur-3xl" />

        <button
          type="button"
          onClick={onBack}
          className="absolute left-5 top-5 flex items-center gap-2 text-sm font-medium text-slate-500 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg ${cfg.bg} ${cfg.shadow}`}>
              <cfg.Icon className="h-4 w-4" />
              {cfg.label} Account
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-xl backdrop-blur-xl">
            {authStep === "input" && (
              <div className={`grid border-b border-slate-200/80 bg-white/40 ${isAdmin ? "grid-cols-1" : "grid-cols-2"}`}>
                {isAdmin ? (
                  <div className="relative py-4 text-center text-sm font-bold text-[#1B3FAB]">
                    Admin Sign In
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1B3FAB]" />
                  </div>
                ) : (
                  <>
                <button
                  type="button"
                  onClick={() => changeMode("signin")}
                  className={`relative py-4 text-sm font-bold transition ${authMode === "signin" ? "text-[#1B3FAB]" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Sign In
                  {authMode === "signin" && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1B3FAB]" />}
                </button>
                <button
                  type="button"
                  onClick={() => changeMode("signup")}
                  className={`relative py-4 text-sm font-bold transition ${authMode === "signup" ? "text-[#1B3FAB]" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Create Account
                  {authMode === "signup" && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1B3FAB]" />}
                </button>
                  </>
                )}
              </div>
            )}

            <div className="p-6 sm:p-8">
              {!isAdmin && authStep === "otp" ? (
                <div className="rounded-2xl border border-white/50 bg-white/40 p-5 shadow-xl backdrop-blur-xl sm:p-6">
                  <button
                    type="button"
                    onClick={editDetails}
                    className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-[#1B3FAB]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Edit account details
                  </button>

                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0E9] text-[#FF6B2C] shadow-sm">
                      <Shield className="h-7 w-7" />
                    </div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#1B3FAB]">Identity check</p>
                    <h2 className="text-2xl font-black tracking-tight text-[#0A1128]">Verify it&apos;s you</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      Enter the 6-digit code sent to<br />
                      <span className="font-semibold text-slate-800">{pendingCredentials?.email}</span>
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-6 gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => { otpInputs.current[index] = element; }}
                        value={digit}
                        onChange={(event) => handleOtpChange(index, event)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        onPaste={handleOtpPaste}
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        aria-label={`OTP digit ${index + 1}`}
                        maxLength={1}
                        disabled={verifyingOtp}
                        className="h-12 min-w-0 rounded-xl border border-slate-200 bg-white/80 text-center text-xl font-black text-[#0A1128] shadow-sm outline-none transition focus:-translate-y-0.5 focus:border-[#FF6B2C] focus:ring-4 focus:ring-[#FF6B2C]/10 disabled:opacity-60 sm:h-14 sm:text-2xl"
                      />
                    ))}
                  </div>

                  <div aria-live="polite" className="mt-4 min-h-10 text-center">
                    {verifyingOtp && <p className="text-sm font-semibold text-[#1B3FAB]">Verifying your code…</p>}
                    {!verifyingOtp && otpError && <p className="text-sm font-medium text-red-600">{otpError}</p>}
                    {!verifyingOtp && !otpError && infoMessage && <p className="text-sm text-emerald-700">{infoMessage}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={() => verifyCode(otp.join(""))}
                    disabled={!isOtpComplete || verifyingOtp}
                    className="mt-2 w-full rounded-xl bg-[#1B3FAB] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1B3FAB]/20 transition hover:bg-[#163596] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verifyingOtp ? "Verifying…" : "Verify & Continue"}
                  </button>

                  <div className="mt-5 text-center text-sm text-slate-500">
                    Didn&apos;t receive it?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCountdown > 0 || sendingOtp}
                      className="font-bold text-[#FF6B2C] transition hover:text-[#e65b22] disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {sendingOtp
                        ? "Sending…"
                        : resendCountdown > 0
                          ? `Resend in 0:${String(resendCountdown).padStart(2, "0")}`
                          : "Resend Code"}
                    </button>
                  </div>
                  <p className="mt-3 text-center text-xs text-slate-400">The code expires in 5 minutes.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 text-center">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#1B3FAB]">
                      {isAdmin ? "Protected area" : "Password + OTP security"}
                    </p>
                    <h2 className="text-2xl font-black tracking-tight text-[#0A1128]">
                      {isAdmin ? "Admin sign in" : authMode === "signin" ? "Welcome back" : "Join WorkBridge"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {isAdmin
                        ? "Use your internally provisioned admin account."
                        : authMode === "signin"
                          ? "Enter your details and we’ll verify your identity."
                          : `Create your ${cfg.label.toLowerCase()} account securely.`}
                    </p>
                  </div>

                  {formError && (
                    <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onUserContinue)} className="space-y-4">
                    {!isAdmin && authMode === "signup" && (
                      <Field label="Full name" error={errors.fullName?.message} Icon={User}>
                        <input
                          type="text"
                          autoComplete="name"
                          placeholder="Your full name"
                          {...register("fullName")}
                          className={AUTH_INPUT_CLASS}
                        />
                      </Field>
                    )}

                    <Field label="Email" error={errors.email?.message} Icon={Mail}>
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...register("email", { setValueAs: (value) => value.trim().toLowerCase() })}
                        className={AUTH_INPUT_CLASS}
                      />
                    </Field>

                    <Field label={authMode === "signin" ? "Mobile number (optional)" : "Mobile number"} error={errors.phone?.message} Icon={Smartphone}>
                        <div className="flex gap-2">
                          <span className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-600">+91</span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            maxLength={10}
                            placeholder="9876543210"
                            {...register("phone", { setValueAs: (value) => value.replace(/\D/g, "") })}
                            className={AUTH_INPUT_CLASS}
                          />
                        </div>
                      </Field>

                    <Field label="Password" error={errors.password?.message} Icon={Lock}>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          autoComplete={isAdmin || authMode === "signin" ? "current-password" : "new-password"}
                          placeholder="Minimum 8 characters"
                          {...register("password")}
                          className={`${AUTH_INPUT_CLASS} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((visible) => !visible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>

                    <button
                      type="submit"
                      disabled={sendingOtp}
                      className="mt-2 w-full rounded-xl bg-[#1B3FAB] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1B3FAB]/20 transition hover:bg-[#163596] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sendingOtp ? "Please wait…" : isAdmin ? "Sign In" : "Continue securely"}
                    </button>

                    {!isAdmin && (
                      <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400">
                        <Shield className="h-3.5 w-3.5 text-emerald-600" />
                        Your password is verified before we send the OTP
                      </div>
                    )}

                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, error, Icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
        <Icon className="h-3.5 w-3.5 text-slate-400" /> {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-500">{error}</span>}
    </label>
  );
}
