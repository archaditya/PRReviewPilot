export default function RulesGuidePage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-orange-500/20 bg-orange-500/5 text-orange-400 mb-3">
          <span>Engine Configuration</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Review Rules & Strictness Policies
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
          Configure AST inspection depth, automated sensitivity thresholds, and custom engineering rules.
        </p>
      </div>

      <div className="space-y-6 text-xs text-neutral-300 leading-relaxed">
        {/* Strictness Tiers */}
        <section className="space-y-3">
          <h2 className="text-xs sm:text-sm font-semibold text-white">1. Strictness Sensitivity Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-emerald-400 uppercase tracking-wider block">Lenient</span>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Flags only critical/high security bugs and fatal runtime exceptions. Zero styling or cosmetic comments.
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-orange-500/30 bg-orange-500/5 space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-orange-400 uppercase tracking-wider block">Balanced (Recommended)</span>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Audits logical correctness, SQL injection, promise leakages, race conditions, and contract breaking.
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-amber-400 uppercase tracking-wider block">Strict</span>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Enforces deep type safety, boundary tests, edge case assertions, and thorough symbol documentation.
              </p>
            </div>
          </div>
        </section>

        {/* Custom Rules Config */}
        <section className="space-y-3">
          <h2 className="text-xs sm:text-sm font-semibold text-white">2. Repository Config Specification</h2>
          <p className="text-neutral-400">
            Define custom review guidelines directly in repository settings or through the API:
          </p>
          <pre className="p-4 rounded-lg bg-[#0e1015] border border-white/10 font-mono text-[11px] text-orange-200/90 overflow-x-auto leading-relaxed">
{`{
  "auto_review_on_pr": true,
  "review_strictness": "balanced",
  "ignored_paths": ["node_modules/**", "*.lock", "dist/**", "build/**"],
  "custom_rules": [
    "Always verify try/catch error handling around asynchronous I/O",
    "Ensure sensitive routes attach rate-limiting and auth middleware",
    "Prevent naked SQL interpolations; enforce parameterized queries",
    "Require descriptive JSDoc on exported utility functions"
  ]
}`}
          </pre>
        </section>
      </div>
    </div>
  );
}
