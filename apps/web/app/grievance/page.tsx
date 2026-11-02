import Link from 'next/link';
import { Mail, Clock, ShieldCheck, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import { LandingHeader } from '@/components/landing-header';

export const metadata = {
  title: 'Grievance Officer & Redressal | ReviewPilot',
  description: 'Designated Grievance Officer, contact details, and statutory complaint resolution SLAs under India’s DPDP Act 2023 and IT Rules 2011.',
};

export default function GrievancePage() {
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
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>DPDP Act Section 8(9) &bull; IT Rules 2011 Rule 5(9)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-montserrat">
            Grievance Redressal Mechanism
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            Mandatory Redressal Officer Contact &amp; Escalation Timelines
          </p>
        </div>

        <div className="card-chai p-6 sm:p-8 space-y-8 text-xs sm:text-sm leading-relaxed text-neutral-300 font-sans">
          {/* Statutory Commitment */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat">
              Commitment to Timely Grievance Resolution
            </h2>
            <p>
              In accordance with Section 8(9) and Section 8(10) of the <strong>Digital Personal Data Protection Act, 2023</strong> and Rule 5(9) of the <strong>Information Technology (Reasonable Security Practices &amp; Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>, ReviewPilot has established an effective, accessible, and transparent mechanism to resolve questions, disputes, and grievances from Data Principals.
            </p>
          </section>

          {/* Grievance Officer Card */}
          <div className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4">
            <h3 className="font-montserrat font-semibold text-white text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span>Designated Grievance &amp; Data Protection Officer</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs pt-2">
              <div>
                <span className="text-neutral-500 block text-[11px]">Designation:</span>
                <span className="text-white font-medium">Data Protection &amp; Redressal Officer</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Entity:</span>
                <span className="text-white font-medium">ReviewPilot / Spire Hubs</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Official Redressal Email:</span>
                <a href="mailto:grievance@reviewpilot.archadi.dev" className="text-orange-400 hover:text-orange-300 underline">
                  grievance@reviewpilot.archadi.dev
                </a>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Jurisdiction:</span>
                <span className="text-white font-medium">New Delhi / NCR, India</span>
              </div>
            </div>
          </div>

          {/* SLAs and Timelines */}
          <section className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Statutory Resolution Timelines (SLAs)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>48-Hour Acknowledgment</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  Upon receiving your email or complaint, our Grievance Officer will issue a unique ticket reference number within 48 hours.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>30-Day Substantive Resolution</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  All grievances regarding data access, rectification, account erasure, or processing authorization will be fully resolved within 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* How to lodge a grievance */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-white font-montserrat">
              How to File a Grievance
            </h2>
            <p>To ensure prompt resolution, please provide the following in your communication:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 pl-2">
              <li>Your registered ReviewPilot account email address.</li>
              <li>A clear description of your data request (e.g. data export, account erasure, or unauthorized processing concern).</li>
              <li>Relevant repository names or pull request identifiers if applicable.</li>
            </ol>
            <p className="pt-2">
              Send your email directly to: <a href="mailto:grievance@reviewpilot.archadi.dev" className="text-orange-400 font-mono font-medium underline">grievance@reviewpilot.archadi.dev</a>.
            </p>
          </section>

          {/* Appellate Authority */}
          <section className="space-y-2 border-t border-white/10 pt-6 text-xs text-neutral-400">
            <h3 className="font-semibold text-white text-xs font-montserrat">Escalation to Data Protection Board of India</h3>
            <p>
              Under Section 13(3) of the DPDP Act, if you do not receive a response within the prescribed timeline or are dissatisfied with the resolution provided by our Grievance Officer, you retain the legal right to register an appeal with the <strong>Data Protection Board of India (DPBI)</strong>.
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
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/grievance" className="text-white hover:text-white transition-colors">Grievance Officer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
