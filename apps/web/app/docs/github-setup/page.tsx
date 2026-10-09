export default function GitHubSetupGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
          GitHub App integration & setup guide
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Step-by-step guide to configure the ReviewPilot GitHub App with webhook verification and inline review permissions.
        </p>
      </div>

      <div className="card-chai p-6 space-y-8 text-xs text-neutral-300 leading-relaxed">
        {/* Step 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500">01</span>
            <h2 className="font-montserrat font-medium text-white text-sm">
              Create a GitHub App
            </h2>
          </div>
          <p className="text-neutral-400">
            Navigate to <strong>GitHub ➔ Settings ➔ Developer settings ➔ GitHub Apps ➔ New GitHub App</strong> (or your Organization Settings ➔ Developer settings ➔ GitHub Apps).
          </p>
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] font-mono text-xs space-y-2 text-neutral-300">
            <div><span className="text-neutral-500">GitHub App name:</span> ReviewPilot Bot (or custom name)</div>
            <div><span className="text-neutral-500">Homepage URL:</span> https://your-domain.com</div>
            <div><span className="text-neutral-500">Callback URL:</span> https://your-domain.com/api/auth/callback/github</div>
            <div><span className="text-neutral-500">Webhook URL:</span> https://your-domain.com/api/webhooks/github</div>
            <div><span className="text-neutral-500">Webhook Secret:</span> (Generate a strong random secret and save to GITHUB_WEBHOOK_SECRET)</div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500">02</span>
            <h2 className="font-montserrat font-medium text-white text-sm">
              Configure repository permissions
            </h2>
          </div>
          <p className="text-neutral-400">
            Under <strong>Repository permissions</strong>, select the following accesses:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
              <span className="font-mono font-medium text-white text-xs">Pull Requests</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">Read & Write (to fetch unified diffs and publish inline review comments)</p>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
              <span className="font-mono font-medium text-white text-xs">Contents</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">Read-only (to clone repository source for Tree-sitter AST indexing)</p>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
              <span className="font-mono font-medium text-white text-xs">Metadata</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">Read-only (automatically selected by GitHub for basic repository telemetry)</p>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
              <span className="font-mono font-medium text-white text-xs">Commit statuses</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">Read & Write (to update pending/success status checks on PRs)</p>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500">03</span>
            <h2 className="font-montserrat font-medium text-white text-sm">
              Subscribe to webhook events
            </h2>
          </div>
          <p className="text-neutral-400">
            Under <strong>Subscribe to events</strong>, check the following event boxes:
          </p>
          <div className="p-3 rounded-lg border border-white/10 bg-white/[0.02] font-mono text-xs text-neutral-300">
            ✓ Pull request (opened, synchronize, reopened)<br />
            ✓ Pull request review comment (created, edited)<br />
            ✓ Issue comment (created)
          </div>
        </section>

        {/* Step 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500">04</span>
            <h2 className="font-montserrat font-medium text-white text-sm">
              Generate private key & configure environment
            </h2>
          </div>
          <p className="text-neutral-400">
            Scroll to <strong>Private keys</strong> and click <strong>Generate a private key</strong>. Save the downloaded <code>.pem</code> file. Add the values to your server environment:
          </p>
          <div className="p-4 rounded-xl border border-white/10 bg-neutral-950 font-mono text-xs text-neutral-300 space-y-1 overflow-x-auto">
            <div>GITHUB_APP_ID=123456</div>
            <div>GITHUB_APP_CLIENT_ID=Iv1.xxxxxxxxxxxx</div>
            <div>GITHUB_APP_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
            <div>GITHUB_WEBHOOK_SECRET=your_configured_secret_token</div>
            <div>GITHUB_APP_PRIVATE_KEY=&quot;-----BEGIN RSA PRIVATE KEY-----\nMIIE...&quot;</div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500">05</span>
            <h2 className="font-montserrat font-medium text-white text-sm">
              Install the App on your repositories
            </h2>
          </div>
          <p className="text-neutral-400">
            Click <strong>Install App</strong> on the left sidebar of your GitHub App settings, and select either <strong>All repositories</strong> or <strong>Only select repositories</strong>. ReviewPilot will immediately synchronize and begin automated AST analysis.
          </p>
        </section>
      </div>
    </div>
  );
}
