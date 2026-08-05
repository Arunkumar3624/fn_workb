// Real, built trust pillars — not company logos. WorkBridge doesn't have
// disclosable enterprise partners to name yet, and this app's whole
// philosophy (see LandingPage.jsx's WallOfLove — live reviews, nothing
// written by us) is real data or nothing. Every claim below is something
// this platform actually does, not a number we'd have to make up.
const TRUST_SIGNALS = [
  "ID-Verified Workers & Businesses",
  "Escrow-Protected Payments",
  "Real Dispute Resolution Team",
  "Behavior-Score Trust System",
  "Instant Release on Approval",
  "Transparent, No-Surprise Hiring",
];

// Items are duplicated so the CSS loop transition is seamless
const TRACK = [...TRUST_SIGNALS, ...TRUST_SIGNALS];

export function TrustedPartners() {
  return (
    <div className="wb-partners">
      <p className="wb-partners-label">THE WORKBRIDGE TRUST STANDARD</p>
      <div className="wb-partners-viewport">
        <div className="wb-partners-track">
          {TRACK.map((name, i) => (
            <span key={i} className="wb-partner-chip">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
