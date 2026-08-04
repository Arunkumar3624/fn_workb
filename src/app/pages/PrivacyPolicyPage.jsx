import LegalPageLayout, { LegalSection } from "../components/common/LegalPageLayout";

// Grounded in what the app actually does today — verified against the
// codebase rather than written generically. Notably: business verification
// is an admin-reviewed status flip today (no GST/PAN/incorporation
// documents are actually collected or stored yet, even though the
// verification wizard has upload fields for them), and there's no payment
// processor integrated yet — see TermsPage for that disclosure. Both are
// deliberately stated honestly rather than glossed over.
export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="August 3, 2026"
      intro="This page explains what WorkBridge Technologies Pvt. Ltd. ('WorkBridge', 'we', 'us') collects, why, and who can see it. It's written to match what the product actually does — not a generic template."
    >
      <LegalSection title="1. Information we collect">
        <p><strong>Account information.</strong> Name, email address, phone number, and a hashed password when you register. Your role (freelancer, business, or admin) determines what other fields apply to you.</p>
        <p><strong>Profile information.</strong> For freelancers: title, bio, skills, location, and hourly rate. For businesses: company name and related company details. An avatar photo, if you upload one.</p>
        <p><strong>Verification status.</strong> Businesses go through a verification flow before posting jobs. Today, verification is a status our admin team reviews and approves — the document-upload step in that flow (GST certificate, PAN, incorporation documents) is not yet required or stored; we'll update this section when that changes.</p>
        <p><strong>Project and payment activity.</strong> Jobs you post or apply to, project status history, escrow amounts, platform fees, wallet balance, and transaction records. If you request a withdrawal, the UPI ID or bank account and IFSC details you provide so we can process the payout.</p>
        <p><strong>Communications.</strong> Messages sent inside a project's chat, and messages sent to WorkBridge Support. If you attempt to share contact details (phone/email) inside a project chat, the attempt is blocked before it's stored and a record that a blocked attempt occurred is kept — the message content itself is not saved.</p>
        <p><strong>Activity and gamification data.</strong> XP, level, streak, Bridge Tokens, and behavior score — all generated from your real activity on the platform, never purchased or fabricated.</p>
        <p><strong>Usage analytics.</strong> In production, we use PostHog to record page views and key product events (e.g. a job being posted). This is fully disabled in development and only active where explicitly configured.</p>
        <p><strong>Sign-in token.</strong> When you log in, we store a JWT session token in your browser's local storage so you stay signed in. This is not a third-party tracking cookie.</p>
      </LegalSection>

      <LegalSection title="2. How we use this information">
        <ul>
          <li>To operate the core service: matching freelancers and businesses, running escrow-protected projects, and releasing funds when work is approved.</li>
          <li>To review business verification requests and maintain trust & safety, including behavior scores, admin moderation, dispute resolution, and the chat contact-info filter.</li>
          <li>To process withdrawal requests using the payout details you provide.</li>
          <li>To send you one-time verification codes and password-reset codes by email, via our email provider.</li>
          <li>To respond to messages you send WorkBridge Support.</li>
          <li>To understand overall product usage in aggregate, so we know what to fix or improve.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. What's visible to other people">
        <p>Your name, role, avatar, title/bio, and aggregate rating are visible on your public profile. Reviews — written by the other party on a completed project — are shown publicly with the reviewer's name attached, the same way they'd appear on any marketplace. A small number of real reviews may also be featured in the "Wall of Love" section on our homepage.</p>
        <p>Your email address and phone number are never included in any public profile or API response — they're structurally excluded at the database level, not just hidden in the interface.</p>
        <p>WorkBridge admins can see full account information, including project and payment history, when reviewing verification requests, disputes, or security reports.</p>
      </LegalSection>

      <LegalSection title="4. Account deactivation and data retention">
        <p>You can deactivate your own account from Settings → Danger Zone. This immediately signs you out and blocks future logins. Because escrow, transaction, and review records reference other users' history, we don't offer full data erasure today — deactivating is reversible by contacting Support if you change your mind.</p>
      </LegalSection>

      <LegalSection title="5. Who we share data with">
        <ul>
          <li><strong>Render</strong> — hosts our application servers and database.</li>
          <li><strong>Resend</strong> — delivers OTP and password-reset emails on our behalf.</li>
          <li><strong>PostHog</strong> — production-only product analytics, described above.</li>
        </ul>
        <p>We do not sell your data. We do not have a payment processor integrated yet — see our Terms & Conditions for what that means for how payments currently work.</p>
      </LegalSection>

      <LegalSection title="6. Security">
        <p>Passwords are hashed (never stored in plain text). Access to the platform is controlled by role-based permissions enforced on every request, not just hidden in the interface. Admin actions on accounts, disputes, and verifications are logged in an internal audit trail.</p>
      </LegalSection>

      <LegalSection title="7. Age requirement">
        <p>WorkBridge is intended for people who are at least 18 years old. Don't use the platform if you're under 18.</p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>If how we handle your data changes in a meaningful way, we'll update this page and change the "Last updated" date above.</p>
      </LegalSection>

      <LegalSection title="9. Contact us">
        <p>The fastest way to reach us about privacy questions or requests is the Support tab in your WorkBridge dashboard once you're signed in — it's a real, staff-monitored conversation, not a form that disappears into nowhere.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
