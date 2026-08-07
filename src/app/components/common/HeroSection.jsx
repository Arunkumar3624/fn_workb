import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Lock, Search, Star, Users } from "lucide-react";
import heroVideoSrc from "../../assets/I_checked_the_video_again_The.mp4";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";

const trustItems = ["Vetted.", "Seamless.", "Secure."];

export function HeroSection({ onSelect }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Previously ignored whatever was typed here and sent everyone straight
  // to login regardless — now it actually searches the real, public Job
  // Board (see PublicJobFeed.jsx), which needs no account to browse.
  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/jobs?q=${encodeURIComponent(trimmed)}` : "/jobs");
  };

  return (
    <section className="wb-hero">
      <GlassCard className="wb-hero-card">
        {/* Fluid glass bubbles — decorative only, first in the DOM so
            every real element below stacks above it automatically. */}
        <div className="wb-hero-bubbles" aria-hidden="true">
          <span className="wb-bubble wb-bubble--1" />
          <span className="wb-bubble wb-bubble--2" />
          <span className="wb-bubble wb-bubble--3" />
          <span className="wb-bubble wb-bubble--4" />
          <span className="wb-bubble wb-bubble--5" />
        </div>

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
            Talent<span>Meets</span> <span>Opportunity.</span>
          </h1>
          <p>Hire verified talent in minutes. Pay only after the work is completed.</p>

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

        <form className="wb-search" onSubmit={handleSearch}>
          <Search size={22} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search 500,000+ open gigs by skill…"
          />
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
