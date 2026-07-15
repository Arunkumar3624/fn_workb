import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowRight, Briefcase, Building2, X } from "lucide-react";
import logoSrc from "../../assets/logo.png";
import { Button } from "./Button";

const navItems = [
  { label: "Find Work",  to: "/find-work"  },
  { label: "Hire Talent", to: "/hire-talent" },
  { label: "Enterprise", to: "/enterprise" },
];

// ── Role-picker modal — shown when nav "Log In" / "Sign Up" is clicked ──────
function RoleModal({ onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <h3
          className="font-extrabold text-[#0A1128] text-lg text-center mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          I am a…
        </h3>
        <p className="text-slate-400 text-sm text-center mb-5">
          Choose your account type to continue
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onSelect("worker"); onClose(); }}
            className="flex items-center gap-3 w-full p-4 rounded-xl border-2 border-slate-100 hover:border-[#FF6B2C] hover:bg-orange-50/40 transition-all duration-200 text-left group"
          >
            <div className="w-9 h-9 bg-[#FF6B2C]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF6B2C]/20 transition-colors">
              <Briefcase className="w-[18px] h-[18px] text-[#FF6B2C]" />
            </div>
            <div>
              <div className="font-bold text-[#0A1128] text-sm">Freelancer</div>
              <div className="text-slate-400 text-xs">Find work · Get paid in 60 seconds</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-[#FF6B2C] transition-colors" />
          </button>

          <button
            onClick={() => { onSelect("business"); onClose(); }}
            className="flex items-center gap-3 w-full p-4 rounded-xl border-2 border-slate-100 hover:border-[#1B3FAB] hover:bg-blue-50/40 transition-all duration-200 text-left group"
          >
            <div className="w-9 h-9 bg-[#1B3FAB]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1B3FAB]/20 transition-colors">
              <Building2 className="w-[18px] h-[18px] text-[#1B3FAB]" />
            </div>
            <div>
              <div className="font-bold text-[#0A1128] text-sm">Business</div>
              <div className="text-slate-400 text-xs">Hire verified talent · Pay on delivery</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-[#1B3FAB] transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PageShell({ children, onSelect }) {
  const [showRoleModal, setShowRoleModal] = useState(false);

  return (
    <div className="wb-shell">
      <div className="wb-aurora" aria-hidden="true">
        <span className="wb-blob wb-blob--one" />
        <span className="wb-blob wb-blob--two" />
        <span className="wb-blob wb-blob--three" />
      </div>

      {showRoleModal && (
        <RoleModal onSelect={onSelect} onClose={() => setShowRoleModal(false)} />
      )}

      <header className="wb-nav">
        <Link to="/" className="wb-brand">
          <span className="wb-brand-mark">
            <img src={logoSrc} alt="" />
          </span>
          <span>WorkBridge</span>
        </Link>

        <nav className="wb-nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="wb-nav-actions">
          <Button variant="ghost" onClick={() => setShowRoleModal(true)}>
            Log In
          </Button>
          <Button onClick={() => setShowRoleModal(true)}>
            Sign Up <ArrowRight size={16} />
          </Button>
        </div>
      </header>

      <main>{children}</main>

      <footer className="wb-footer">
        <Link to="/" className="wb-brand wb-brand--muted">
          <span className="wb-brand-mark wb-brand-mark--small">
            <img src={logoSrc} alt="" />
          </span>
          <span>WorkBridge Technologies Pvt. Ltd.</span>
        </Link>
        <span>Privacy</span>
        <span>Terms</span>
        <span>Help</span>
      </footer>
    </div>
  );
}
