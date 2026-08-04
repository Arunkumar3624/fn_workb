import LegalPageLayout, { LegalSection } from "../components/common/LegalPageLayout";

// Grounded in the platform's real mechanics (project status flow, admin
// dispute resolution, tier-based fees, behavior score) rather than a
// generic template. Section 3 in particular says plainly that no live
// payment gateway is integrated yet — WorkBridge is early access, and a
// Terms page that implied otherwise would misrepresent how money actually
// moves today.
export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      lastUpdated="August 3, 2026"
      intro="These terms cover how WorkBridge actually works today — including what's still early access — not just boilerplate language."
    >
      <LegalSection title="1. Acceptance & eligibility">
        <p>By creating a WorkBridge account, you agree to these Terms and our Privacy Policy. You must be at least 18 years old and provide accurate account information. You're responsible for activity that happens under your account.</p>
      </LegalSection>

      <LegalSection title="2. Freelancer and business accounts">
        <p>WorkBridge connects freelancers ("workers") with businesses. Businesses can post jobs to the open board or invite a specific freelancer directly; freelancers can apply to open jobs or accept direct invites. A business account is reviewed by our admin team before it can post jobs — we call this "verified."</p>
      </LegalSection>

      <LegalSection title="3. Payments today — please read this">
        <p>WorkBridge is in early access. Escrow status, wallet balances, platform fees, and transaction history are all tracked as real records in our system. However, <strong>we do not yet have a live payment gateway connecting to a bank or card network</strong> — no money moves automatically through WorkBridge today.</p>
        <p>When a freelancer requests a withdrawal, our team reviews the request and pays it out directly to the UPI ID or bank account you provide. We'll update this section the moment a live, automated payment processor is integrated.</p>
      </LegalSection>

      <LegalSection title="4. How a project works">
        <ul>
          <li>A business invites a freelancer, or a freelancer applies to an open job.</li>
          <li>Once accepted, the project budget is marked as secured in escrow before work begins.</li>
          <li>The freelancer submits completed work; the business reviews it and either approves it or requests a revision.</li>
          <li>On approval, funds are released to the freelancer's wallet, minus our platform fee.</li>
          <li>Either party can then leave a public review of the other.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Platform fees">
        <p>WorkBridge deducts a platform fee from the project budget when funds are released to a freelancer. Your exact fee percentage depends on your account tier, which rises with real activity on the platform — your current rate is always shown in your dashboard before you accept a payout.</p>
      </LegalSection>

      <LegalSection title="6. Cancellations and disputes">
        <p>A project can be cancelled by either party before it's marked complete. If the two sides disagree — about the work, a cancellation, or anything else affecting escrowed funds — either party can raise a dispute. Funds stay frozen until a WorkBridge admin reviews the situation and decides whether to release funds to the freelancer or refund the business. This is a human decision, not an automated formula.</p>
      </LegalSection>

      <LegalSection title="7. Trust, safety & behavior score">
        <p>Every account has a behavior score reflecting real activity and conduct on the platform. Attempting to share contact details inside project chat to move payment off-platform is blocked automatically and may affect your standing. Serious or repeated violations can lead to a warning, suspension, or account ban, at our admin team's discretion.</p>
      </LegalSection>

      <LegalSection title="8. Reviews">
        <p>Reviews are tied to a specific completed project and are shown publicly, attached to the reviewer's name. Don't post reviews that are false, abusive, or written about a project that didn't happen.</p>
      </LegalSection>

      <LegalSection title="9. Business verification">
        <p>Business verification today is a status reviewed and approved by our admin team based on your account information. It is not currently a substitute for your own independent diligence on who you're working with.</p>
      </LegalSection>

      <LegalSection title="10. Features shown as a preview">
        <p>Some parts of WorkBridge — like the Billing & Subscriptions section in Settings — are shown as a preview of plans we're building toward. They are not currently active, charged, or enforced.</p>
      </LegalSection>

      <LegalSection title="11. Prohibited conduct">
        <ul>
          <li>Circumventing WorkBridge to pay or be paid outside the platform for work arranged here.</li>
          <li>Harassment, fraud, or providing false verification information.</li>
          <li>Attempting to access another account or bypass a suspension.</li>
        </ul>
      </LegalSection>

      <LegalSection title="12. Suspension & termination">
        <p>We can suspend or ban an account for violating these terms. You can deactivate your own account at any time from Settings → Danger Zone; this is reversible by contacting Support.</p>
      </LegalSection>

      <LegalSection title="13. Disclaimer">
        <p>WorkBridge is provided "as is." We mediate disputes in good faith but don't guarantee a particular outcome, and we're not liable for indirect or consequential damages arising from your use of the platform, to the fullest extent the law allows.</p>
      </LegalSection>

      <LegalSection title="14. Changes to these terms">
        <p>We may update these terms as the platform evolves — especially as payments and verification move from early access to fully live. We'll update the "Last updated" date above when we do.</p>
      </LegalSection>

      <LegalSection title="15. Governing law">
        <p>WorkBridge Technologies Pvt. Ltd. is an Indian company, and these terms are governed by the laws of India.</p>
      </LegalSection>

      <LegalSection title="16. Contact us">
        <p>Questions about these terms? Use the Support tab in your WorkBridge dashboard — it's a real, staff-monitored conversation.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
