import { HeroSection } from "../components/common/HeroSection";
import { TrustedPartners } from "../components/landing/TrustedPartners";
import { PillarSections } from "../components/common/PillarSections";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function LandingPage({ onSelect }) {
  useDocumentTitle("WorkBridge — Freelance Marketplace for Verified Talent");

  return (
    <>
      <HeroSection onSelect={onSelect} />
      <TrustedPartners />
      {/* showLink={false} forces all section CTAs to call onSelect() → /auth directly */}
      <PillarSections onSelect={onSelect} showLink={false} />
    </>
  );
}
