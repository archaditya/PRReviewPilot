export default function RulesGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Custom Review Rules & Strictness Policies</h1>
        <p className="text-sm text-gray-400 mt-1">
          Learn how to customize review strictness and configure organization-specific engineering rules.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6 text-sm text-gray-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">Review Sensitivity Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase">Lenient</span>
              <p className="text-xs text-gray-400">
                Flags only critical/high security issues and severe fatal crash defects. No cosmetic nits.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-950 border border-indigo-500/30 space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase">Balanced (Default)</span>
              <p className="text-xs text-gray-400">
                Focuses on correctness, security vulnerabilities, unhandled promise rejections, and performance bottlenecks.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase">Strict</span>
              <p className="text-xs text-gray-400">
                Strict engineering standards: type safety, edge cases, missing test files, and API docs.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">Custom Rules Format</h2>
          <p>
            You can add custom rules per repository in the repository settings JSON. Example:
          </p>
          <pre className="p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs text-indigo-300 overflow-x-auto">
{`{
  "auto_review_on_pr": true,
  "review_strictness": "balanced",
  "ignored_paths": ["node_modules/**", "*.lock", "dist/**"],
  "custom_rules": [
    "Always require try/catch on async database calls",
    "Ensure any new public API endpoint has rate limiting middleware attached",
    "Do not allow raw console.log statements; use logger utility instead"
  ]
}`}
          </pre>
        </section>
      </div>
    </div>
  );
}
