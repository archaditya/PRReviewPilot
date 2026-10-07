export default function BitbucketSetupGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bitbucket Cloud OAuth 2.0 Integration</h1>
        <p className="text-sm text-gray-400 mt-1">
          How to connect your Atlassian Bitbucket Cloud workspace and repositories to ReviewPilot.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6 text-sm text-gray-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">Step 1: Create an OAuth 2.0 Consumer</h2>
          <p>
            In your Bitbucket Workspace settings, navigate to <strong>Apps and features ➔ OAuth consumers ➔ Add consumer</strong>:
          </p>
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs space-y-2">
            <div><span className="text-gray-500">Name:</span> ReviewPilot Bot</div>
            <div><span className="text-gray-500">Callback URL:</span> http://localhost:4000/api/auth/callback/bitbucket</div>
            <div><span className="text-gray-500">This is a private consumer:</span> Checked (true)</div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">Step 2: Permissions Required</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li><strong>Account:</strong> Read, Email</li>
            <li><strong>Repositories:</strong> Read, Write</li>
            <li><strong>Pull requests:</strong> Read, Write (required for posting inline suggestions)</li>
            <li><strong>Webhooks:</strong> Read and write</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">Step 3: Webhook Event Keys</h2>
          <p>
            ReviewPilot subscribes to the following Bitbucket Cloud webhook events:
          </p>
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs">
            - pullrequest:created (triggers initial AI review)<br />
            - pullrequest:updated (triggers re-analysis upon new commits)
          </div>
        </section>
      </div>
    </div>
  );
}
