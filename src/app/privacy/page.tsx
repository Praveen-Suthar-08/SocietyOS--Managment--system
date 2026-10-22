import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-ink flex flex-col">
      <header className="bg-surface border-b border-border-neutral px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-lg text-ink">SocietyOS</span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Button>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="text-3xl font-display font-bold text-ink mb-6">
          Privacy Policy & Data Retention Policy
        </h1>

        <div className="space-y-6 text-sm text-ink-muted leading-relaxed bg-surface p-6 sm:p-8 rounded-xl border border-border-neutral shadow-xs">
          <section>
            <h2 className="text-base font-semibold text-ink mb-2">1. Scope and Principles</h2>
            <p>
              SocietyOS operates under a strict data minimization principle. We collect and process only the minimal personal information necessary to deliver residential community management, physical gate access control, and emergency incident dispatch.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">2. Visitor Information & QR Code Privacy</h2>
            <p>
              Visitor passes issued by residents generate an opaque, cryptographically signed token string. The visitor QR code contains zero plaintext personal data (names, phone numbers, or unit assignments). Details are resolved strictly on the authenticated security console upon physical verification.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">3. Video Footage and CCTV Privacy</h2>
            <p>
              SocietyOS does not store or process raw video stream binaries within the application database. Camera viewing permissions are restricted to authorized security personnel with mandatory access audit logging. Real camera streams require a verified external streaming gateway.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">4. Data Retention Limits</h2>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Visitor check-in logs: Retained for 90 days, then archived or purged per society policy.</li>
              <li>Emergency incidents and timelines: Retained permanently in audit logs for legal compliance.</li>
              <li>Unaccepted onboarding invitations: Automatically expire after 7 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">5. Resident Household Isolation</h2>
            <p>
              Residents have visibility only into their own household tickets, passes, incidents, and bookings. SocietyOS strictly rejects cross-household data queries on the server.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-surface border-t border-border-neutral py-6 text-center text-xs text-ink-muted">
        © 2026 SocietyOS · Privacy & Operations Standards
      </footer>
    </div>
  );
}
