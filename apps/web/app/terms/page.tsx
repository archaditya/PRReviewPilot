import Link from 'next/link';
import { FileText, Scale, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import { LandingHeader } from '@/components/landing-header';

export const metadata = {
  title: 'Terms of Service | ReviewPilot',
  description: 'Terms of Service, acceptable use guidelines, and liability limitations for the ReviewPilot automated AI code review platform.',
};

export default function TermsOfServicePage() {
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
            <Scale className="w-3.5 h-3.5 text-orange-400" />
            <span>Standard SaaS Agreement &bull; Indian Contract Act, 1872</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-montserrat">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            Last Updated: November 03, 2026 &bull; Version 2026.1
          </p>
        </div>

        <div className="card-chai p-6 sm:p-8 space-y-8 text-xs sm:text-sm leading-relaxed text-neutral-300 font-sans">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">01.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, registering for, or using ReviewPilot (&ldquo;Service&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our <Link href="/privacy" className="text-orange-400 underline">Privacy Policy</Link>. If you are using the Service on behalf of a company or organization, you represent that you have the authority to bind that entity to these Terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">02.</span> Eligibility & Age Requirement
            </h2>
            <p>
              The Service is strictly intended for professional software developers and organizations. In compliance with the Digital Personal Data Protection Act, 2023, you must be <strong>at least 18 years of age</strong> to create an account or connect repositories to ReviewPilot. We do not knowingly offer services to or collect data from children under 18.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">03.</span> Automated AI Code Review Disclaimer
            </h2>
            <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Advisory Nature of AI Suggestions</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-300">
                ReviewPilot utilizes hybrid Abstract Syntax Tree (AST) analysis and Large Language Models (LLMs) to generate automated pull request feedback. <strong>All comments, security classifications, contract warnings, and code recommendations are provided strictly on an &ldquo;AS IS&rdquo; advisory basis.</strong>
              </p>
              <p className="text-xs leading-relaxed text-neutral-300">
                You and your development team remain solely responsible for validating, testing, and reviewing all code changes prior to merging or deploying to production. We do not guarantee that the Service will identify every vulnerability, bug, or contract breach.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">04.</span> Intellectual Property & Code Ownership
            </h2>
            <p>
              You retain <strong>100% exclusive intellectual property ownership</strong> of your source code, repositories, commit histories, and review artifacts.
            </p>
            <p>
              By authorizing our GitHub App or Bitbucket integration, you grant ReviewPilot only the limited, temporary license necessary to clone, parse AST symbols into Neo4j, compute diff hunks, and post inline comments to your pull requests. ReviewPilot does not train foundation AI models on your private source code.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">05.</span> Acceptable Use Policy
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-neutral-300 pl-2">
              <li>Submit repositories containing known malware, ransomware, or malicious exploits intended to compromise the Service infrastructure.</li>
              <li>Attempt unauthorized penetration testing, reverse engineering of the AST parsing pipeline, or scraping of cross-tenant user data.</li>
              <li>Exceed or bypass rate limits, token quotas, or automated CI/CD safeguards.</li>
              <li>Authorize repositories for which you do not possess legal authorization or ownership.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">06.</span> Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable Indian law, ReviewPilot and Spire Hubs shall not be liable for any indirect, incidental, consequential, special, or punitive damages, including loss of profits, data corruption, software bugs, production outages, or security breaches resulting from reliance on automated code review feedback.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">07.</span> Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes, claims, or controversies arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts of New Delhi, India.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <span className="text-orange-400 font-mono text-xs">08.</span> Account Termination & Grievances
            </h2>
            <p>
              You may terminate your account at any time via the self-service Account Deletion tool in Workspace Settings. For any legal or contractual inquiries, please contact our Grievance Officer at <a href="mailto:grievance@reviewpilot.archadi.dev" className="text-orange-400 underline">grievance@reviewpilot.archadi.dev</a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 bg-[#0c0e12] text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <span>&copy; {new Date().getFullYear()} ReviewPilot &bull; Spire Hubs</span>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/grievance" className="hover:text-white transition-colors">Grievance Officer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
