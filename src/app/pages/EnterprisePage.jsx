import { BarChart3, FileCheck2, Headset, ShieldCheck, Users, UserCog } from "lucide-react";
import PillarPageLayout from "../components/common/PillarPageLayout";

const FEATURES = [
  {
    icon: UserCog,
    title: "Dedicated Account Management",
    description: "A named WorkBridge account manager owns your rollout, hiring pipeline, and escalations end to end.",
  },
  {
    icon: Users,
    title: "Bulk Hiring",
    description: "Staff up entire teams at once with batch job posting, shared shortlists, and coordinated onboarding.",
  },
  {
    icon: FileCheck2,
    title: "Service Level Agreements",
    description: "Guaranteed response times, delivery windows, and escalation paths — backed by a formal SLA, not a promise.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    description: "SSO, audit logs, and role-based access controls keep your hiring data compliant and contained.",
  },
  {
    icon: BarChart3,
    title: "Custom Invoicing & Reporting",
    description: "Consolidated billing, spend dashboards, and exportable reports built for finance and procurement teams.",
  },
  {
    icon: Headset,
    title: "Priority Support",
    description: "Skip the queue — enterprise accounts get a direct line to WorkBridge support, 24/7.",
  },
];

export default function EnterprisePage({ onSelect }) {
  return (
    <PillarPageLayout
      seoTitle="Enterprise Freelance Solutions | Scale Your Team with WorkBridge"
      seoDescription="Scale your team with WorkBridge Enterprise — dedicated account management, bulk hiring, and Service Level Agreements built for organizations."
      seoKeywords="Enterprise Freelance Solutions, Scale Team, Bulk Hiring, Enterprise Freelancers"
      eyebrow="For Enterprise"
      title="Scale Your Team with Enterprise Freelance Solutions"
      subtitle="Bulk hiring, dedicated account management, and Service Level Agreements — WorkBridge Enterprise is built for organizations that hire at scale."
      heroContent={
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Account Management", "Bulk Hiring", "Service Level Agreements"].map((pill) => (
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
