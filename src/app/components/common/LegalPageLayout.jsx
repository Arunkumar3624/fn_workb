import { useDocumentTitle } from "../../hooks/useDocumentTitle";

// Shared scaffold for the two legal pages (Privacy Policy, Terms &
// Conditions) — plain content pages, no data fetching, styled to match the
// rest of the marketing site rather than pulling in an unused typography
// plugin.
export default function LegalPageLayout({ title, lastUpdated, intro, children }) {
  useDocumentTitle(`${title} — WorkBridge`);

  return (
    <div className="bg-[#F8FAFC] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1
            className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-5xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-400">Last updated {lastUpdated}</p>
          {intro && <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600">{intro}</p>}
        </div>

        <div className="mt-12 space-y-10 rounded-3xl border border-white/50 bg-white/70 p-8 shadow-sm backdrop-blur-md sm:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2
        className="text-xl font-extrabold text-[#0F172A]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 [&_a]:font-semibold [&_a]:text-[#1B3FAB] [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-slate-800 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
