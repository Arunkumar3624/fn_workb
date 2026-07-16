import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase, Building2, Shield, ChevronRight,
  Lock, Zap, Award, AlertCircle,
} from "lucide-react";
import { authSchema, signupSchema } from "../utils/formValidation";
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

export default function AuthPage({ userType, onSuccess, onBack }) {
  // Admin accounts are provisioned directly in the database (see
  // backend/src/validators/auth.validators.js) — there is no public admin
  // signup, so this page never lets the admin tab reach "signup" mode.
  const [mode, setMode] = useState(userType === "admin" ? "login" : "login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login, register: registerAccount } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  useEffect(() => {
    reset({ fullName: "", email: "", phone: "", password: "" });
    setErrorMessage("");
  }, [mode, reset]);

  useEffect(() => {
    if (userType === "admin") setMode("login");
  }, [userType]);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const user =
        mode === "signup"
          ? await registerAccount({
              role: userType,
              name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
            })
          : await login(formData.email, formData.password);
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
            {userType === "admin" ? (
              <div className="px-7 pt-6 pb-1">
                <p className="text-xs text-slate-400 text-center">
                  Admin accounts are provisioned internally — sign in below.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 border-b border-slate-100">
                {["login", "signup"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMessage && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
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
                      <span className="text-xs text-slate-300 cursor-not-allowed" title="Coming soon">Forgot Password?</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#1B3FAB] hover:bg-[#1635A0] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors mt-1 shadow-md shadow-[#1B3FAB]/20"
                >
                  {submitting ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
