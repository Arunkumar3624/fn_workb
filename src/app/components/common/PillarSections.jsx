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
import { motion } from "motion/react";
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
            {trustMatrix.map((item, i) => (
              <motion.div
                key={item}
                className="wb-check-row"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
              >
                <Check size={18} /> <span>{item}</span>
              </motion.div>
            ))}
          </div>
          <SectionAction showLink={showLink} to="/hire-talent" onClick={() => onSelect("business")}>
            Find Top Talent
          </SectionAction>
        </div>

        <motion.div
          className="wb-dashboard-preview"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="wb-dashboard-head">
            <div>
              <p className="inline-flex items-center gap-1.5">
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden="true"
                />
                Smart Matching
              </p>
              <h3>Ready-to-Hire</h3>
            </div>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="inline-flex"
            >
              <Timer size={22} />
            </motion.span>
          </div>

          <div className="wb-metric-row">
            {[
              { label: "Match", value: "96%" },
              { label: "Time-to-Hire", value: "<24h" },
              { label: "Active", value: "18" },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.08, ease: "easeOut" }}
              >
                <Metric label={metric.label} value={metric.value} />
              </motion.div>
            ))}
          </div>

          {[
            ["Senior React Developer", "Verified · Ready to Hire", "92%"],
            ["Automation Specialist", "Fast Response · Available", "88%"],
            ["Product Designer", "Open for Work", "84%"],
          ].map(([role, tag, score], i) => (
            <motion.div
              key={role}
              className="wb-candidate-row"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ x: -2 }}
              transition={{ duration: 0.35, delay: 0.35 + i * 0.1, ease: "easeOut" }}
            >
              <div>
                <strong>{role}</strong>
                <span dangerouslySetInnerHTML={{ __html: tag }} />
              </div>
              <b>{score}</b>
            </motion.div>
          ))}
        </motion.div>
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
