import Link from 'next/link';
import { Shield, Lock, FileText, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { LandingHeader } from '@/components/landing-header';

export const metadata = {
  title: 'Privacy Policy | ReviewPilot',
  description: 'Digital Personal Data Protection Act (DPDP Act 2023) compliant privacy policy and notice of personal data processing for ReviewPilot.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0c0e12] text-neutral-100 font-sans antialiased flex flex-col selection:bg-orange-500/30">
      <LandingHeader />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-10">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-orange-500/25 bg-orange-500/10 text-[11px] font-mono text-orange-300">
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            <span>Digital Personal Data Protection Act, 2023 (DPDP) Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-montserrat">
            Privacy Policy & Notice of Processing
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            Last Updated: November 03, 2026 &bull; Effective Immediately
          </p>
        </div>

        <div className="card-chai p-6 sm:p-8 space-y-8 text-xs sm:text-sm leading-relaxed text-neutral-300 font-sans">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">01.</span> Introduction & Scope
            </h2>
            <p>
              ReviewPilot (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), operated by Spire Hubs, provides automated AI-powered pull request reviews and code knowledge graph analysis. We are committed to protecting your personal data in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>DPDP Rules, 2025</strong>, the <strong>Information Technology Act, 2000</strong>, and CERT-In directions.
            </p>
            <p>
              This Privacy Notice explains what personal data and repository metadata we collect, why we collect it, how it is processed and protected, your statutory rights as a Data Principal, and how you may contact our designated Grievance Officer.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">02.</span> Personal Data We Collect
            </h2>
            <p>We collect only the minimum data necessary to provide automated code reviews and account authentication:</p>
            <ul className="list-disc list-inside space-y-1.5 text-neutral-300 pl-2">
              <li><strong>Account Identification:</strong> Full name, business email address, and hashed authentication credentials.</li>
              <li><strong>Git Integration Credentials:</strong> GitHub or Bitbucket user IDs, usernames, and installation tokens granted via OAuth apps or GitHub App installations.</li>
              <li><strong>Code Review Metadata:</strong> Repository full names, commit hashes, pull request titles, branch names, and code diff hunks submitted for automated AST analysis.</li>
              <li><strong>Technical Telemetry & Network Logs:</strong> Client IP address, user agent, session cookies, and API request timestamps (retained for 1 year per CERT-In cybersecurity mandates).</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">03.</span> Purpose of Processing & Legal Basis
            </h2>
            <p>Under Section 4 and Section 6 of the DPDP Act, we process personal and repository data solely based on your explicit consent for the following specified purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1">
                <span className="font-semibold text-white text-xs block">Automated Code Review</span>
                <p className="text-[11px] text-neutral-400">Parsing PR diffs, extracting Abstract Syntax Trees (ASTs), and detecting security flaws or broken contracts.</p>
              </div>
              <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1">
                <span className="font-semibold text-white text-xs block">Blast Radius Graph Queries</span>
                <p className="text-[11px] text-neutral-400">Building and querying temporary Neo4j symbol graphs to verify callers and callees affected by pull requests.</p>
              </div>
              <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1">
                <span className="font-semibold text-white text-xs block">Account Security & Authentication</span>
                <p className="text-[11px] text-neutral-400">Issuing secure HTTP-only JWT session tokens and preventing unauthorized cross-tenant workspace access.</p>
              </div>
              <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1">
                <span className="font-semibold text-white text-xs block">Audit Logging & Incident Defense</span>
                <p className="text-[11px] text-neutral-400">Maintaining security audit trails required by CERT-In Directions and Indian cyber compliance regulations.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">04.</span> Zero Training on Customer Source Code
            </h2>
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Strict Zero-Retention Code Review Policy</span>
              </div>
              <p className="text-xs text-neutral-300">
                ReviewPilot <strong>never uses your proprietary code, AST graphs, or pull request diffs to train or fine-tune public foundation AI models</strong>. Code diffs processed through LLM APIs use zero-data-retention enterprise endpoints.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">05.</span> Third-Party Sub-Processors
            </h2>
            <p>We share minimal necessary data strictly with certified data processors bound by security obligations:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border border-white/10 rounded-lg overflow-hidden">
                <thead className="bg-white/5 border-b border-white/10 text-neutral-400">
                  <tr>
                    <th className="py-2 px-3">Processor</th>
                    <th className="py-2 px-3">Purpose</th>
                    <th className="py-2 px-3">Data Processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">GitHub / Bitbucket</td>
                    <td className="py-2 px-3">Source repository hosting & webhook delivery</td>
                    <td className="py-2 px-3 text-[11px]">Pull requests, branch refs, OAuth tokens</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">LLM Gateway (OpenAI / Anthropic / Gemini)</td>
                    <td className="py-2 px-3">Natural language review synthesis & code analysis</td>
                    <td className="py-2 px-3 text-[11px]">Sanitized PR diff hunks (ephemeral, zero retention)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Neo4j Graph Database</td>
                    <td className="py-2 px-3">AST node symbol indexing & blast radius queries</td>
                    <td className="py-2 px-3 text-[11px]">Function symbols, signatures, call references</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">06.</span> Your Rights as a Data Principal (DPDP s.11–14)
            </h2>
            <p>Under Indian data protection laws, you possess the following statutory rights:</p>
            <ul className="list-disc list-inside space-y-1.5 text-neutral-300 pl-2">
              <li><strong>Right to Access Information:</strong> Request a complete summary of personal data held about you via our self-service data export.</li>
              <li><strong>Right to Correction & Erasure (Right to be Forgotten):</strong> Request the permanent deletion of your account, credentials, and repository ASTs via Workspace Settings.</li>
              <li><strong>Right of Grievance Redressal:</strong> File a complaint directly with our designated Grievance Officer, with guaranteed acknowledgment within 48 hours.</li>
              <li><strong>Right to Nominate:</strong> Nominate another individual to exercise your privacy rights in the event of death or incapacity.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">07.</span> Grievance Officer & Contact Details
            </h2>
            <p>
              In compliance with Section 8(9) of the DPDP Act and Rule 5(9) of the Information Technology Rules, 2011, inquiries and complaints regarding data processing may be directed to our Grievance Officer:
            </p>
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1.5 font-mono text-xs">
              <p className="text-white font-medium">Designated Grievance Officer: <span className="text-orange-400">Data Protection & Redressal Officer</span></p>
              <p className="text-neutral-300">Organization: Spire Hubs / ReviewPilot</p>
              <p className="text-neutral-300">Official Email: <a href="mailto:grievance@reviewpilot.archadi.dev" className="text-orange-400 underline">grievance@reviewpilot.archadi.dev</a></p>
              <p className="text-neutral-400 text-[11px]">SLA: Grievances acknowledged within 48 hours and resolved within 30 days.</p>
              <div className="pt-2">
                <Link href="/grievance" className="text-xs text-orange-400 hover:text-orange-300 underline font-sans">
                  Visit Grievance & Redressal Page &rarr;
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 bg-[#0c0e12] text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <span>&copy; {new Date().getFullYear()} ReviewPilot &bull; Spire Hubs</span>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="text-white hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/grievance" className="hover:text-white transition-colors">Grievance Officer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
