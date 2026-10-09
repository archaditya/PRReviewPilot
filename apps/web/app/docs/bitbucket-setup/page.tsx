export default function BitbucketSetupGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
          Bitbucket Cloud OAuth 2.0 integration guide
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Connect your Atlassian Bitbucket Cloud workspace and repositories to ReviewPilot for automated PR reviews.
        </p>
      </div>

      <div className="card-chai p-6 space-y-8 text-xs text-neutral-300 leading-relaxed">
        {/* Step 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500">01</span>
            <h2 className="font-montserrat font-medium text-white text-sm">
              Create an OAuth 2.0 Consumer
            </h2>
          </div>
          <p className="text-neutral-400">
            In your Bitbucket Workspace settings, navigate to <strong>Workspace settings ➔ Apps and features ➔ OAuth consumers ➔ Add consumer</strong>:
          </p>
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] font-mono text-xs space-y-2 text-neutral-300">
            <div><span className="text-neutral-500">Name:</span> ReviewPilot Bot</div>
            <div><span className="text-neutral-500">Callback URL:</span> https://your-domain.com/api/auth/callback/bitbucket</div>
            <div><span className="text-neutral-500">Privacy:</span> Check &quot;This is a private consumer&quot;</div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500">02</span>
            <h2 className="font-montserrat font-medium text-white text-sm">
              Configure required consumer permissions
            </h2>
          </div>
          <p className="text-neutral-400">
            Enable the following permission scopes for the OAuth consumer:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
              <span className="font-mono font-medium text-white text-xs">Account</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">Read, Email (for authenticating workspace members)</p>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
              <span className="font-mono font-medium text-white text-xs">Repositories</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">Read, Write (to clone branches and read diffs)</p>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
              <span className="font-mono font-medium text-white text-xs">Pull requests</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">Read, Write (required for posting inline review findings)</p>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
              <span className="font-mono font-medium text-white text-xs">Webhooks</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">Read and write (to register pull request webhook triggers)</p>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500">03</span>
            <h2 className="font-montserrat font-medium text-white text-sm">
              Configure environment variables
            </h2>
          </div>
          <p className="text-neutral-400">
            Copy the generated <strong>Key</strong> (Client ID) and <strong>Secret</strong> from Bitbucket to your environment:
          </p>
          <div className="p-4 rounded-xl border border-white/10 bg-neutral-950 font-mono text-xs text-neutral-300 space-y-1">
            <div>BITBUCKET_CLIENT_ID=your_consumer_key</div>
            <div>BITBUCKET_CLIENT_SECRET=your_consumer_secret</div>
            <div>BITBUCKET_CALLBACK_URL=https://your-domain.com/api/auth/callback/bitbucket</div>
          </div>
        </section>

        {/* Step 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500">04</span>
            <h2 className="font-montserrat font-medium text-white text-sm">
              Connect via ReviewPilot Dashboard
            </h2>
          </div>
          <p className="text-neutral-400">
            Open the <strong>Repositories</strong> tab in ReviewPilot, click <strong>Connect Bitbucket</strong>, and authorize your workspace. Repositories will sync automatically and register webhooks for <code>pullrequest:created</code> and <code>pullrequest:updated</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
