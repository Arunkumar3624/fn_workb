import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase, Building2, Shield, ChevronRight,
  Lock, Zap, Award, CheckCircle2,
} from "lucide-react";
import { authSchema, signupSchema } from "../utils/formValidation";

const USER_CONFIG = {
  worker: { label: "Freelancer", Icon: Briefcase, bg: "bg-[#FF6B2C]", shadow: "shadow-[#FF6B2C]/30" },
  business: { label: "Business", Icon: Building2, bg: "bg-[#1B3FAB]", shadow: "shadow-[#1B3FAB]/30" },
  admin: { label: "Admin", Icon: Shield, bg: "bg-slate-700", shadow: "shadow-slate-500/20" },
};

const BRAND_FEATURES = [
  { I: Lock, t: "OTP-verified contracts for every project" },
  { I: Zap, t: "Protected payments released in 60 seconds" },
  { I: Shield, t: "AI Face Match identity verification" },
  { I: Award, t: "Behavior score & trust badges system" },
];

export default function AuthPage({ userType, onSuccess, onBack }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mode === "signup" ? signupSchema : authSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const cfg = USER_CONFIG[userType];
  const phone = watch("phone");
  const formattedPhone = phone ? `${phone.slice(0, 5)} ${phone.slice(5)}`.trim() : "";

  useEffect(() => {
    reset({ fullName: "", email: "", phone: "", password: "" });
  }, [mode, reset]);

  useEffect(() => {
    if (step === 2) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleOtpChange = (i, v) => {
    const digits = v.replace(/\D/g, "");
    if (!digits) {
      const next = [...otp];
      next[i] = "";
      setOtp(next);
      return;
    }

    const next = [...otp];
    next[i] = digits.slice(-1);
    setOtp(next);

    if (i < otp.length - 1) {
      otpInputRefs.current[i + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (i, event) => {
    if (event.key === "Backspace" && !otp[i] && i > 0) {
      otpInputRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (i, event) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, otp.length - i);
    if (!digits) return;

    const next = [...otp];
    digits.split("").forEach((digit, index) => {
      next[i + index] = digit;
    });
    setOtp(next);

    const nextIndex = Math.min(i + digits.length, otp.length - 1);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const onSubmit = () => {
    setStep(2);
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
            {mode === "login" ? "Welcome back." : "Join India's fastest"}<br />
            <span className="text-[#FF6B2C]">
              {mode === "login" ? "India's fastest freelance platform." : "freelance platform."}
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            {userType === "worker" && "Access thousands of verified projects. Track your earnings and withdraw to UPI in under 60 seconds."}
            {userType === "business" && "Post projects, hire verified talent, and release payment only when satisfied with the work."}
            {userType === "admin" && "Access the master control panel for verifications, dispute resolution, and platform monitoring."}
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

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {step === 1 && (
              <div className="grid grid-cols-2 border-b border-slate-100">
                {["login", "signup"].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setStep(1); }}
                    className={`py-4 text-sm font-semibold transition-colors ${
                      mode === m
                        ? "text-[#1B3FAB] border-b-2 border-[#1B3FAB] -mb-px"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>
            )}

            <div className="p-7">
              {step === 1 ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {mode === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        placeholder="Priya Sharma"
                        {...register("fullName", { setValueAs: (value) => value.trim() })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] transition-all"
                      />
                      {errors.fullName && <p className="mt-1 text-xs font-semibold text-red-500">{errors.fullName.message}</p>}
                    </div>
                  )}
                  {mode === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                      <input
                        type="email"
                        placeholder="priya@example.com"
                        {...register("email", { setValueAs: (value) => value.trim().toLowerCase() })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] transition-all"
                      />
                      {errors.email && <p className="mt-1 text-xs font-semibold text-red-500">{errors.email.message}</p>}
                    </div>
                  )}
                  {mode === "login" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                      <input
                        type="email"
                        placeholder="priya@example.com"
                        {...register("email", { setValueAs: (value) => value.trim().toLowerCase() })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] transition-all"
                      />
                      {errors.email && <p className="mt-1 text-xs font-semibold text-red-500">{errors.email.message}</p>}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 font-medium">+91</div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="9876543210"
                        {...register("phone", {
                          onChange: (event) => {
                            setValue("phone", event.target.value.replace(/\D/g, "").slice(0, 10), {
                              shouldValidate: true,
                            });
                          },
                        })}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] transition-all"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs font-semibold text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      {mode === "login" ? "Password" : "Create Password"}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] transition-all"
                    />
                    {errors.password && <p className="mt-1 text-xs font-semibold text-red-500">{errors.password.message}</p>}
                    {mode === "login" && (
                      <div className="mt-1.5 text-right">
                        <span className="text-xs text-[#1B3FAB] font-semibold cursor-pointer hover:underline">Forgot Password?</span>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-[#1B3FAB] hover:bg-[#1635A0] text-white rounded-xl font-bold text-sm transition-colors mt-1 shadow-md shadow-[#1B3FAB]/20">
                    {mode === "login" ? "Sign In & Get OTP" : "Create Account & Verify →"}
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-slate-400 text-xs">or continue with</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  <button type="button" className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors">
                    Google
                  </button>
                </form>
              ) : (
                <div>
                  <div className="text-center mb-7">
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-[#0A1128] text-lg mb-1">Verify your number</h3>
                    <p className="text-slate-500 text-sm">We sent a 6-digit OTP to <strong>+91 {formattedPhone}</strong></p>
                  </div>
                  <div className="flex gap-2 justify-center mb-6">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpInputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={(e) => handleOtpPaste(i, e)}
                        className="w-11 h-12 text-center text-lg font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#1B3FAB] transition-colors bg-slate-50"
                      />
                    ))}
                  </div>
                  <button onClick={onSuccess} className="w-full py-3.5 bg-[#1B3FAB] hover:bg-[#1635A0] text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-[#1B3FAB]/20">
                    Verify & Enter Platform
                  </button>
                  <button onClick={() => setStep(1)} className="w-full mt-3 py-2.5 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                    ← Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
