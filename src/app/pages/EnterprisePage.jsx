import { BarChart3, FileCheck2, Headset, ShieldCheck, Users, UserCog } from "lucide-react";
import PillarPageLayout from "../components/common/PillarPageLayout";

const FEATURES = [
  {
    icon: UserCog,
    title: "Dedicated Account Management",
    description: "You get one named WorkBridge contact who owns your rollout from day one — hiring, escalations, all of it.",
  },
  {
    icon: Users,
    title: "Bulk Hiring",
    description: "Need to staff up fast? Post in bulk, share shortlists across your team, and onboard everyone together.",
  },
  {
    icon: FileCheck2,
    title: "Service Level Agreements",
    description: "Real guaranteed response times and delivery windows — backed by a formal SLA, not just our word.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    description: "SSO, audit logs, and role-based access — your hiring data stays exactly as controlled as you need it.",
  },
  {
    icon: BarChart3,
    title: "Custom Invoicing & Reporting",
    description: "One consolidated bill, live spend dashboards, and reports your finance team can actually export and use.",
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
      subtitle="Bulk hiring, a dedicated account manager, and real SLAs — WorkBridge Enterprise is built for teams that hire at scale."
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
