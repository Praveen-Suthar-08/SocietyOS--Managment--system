import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Key, EyeOff, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecurityStatementPage() {
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
          Security Statement & Architecture
        </h1>

        <div className="space-y-6 text-sm text-ink-muted leading-relaxed bg-surface p-6 sm:p-8 rounded-xl border border-border-neutral shadow-xs">
          <div className="flex items-start gap-4 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink mb-1">Server-Side Authorization Everywhere</h2>
              <p>
                Permissions are strictly enforced on the server for every request, server action, export, and stream playback request. Client-side route guards provide responsive UX, but never serve as the security control.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink mb-1">Multi-Factor Authentication (MFA)</h2>
              <p>
                Privileged accounts (Administrator and Security Officer) are protected with mandatory TOTP Multi-Factor Authentication and recovery codes. Session cookies are marked HttpOnly, Secure, and SameSite=Lax.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink mb-1">CCTV Credential Isolation</h2>
              <p>
                Camera RTSP credentials, network passwords, and local IP addresses reside strictly on the server or local LAN. The browser client receives only temporary, 60-second signed playback grants. If hardware is absent, the system displays an honest &quot;Not configured&quot; state.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink mb-1">Durable Outbox & Event Integrity</h2>
              <p>
                Emergency SOS incidents and gate entry records are committed to MongoDB before any real-time notification is broadcast. A downstream real-time provider failure never compromises business record durability.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface border-t border-border-neutral py-6 text-center text-xs text-ink-muted">
        © 2026 SocietyOS · Security & Operations Standards
      </footer>
    </div>
  );
}
