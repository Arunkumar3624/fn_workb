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

const workFeatures = [
  {
    title: "Build your Reputation",
    text: "Behavior Score makes strong delivery visible, so better clients can find you faster.",
    Icon: Award,
  },
  {
    title: "Get Paid Instantly",
    text: "Approved work releases payment right away with a clear Instant Payout badge.",
    Icon: Wallet,
    badge: "Instant Payout",
  },
  {
    title: "Own Your Schedule",
    text: "Choose projects that fit your hours, skills, and momentum without losing control.",
    Icon: CalendarClock,
  },
];

const trustMatrix = ["Verified Talent", "Payment Protection", "Instant Matching"];

const enterpriseHighlights = [
  {
    title: "Dedicated Account Manager",
    text: "One expert partner to plan demand, unblock hiring, and keep teams aligned.",
    Icon: Headphones,
  },
  {
    title: "API & SaaS Integrations",
    text: "Connect WorkBridge to the tools your ops, finance, and hiring teams already use.",
    Icon: PlugZap,
  },
  {
    title: "Bulk Hiring & Compliance",
    text: "Run high-volume onboarding with document checks, clear records, and less manual work.",
    Icon: FileCheck2,
  },
];

export function FindWorkSection({ showLink = true, onSelect }) {
  return (
    <section className="wb-section" id="find-work">
      <SectionHeader eyebrow="Find Work" title="Your ambition, paid on time. Every time." />

      <div className="wb-card-grid wb-card-grid--three">
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
      </div>

      <SectionAction showLink={showLink} to="/find-work" onClick={() => onSelect("worker")}>
        Start Earning
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
          <p className="wb-mini-label">Trust Matrix</p>
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
              <p>5-Minute Matching Algorithm</p>
              <h3>Live talent shortlist</h3>
            </div>
            <Timer size={22} />
          </div>

          <div className="wb-metric-row">
            <Metric label="Match" value="96%" />
            <Metric label="Time-to-Hire" value="&lt;24h" />
            <Metric label="Active" value="18" />
          </div>

          {[
            ["Senior React Developer", "Verified · Payment Ready", "92%"],
            ["Automation Specialist",  "Hired in &lt; 24h",        "88%"],
            ["Product Designer",       "Available now",             "84%"],
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
        <SectionHeader eyebrow="Enterprise" title="Deploy Vetted Talent in Hours, Not Weeks." />
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
