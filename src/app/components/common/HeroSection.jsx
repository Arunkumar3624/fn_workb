import { ArrowRight, Check, Lock, Search, Star, Users } from "lucide-react";
import heroVideoSrc from "../../assets/I_checked_the_video_again_The.mp4";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";

const trustItems = ["Vetted.", "Seamless.", "Secure."];

export function HeroSection({ onSelect }) {
  return (
    <section className="wb-hero">
      <GlassCard className="wb-hero-card">
        <div className="wb-hero-copy">
          <div className="wb-badge-row">
            <span className="wb-pill">
              <Users size={18} /> + WORKFORCE
            </span>
            <span className="wb-pill">
              <Lock size={18} /> SECURE
            </span>
          </div>

          <h1>
            CONNECTING <span>BUSINESS</span> &amp; <span>WORKERS.</span>
          </h1>
          <p>Match with verified talent in 5 minutes. Pay only when the work is done.</p>

          <div className="wb-trust-list">
            {trustItems.map((item) => (
              <span key={item}>
                <Check size={14} /> {item}
              </span>
            ))}
          </div>
        </div>

        {/* wb-hero-media-wrap handles entry animation; wb-hero-media handles hover */}
        <div className="wb-hero-media-wrap">
          <div className="wb-hero-media">
            <video src={heroVideoSrc} autoPlay loop muted playsInline />
            <span className="wb-video-badge">A BRIGHTER FUTURE</span>
          </div>
        </div>

        <form
          className="wb-search"
          onSubmit={(event) => {
            event.preventDefault();
            onSelect("business");
          }}
        >
          <Search size={22} />
          <input type="text" placeholder="Search 500,000+ verified experts by skill…" />
          <Button type="submit">
            Search <ArrowRight size={18} />
          </Button>
        </form>

        <div className="wb-expert-pill">
          <Star size={16} /> 500,000+ Experts
        </div>
      </GlassCard>
    </section>
  );
}
