import { CheckCircle2, Code2, Lock, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import PillarPageLayout from "../components/common/PillarPageLayout";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Post a brief and get matched with qualified, available freelancers in minutes, not weeks.",
  },
  {
    icon: ShieldCheck,
    title: "Behavior Score Verification",
    description: "Every freelancer carries a live Behavior Score built from delivery history, so you know who you're hiring before you do.",
  },
  {
    icon: CheckCircle2,
    title: "Quality Assurance",
    description: "Portfolios, past ratings, and verified job history are checked before a freelancer can bid on your project.",
  },
  {
    icon: Code2,
    title: "Hire Software Developers & More",
    description: "From full-stack developers to designers to SEO specialists — verified freelancers across every skill you need.",
  },
  {
    icon: Lock,
    title: "Pay on Delivery",
    description: "Funds stay secured until you approve the work — you only release payment once you're satisfied.",
  },
  {
    icon: MessageSquare,
    title: "Direct, Fast Turnaround",
    description: "Message your hire directly inside WorkBridge and keep projects moving without email back-and-forth.",
  },
];

export default function HireTalentPage({ onSelect }) {
  return (
    <PillarPageLayout
      seoTitle="Hire Verified Freelancers & Software Developers | WorkBridge"
      seoDescription="Hire verified freelancers and software developers with confidence. Instant matching, Behavior Score verification, and payment held until you approve the work."
      seoKeywords="Verified Freelancers, Hire Software Developers, Hire Freelancers, Freelance Talent"
      eyebrow="For Businesses"
      title="Hire Verified Talent. Instantly."
      subtitle="WorkBridge matches you with pre-vetted freelancers and software developers — every hire backed by a live Behavior Score and payment you control."
      heroContent={
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Instant Matching", "Behavior Score Verification", "Quality Assurance"].map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600"
            >
              {pill}
            </span>
          ))}
        </div>
      }
      ctaLabel="Get Started Now"
      onCta={() => onSelect?.("business")}
      features={FEATURES}
    />
  );
}
