import { Briefcase, Eye, Headset, Lock, ShieldCheck, Zap } from "lucide-react";
import PillarPageLayout from "../components/common/PillarPageLayout";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Payouts",
    description: "Cash out approved work in 60 seconds flat — no invoices, no chasing net-30 terms.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Clients",
    description: "Every business is ID- and payment-verified before they can post a job, so you never chase a ghost client.",
  },
  {
    icon: Lock,
    title: "Payment Protection",
    description: "Funds are secured before you start work and released the moment it's approved — your pay is never at risk.",
  },
  {
    icon: Briefcase,
    title: "Thousands of Freelance Jobs",
    description: "From dev to design to content, new freelance jobs are posted every hour across every category.",
  },
  {
    icon: Eye,
    title: "Transparent Bidding",
    description: "See the full budget upfront and submit one clean proposal — no hidden platform games.",
  },
  {
    icon: Headset,
    title: "24/7 Dispute Support",
    description: "A real WorkBridge Legal team steps in if a project goes sideways, so you're never negotiating alone.",
  },
];

export default function FindWorkPage({ onSelect }) {
  return (
    <PillarPageLayout
      seoTitle="Find Freelance Jobs with Instant Payment | WorkBridge"
      seoDescription="Browse freelance jobs from verified clients and get paid instantly. WorkBridge protects every payment so freelancers get paid on time, every time."
      seoKeywords="Freelance Jobs, Instant Payment Freelance, Freelance Marketplace, Get Paid Fast"
      eyebrow="For Freelancers"
      title="Find Freelance Jobs. Get Paid Instantly."
      subtitle="WorkBridge connects freelancers with verified clients and moves your earnings to your wallet in 60 seconds — not 60 days."
      heroContent={
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Instant Payouts", "Verified Clients", "Payment Protection"].map((pill) => (
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
      onCta={() => onSelect?.("worker")}
      features={FEATURES}
    />
  );
}
