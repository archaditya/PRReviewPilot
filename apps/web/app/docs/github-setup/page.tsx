export default function GitHubSetupGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">GitHub Integration & Webhook Setup</h1>
        <p className="text-sm text-gray-400 mt-1">
          Complete guide to integrating ReviewPilot with your GitHub personal or organization repositories.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6 text-sm text-gray-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">Step 1: Create a GitHub App or OAuth App</h2>
          <p>
            Go to <strong>GitHub Settings ➔ Developer settings ➔ OAuth Apps ➔ New OAuth App</strong>.
          </p>
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs space-y-2">
            <div><span className="text-gray-500">Application Name:</span> ReviewPilot Bot</div>
            <div><span className="text-gray-500">Homepage URL:</span> http://localhost:3000</div>
            <div><span className="text-gray-500">Authorization callback URL:</span> http://localhost:4000/api/auth/callback/github</div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">Step 2: Required Scopes & Permissions</h2>
          <p>
            Ensure your app requests the following scopes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li><code className="text-indigo-300">repo</code>: To read pull requests, diffs, and post inline comments.</li>
            <li><code className="text-indigo-300">user:email</code>: For account registration and notifications.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">Step 3: Webhook Registration</h2>
          <p>
            When you connect a repository from the <strong>Repositories</strong> tab in ReviewPilot, the webhook is registered automatically:
          </p>
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs">
            Payload URL: http://your-domain.com/api/webhooks/github<br />
            Content type: application/json<br />
            Events: Pull requests (opened, synchronize, reopened)
          </div>
        </section>
      </div>
    </div>
  );
}
