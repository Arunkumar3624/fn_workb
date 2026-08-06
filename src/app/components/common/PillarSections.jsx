import {
  ArrowRight,
  Award,
  CalendarClock,
  Check,
  FileCheck2,
  Headphones,
  PlugZap,
  Timer,
  Wallet,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";
import { ChromaGrid } from "./ChromaGrid";

const workFeatures = [
  {
    title: "Earn Your Reputation",
    text: "Complete quality projects and let your profile speak for itself",
    Icon: Award,
  },
  {
    title: "Get Paid Instantly",
    text: "Your earnings are protected and delivered as soon as your work is completed.",
    Icon: Wallet,
    badge: "Instant Payout",
  },
  {
    title: "Work Your Way",
    text: "Choose projects that match your skills, schedule and Growth Speak it-self",
    Icon: CalendarClock,
  },
];

const trustMatrix = ["Verified Talent", "Secure Earnings", "Quick Connection"];

const enterpriseHighlights = [
  {
    title:"Dedicated Hiring Partner",
    text: "One expert. Personalized support. Faster hiring from start to finish.",
    Icon: Headphones,
  },
  {
    title: "Business Integrations",
    text: "Connect seamlessly with the software your business already relies on.",
    Icon: PlugZap,
  },  
  {
    title: "Bulk Hiring & Compliance",
    text: "Hire hundreds of professionals while we handle compliance and verification.",
    Icon: FileCheck2,
  },
];

export function FindWorkSection({ showLink = true, onSelect }) {
  return (
    <section className="wb-section" id="find-work">
      <SectionHeader eyebrow="Earn For Your Work" title="Where Hard Work Meets Opportunity" />

      <ChromaGrid gridClassName="wb-card-grid wb-card-grid--three">
        {workFeatures.map(({ title, text, Icon, badge }) => (
          <GlassCard key={title} className="wb-feature-card wb-feature-card--float">
            <span className="wb-icon-tile">
              <Icon size={26} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
            {badge && (
              <span className="wb-status-badge">
                <Zap size={14} /> {badge}
              </span>
            )}
          </GlassCard>
        ))}
      </ChromaGrid>

      <SectionAction showLink={showLink} to="/find-work" onClick={() => onSelect("worker")}>
        Stop Waiting. Start Earning.
      </SectionAction>
    </section>
  );
}

export function HireTalentSection({ showLink = true, onSelect }) {
  return (
    <section className="wb-section" id="hire-talent">
      <SectionHeader eyebrow="Hire Talent" title="Build your dream team in minutes, not weeks." />

      <GlassCard className="wb-trust-matrix">
        <div>
          <p className="wb-mini-label">WorkBridge Trust Layer</p>
          <div className="wb-check-stack">
            {trustMatrix.map((item) => (
              <div key={item} className="wb-check-row">
                <Check size={18} /> <span>{item}</span>
              </div>
            ))}
          </div>
          <SectionAction showLink={showLink} to="/hire-talent" onClick={() => onSelect("business")}>
            Find Top Talent
          </SectionAction>
        </div>

        <div className="wb-dashboard-preview">
          <div className="wb-dashboard-head">
            <div>
              <p>Smart Matching </p>
              <h3>Ready-to-Hire</h3>
            </div>
            <Timer size={22} />
          </div>

          <div className="wb-metric-row">
            <Metric label="Match" value="96%" />
            <Metric label="Time-to-Hire" value="&lt;24h" />
            <Metric label="Active" value="18" />
          </div>

          {[
            ["Senior React Developer", "Verified · Ready to Hire", "92%"],
            ["Automation Specialist",  "Fast Response · Available",        "88%"],
            ["Product Designer",       "Open for Work",             "84%"],
          ].map(([role, tag, score]) => (
            <div key={role} className="wb-candidate-row">
              <div>
                <strong>{role}</strong>
                <span dangerouslySetInnerHTML={{ __html: tag }} />
              </div>
              <b>{score}</b>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}

export function EnterpriseSection({ showLink = true, onSelect }) {
  return (
    <section className="wb-section" id="enterprise">
      <div className="wb-section-split-head">
        <SectionHeader eyebrow="Enterprise" title="Onboard Fully Vetted Talent in Hours, Not Weeks" />
        <SectionAction
          showLink={showLink}
          to="/enterprise"
          variant="outline"
          onClick={() => onSelect("business")}
        >
          Book a Free Consultation
        </SectionAction>
      </div>

      <div className="wb-card-grid wb-card-grid--three">
        {enterpriseHighlights.map(({ title, text, Icon }) => (
          <GlassCard key={title} className="wb-feature-card wb-enterprise-card">
            <span className="wb-icon-tile">
              <Icon size={26} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

export function PillarSections({ onSelect, showLink = true }) {
  return (
    <>
      <FindWorkSection  showLink={showLink} onSelect={onSelect} />
      <HireTalentSection showLink={showLink} onSelect={onSelect} />
      <EnterpriseSection showLink={showLink} onSelect={onSelect} />
    </>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="wb-section-header">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}

function SectionAction({ children, showLink, to, variant = "primary", onClick }) {
  if (showLink) {
    return (
      <Link to={to} className={`wb-button wb-button--${variant}`}>
        {children} <ArrowRight size={16} />
      </Link>
    );
  }

  return (
    <Button variant={variant} onClick={onClick}>
      {children} <ArrowRight size={16} />
    </Button>
  );
}

function Metric({ label, value }) {
  return (
    <div className="wb-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
