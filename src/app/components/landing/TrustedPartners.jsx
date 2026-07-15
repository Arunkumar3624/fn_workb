const PARTNERS = [
  "Tata Group", "Infosys", "Wipro", "HCL Tech", "Reliance",
  "Flipkart", "Zomato", "Razorpay", "PhonePe", "Google",
  "Microsoft", "Amazon", "Ola Cabs", "HDFC Bank", "Swiggy",
];

// Items are duplicated so the CSS loop transition is seamless
const TRACK = [...PARTNERS, ...PARTNERS];

export function TrustedPartners() {
  return (
    <div className="wb-partners">
      <p className="wb-partners-label">TRUSTED BY INDIA'S FASTEST-GROWING COMPANIES</p>
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
