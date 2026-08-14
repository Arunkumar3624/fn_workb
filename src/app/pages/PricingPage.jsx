import LegalPageLayout, { LegalSection } from "../components/common/LegalPageLayout";

export default function PricingPage() {
  return (
    <LegalPageLayout
      title="Pricing & Commission"
      lastUpdated="August 14, 2026"
      intro="What WorkBridge charges, who it charges, and how the fee tier system works — no hidden percentages."
    >
      <LegalSection id="overview" title="1. Overview">
        <p>
          Posting a job, applying to one, and messaging on WorkBridge are all free. WorkBridge earns a platform fee
          only when a project is completed and paid out — it's deducted from the Worker's payout, not charged to
          the Business on top of the project budget.
        </p>
      </LegalSection>

      <LegalSection id="how-fees-work" title="2. How the Fee Works">
        <p>
          When a Business funds Escrow for a project, the full agreed budget is held. When the project is approved
          and completed, WorkBridge deducts a platform fee from that amount before releasing the remainder to the
          Worker. The Business is never charged more than the budget they funded.
        </p>
      </LegalSection>

      <LegalSection id="fee-tiers" title="3. Fee Tiers">
        <p>
          The fee percentage depends on the Worker's account tier, which rises automatically as they complete more
          work and build reputation on the platform. A higher tier means WorkBridge keeps a smaller share of every
          payout.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="py-2 pr-4 font-semibold">Tier</th>
                <th className="py-2 pr-4 font-semibold">Platform Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 pr-4">Standard</td>
                <td className="py-2 pr-4">10.00%</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 pr-4">Silver</td>
                <td className="py-2 pr-4">9.00%</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 pr-4">Gold</td>
                <td className="py-2 pr-4">8.50%</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 pr-4">Platinum</td>
                <td className="py-2 pr-4">8.25%</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Diamond</td>
                <td className="py-2 pr-4">8.00%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          This fee is deducted only on the Worker's side of a payout. WorkBridge does not charge Businesses a
          separate commission on top of the project budget they fund.
        </p>
      </LegalSection>

      <LegalSection id="whats-free" title="4. What's Free">
        <ul>
          <li>Creating an account, as a Business or a Worker</li>
          <li>Posting a job</li>
          <li>Applying to a job or inviting a Worker</li>
          <li>Messaging, file sharing, and project management tools</li>
          <li>Business Verification</li>
          <li>Standard-tier withdrawals</li>
        </ul>
      </LegalSection>

      <LegalSection id="perks-shop" title="5. Perks Shop">
        <p>
          Both Businesses and Workers can optionally spend Bridge Tokens (an in-app currency, not real money) in the
          Perks Shop on things like post visibility boosts or priority queueing for disputes and withdrawals. These
          are optional add-ons layered on top of the free core platform, not required to post, apply, or get paid —
          see the <a href="/refund-policy">Refund &amp; Cancellation Policy</a> for how Perks Shop purchases are
          handled.
        </p>
      </LegalSection>

      <LegalSection id="not-live" title="6. Subscription Plans & Trust Tiers">
        <p>
          WorkBridge is previewing (but has not launched) optional paid Subscription Plans and an expanded Trust &amp;
          Verification tier system. Both are shown in the app as a preview only — nothing is chargeable today, and
          no user is billed for them. This page will be updated with real pricing if and when they launch.
        </p>
      </LegalSection>

      <LegalSection id="payment-gateway-note" title="7. A Note on Live Payments">
        <p>
          As described in our <a href="/terms">Terms &amp; Conditions</a> §5, WorkBridge does not yet have a live,
          automated payment gateway — Escrow funding and Worker payouts are currently verified and processed
          manually by our team. The fee structure above is real and already applied to every completed project; only
          the automation of the money movement itself is pending.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="8. Questions About Pricing">
        <p>
          If you're a signed-in user, the fastest way to reach us is the Support tab in your dashboard. You can also
          reach us using the details on our <a href="/contact">Contact Us</a> page.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
