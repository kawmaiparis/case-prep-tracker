import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[480px] space-y-8 text-center">

        {/* Wordmark */}
        <p className="text-xs font-semibold text-muted tracking-widest uppercase">
          Case Prep
        </p>

        {/* Heading + copy */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-primary leading-snug">
            About this project
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            A personal tool I built to track and analyze my case interview practice —
            scoring each session across five dimensions, spotting patterns over time,
            and turning the data into a drill plan.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Every line of code was written with Claude Code. The irony of using AI
            to prep for consulting interviews is not lost on me.
          </p>
        </div>

        {/* Back link */}
        <Link href="/gate" className="text-xs text-muted hover:text-primary transition-colors">
          ← Back
        </Link>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-6 inset-x-0 text-center">
        <p className="text-xs text-muted">
          Built by{" "}
          <a
            href="https://linkedin.com/in/parismongkolkul"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Paris Mongkolkul
          </a>
        </p>
      </footer>
    </div>
  );
}
