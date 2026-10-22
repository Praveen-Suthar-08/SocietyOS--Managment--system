'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  UserCheck,
  Building,
  Wrench,
  Bell,
  Lock,
  ArrowRight,
  CheckCircle2,
  Eye,
  Sparkles,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function LandingPage() {
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-brand/15 scroll-smooth">
      {/* Top Banner: Emergency Disclaimer */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 text-center font-medium border-b border-slate-800">
        <span className="font-semibold text-emerald-400">SocietyOS Residential Management Platform</span>
        <span className="mx-2 text-slate-500">·</span>
        <span className="text-slate-300">
          Notice: In an immediate life-threatening emergency, call local emergency services directly (112 / 911).
        </span>
      </div>

      {/* Main Navigation - Fixed / Sticky with blur */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border-neutral transition-colors shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#" onClick={scrollToTop} className="flex items-center gap-2.5 group cursor-pointer" title="Back to top">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-ink group-hover:text-brand transition-colors">
                SocietyOS
              </span>
              <span className="text-[10px] text-ink-muted -mt-1 font-medium">Greenfield Heights</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-brand hover:scale-105 transition-all cursor-pointer">Platform Features</a>
            <a href="#workspaces" onClick={(e) => scrollToSection(e, 'workspaces')} className="hover:text-brand hover:scale-105 transition-all cursor-pointer">Role Workspaces</a>
            <a href="#security" onClick={(e) => scrollToSection(e, 'security')} className="hover:text-brand hover:scale-105 transition-all cursor-pointer">Security & Privacy</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-brand hover:scale-105 transition-all cursor-pointer">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="primary" size="sm" className="font-bold shadow-xs flex items-center gap-1.5 px-3 sm:px-4">
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden text-ink-muted hover:text-ink p-1.5 rounded-lg hover:bg-surface-muted border border-border-neutral cursor-pointer"
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="md:hidden border-t border-border-neutral bg-surface p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <a
              href="#features"
              onClick={(e) => {
                scrollToSection(e, 'features');
                setIsMobileNavOpen(false);
              }}
              className="block text-sm font-semibold text-ink-muted hover:text-brand"
            >
              Platform Features
            </a>
            <a
              href="#workspaces"
              onClick={(e) => {
                scrollToSection(e, 'workspaces');
                setIsMobileNavOpen(false);
              }}
              className="block text-sm font-semibold text-ink-muted hover:text-brand"
            >
              Role Workspaces
            </a>
            <a
              href="#security"
              onClick={(e) => {
                scrollToSection(e, 'security');
                setIsMobileNavOpen(false);
              }}
              className="block text-sm font-semibold text-ink-muted hover:text-brand"
            >
              Security & Privacy
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                scrollToSection(e, 'faq');
                setIsMobileNavOpen(false);
              }}
              className="block text-sm font-semibold text-ink-muted hover:text-brand"
            >
              FAQ
            </a>
          </div>
        )}
      </header>

      {/* Hero Section with Scroll Animations */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full text-center overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold mb-6 animate-pulse shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Operational Integrity · Multi-Role Architecture · Next-Gen Society OS</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-ink tracking-tight max-w-4xl mx-auto leading-[1.15]">
          A safer, more connected <br />
          <span className="text-brand bg-gradient-to-r from-brand to-emerald-500 bg-clip-text text-transparent">residential community.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed">
          SocietyOS coordinates residential emergency response, gate visitor check-in, occupancy records, and facility operations in one authoritative, auditable platform.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/sign-in">
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all font-bold">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <a href="#preview">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto hover:bg-surface-elevated transition-colors">
              View Live Preview
              <ChevronDown className="w-4 h-4 ml-1.5 animate-bounce" />
            </Button>
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-muted font-medium">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border-neutral">
            <CheckCircle2 className="w-4 h-4 text-brand" /> Strict Server-Side RBAC
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border-neutral">
            <CheckCircle2 className="w-4 h-4 text-brand" /> MongoDB Append-Only Audit Logs
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border-neutral">
            <CheckCircle2 className="w-4 h-4 text-brand" /> Realtime Failover & Zero Fake Feeds
          </span>
        </div>
      </section>

      {/* Product Preview Section with Hover Cards */}
      <section id="preview" className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full mb-20 scroll-mt-20">
        <div className="rounded-2xl border border-border-neutral bg-surface shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          {/* Disclosure Header */}
          <div className="bg-surface-elevated px-4 py-3 border-b border-border-neutral flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-ink font-mono">
                Product preview — Greenfield Heights sample live telemetry
              </span>
            </div>
            <span className="text-xs text-ink-muted">
              Authoritative multi-role residential management dashboard
            </span>
          </div>

          {/* Dashboard Preview Shell */}
          <div className="p-4 sm:p-6 lg:p-8 bg-canvas">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="hover:-translate-y-1 transition-transform duration-200">
                <CardHeader className="pb-2">
                  <CardDescription>Active Units</CardDescription>
                  <CardTitle className="text-2xl font-mono text-ink">148 / 160</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-brand font-medium">92.5% Occupancy Rate</span>
                </CardContent>
              </Card>

              <Card className="hover:-translate-y-1 transition-transform duration-200">
                <CardHeader className="pb-2">
                  <CardDescription>Visitors Inside</CardDescription>
                  <CardTitle className="text-2xl font-mono text-ink">14 Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-ink-muted">Gate 1: 9 · Gate 2: 5</span>
                </CardContent>
              </Card>

              <Card className="hover:-translate-y-1 transition-transform duration-200">
                <CardHeader className="pb-2">
                  <CardDescription>Active Incidents</CardDescription>
                  <CardTitle className="text-2xl font-mono text-amber-500">1 Triage</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatusBadge status="ACKNOWLEDGED" labelOverride="Responder Dispatched" />
                </CardContent>
              </Card>

              <Card className="hover:-translate-y-1 transition-transform duration-200">
                <CardHeader className="pb-2">
                  <CardDescription>Open Maintenance</CardDescription>
                  <CardTitle className="text-2xl font-mono text-ink">3 Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-ink-muted">1 Plumbing · 2 Electrical</span>
                </CardContent>
              </Card>
            </div>

            {/* Simulated Live Table */}
            <div className="bg-surface rounded-xl border border-border-neutral overflow-hidden">
              <div className="px-4 py-3 bg-surface-elevated border-b border-border-neutral flex items-center justify-between">
                <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                  Live Incident & Visitor Stream
                </span>
                <span className="text-xs text-brand font-mono font-medium">Verified Telemetry</span>
              </div>
              <div className="divide-y divide-border-neutral text-sm">
                <div className="p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <StatusBadge status="EMERGENCY" labelOverride="INC-20261020-001" />
                    <div>
                      <p className="font-semibold text-xs text-ink">Lift Stoppage between Floor 4 & 5</p>
                      <p className="text-[11px] text-ink-muted">Tower B · Passenger Lift · Reported 12m ago</p>
                    </div>
                  </div>
                  <StatusBadge status="ACKNOWLEDGED" labelOverride="Security On Scene" />
                </div>

                <div className="p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <StatusBadge status="ACTIVE" labelOverride="VIS-8492" />
                    <div>
                      <p className="font-semibold text-xs text-ink">Guest Entry Check-in Verified</p>
                      <p className="text-[11px] text-ink-muted">Unit A-402 · 2 Guests · Gate 1 Entry</p>
                    </div>
                  </div>
                  <span className="text-xs text-ink-muted font-mono">12:04 PM</span>
                </div>

                <div className="p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <StatusBadge status="MAINTENANCE" labelOverride="UNIT C-102" />
                    <div>
                      <p className="font-semibold text-xs text-ink">Water Pipeline Repair Scheduled</p>
                      <p className="text-[11px] text-ink-muted">Marked under maintenance by Society Admin</p>
                    </div>
                  </div>
                  <span className="text-xs text-ink-muted font-mono">11:30 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full border-t border-border-neutral scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-display font-bold text-ink">
            Built for operational precision
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Every module addresses a distinct operational requirement with server-side validation and traceable audit history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:-translate-y-1.5 transition-all duration-300">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-emergency flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <CardTitle>Emergency Coordination</CardTitle>
              <CardDescription>
                SOS alerts with category triage, location confirmation, and persistent audit timeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-ink-muted space-y-2">
              <p>• Medical, fire/smoke, security threat, elevator issues.</p>
              <p>• Resilient fallback: incidents persist in MongoDB before real-time dispatch.</p>
              <p>• Reconnect recovery and polling when offline.</p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1.5 transition-all duration-300">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-2">
                <UserCheck className="w-5 h-5" />
              </div>
              <CardTitle>Visitor Pass & Gate Desk</CardTitle>
              <CardDescription>
                Pre-approved guest passes with opaque QR payloads and atomic check-in/out.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-ink-muted space-y-2">
              <p>• Zero resident PII stored in QR codes.</p>
              <p>• Atomic validation prevents double check-ins.</p>
              <p>• Manual entry logs require audited reason codes.</p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1.5 transition-all duration-300">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                <Building className="w-5 h-5" />
              </div>
              <CardTitle>Occupancy & Unit Management</CardTitle>
              <CardDescription>
                Authoritative unit inventory with vacancy listings and move-in event history.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-ink-muted space-y-2">
              <p>• Statuses: Vacant, Occupied, Reserved, Maintenance.</p>
              <p>• Conditional writes prevent contradictory occupancy records.</p>
              <p>• Opt-in vacancy directory redacts previous occupant history.</p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1.5 transition-all duration-300">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-2">
                <Wrench className="w-5 h-5" />
              </div>
              <CardTitle>Maintenance & Facilities</CardTitle>
              <CardDescription>
                Service ticket lifecycle with urgency routing, photo attachments, and comments.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-ink-muted space-y-2">
              <p>• Cross-household privacy isolation.</p>
              <p>• Structured status transitions with activity log.</p>
              <p>• Amenity booking engine with capacity conflict checks.</p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1.5 transition-all duration-300">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                <Bell className="w-5 h-5" />
              </div>
              <CardTitle>Notices & Announcements</CardTitle>
              <CardDescription>
                Audience-targeted bulletins with immutable publication and correction audit logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-ink-muted space-y-2">
              <p>• Target audience: All, Residents Only, or Security.</p>
              <p>• Correction history prevents silent tampering with safety notices.</p>
              <p>• Read status receipts per household.</p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1.5 transition-all duration-300">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-surface-elevated text-ink flex items-center justify-center mb-2">
                <Eye className="w-5 h-5" />
              </div>
              <CardTitle>Honest CCTV Boundary</CardTitle>
              <CardDescription>
                Real permission-controlled camera inventory without exposed credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-ink-muted space-y-2">
              <p>• Zero RTSP credentials or camera IPs in browser.</p>
              <p>• Temporary signed playback tokens for authorized security staff.</p>
              <p>• Honest &quot;Not configured&quot; state when hardware is absent.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Role Workspaces */}
      <section id="workspaces" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full border-t border-border-neutral scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-display font-bold text-ink">
            Three dedicated operational consoles
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Separated by strict server-side permissions and distinct workflow requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-border-neutral bg-surface hover:-translate-y-1.5 transition-all duration-300 hover:border-brand/40 shadow-xs">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
              Resident PWA
            </span>
            <h3 className="text-lg font-bold font-display mt-3 text-ink">Household Workspace</h3>
            <p className="text-sm text-ink-muted mt-2">
              Optimized for mobile touchscreens. Fast SOS reporting, visitor pass creation, complaint submission, amenity reservations, and parcel delivery tracking.
            </p>
            <div className="mt-4 pt-4 border-t border-border-neutral">
              <Link href="/resident">
                <span className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
                  Explore Resident Console <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border-neutral bg-surface hover:-translate-y-1.5 transition-all duration-300 hover:border-blue-500/40 shadow-xs">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Security Officer
            </span>
            <h3 className="text-lg font-bold font-display mt-3 text-ink">Gate Operations Console</h3>
            <p className="text-sm text-ink-muted mt-2">
              High-speed keyboard and touch interface for visitor pass verification, package receipt, emergency triage, checkpoint patrols, and shift handover logging.
            </p>
            <div className="mt-4 pt-4 border-t border-border-neutral">
              <Link href="/security">
                <span className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
                  Explore Security Desk <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border-neutral bg-surface hover:-translate-y-1.5 transition-all duration-300 hover:border-brand/40 shadow-xs">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
              Society Administrator
            </span>
            <h3 className="text-lg font-bold font-display mt-3 text-ink">Executive Command Center</h3>
            <p className="text-sm text-ink-muted mt-2">
              Comprehensive governance over units, occupancy, invitations, announcement publishing, camera configurations, maintenance routing, and immutable audit logs.
            </p>
            <div className="mt-4 pt-4 border-t border-border-neutral">
              <Link href="/admin">
                <span className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
                  Explore Admin Center <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Honest Disclosures */}
      <section id="security" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full border-t border-border-neutral scroll-mt-16">
        <div className="bg-surface border border-border-neutral rounded-2xl p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold text-ink">
              Security & Operational Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-ink-muted">
            <div>
              <h3 className="font-semibold text-ink mb-1">Invite-Only Access Control</h3>
              <p>
                Strict authorization boundary. Residents and officers onboard through secure one-time credentials or registered household units. Role-based sessions are verified on every API request.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-1">Server-Side Authorization Everywhere</h3>
              <p>
                Permissions are validated on the server for every request. Client route guards are UX enhancements, not security boundaries. Multi-tenant society scoping is enforced on all database queries.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-1">Transparent CCTV Boundary</h3>
              <p>
                SocietyOS does not simulate fake video streams. RTSP credentials never touch the browser. Browser viewing requires an external secured WebRTC/HLS gateway; otherwise, it remains unconfigured.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-1">Emergency Service Notice</h3>
              <p>
                SocietyOS facilitates community dispatch and coordination. It is not a certified replacement for official municipal emergency response (fire, police, ambulance).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full border-t border-border-neutral scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center text-ink mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface border border-border-neutral">
              <h3 className="font-semibold text-ink">How do residents and security officers join?</h3>
              <p className="text-sm text-ink-muted mt-1">
                Users can register with their unit assignment or receive an invitation token from the Society Administrator. Role-based access ensures instant routing to their respective console.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border-neutral">
              <h3 className="font-semibold text-ink">What happens if the real-time notification service goes down?</h3>
              <p className="text-sm text-ink-muted mt-1">
                All business records (incidents, visitor check-ins) are written to MongoDB first. The frontend detects disconnection, updates the indicator, and falls back to durable HTTP polling every 5 seconds.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border-neutral">
              <h3 className="font-semibold text-ink">Can other residents see my visitor logs or tickets?</h3>
              <p className="text-sm text-ink-muted mt-1">
                No. Cross-household queries are rejected on the server via strict resource ownership verification. Residents only see records matching their own household.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-base text-white">SocietyOS</span>
            <span className="text-xs text-slate-400 ml-2">v1.0.0</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/security-policy" className="hover:text-white transition-colors">Security Statement</Link>
            <Link href="/sign-in" className="hover:text-white transition-colors">Get Started</Link>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 SocietyOS. Built for operational security and community management.
          </p>
        </div>
      </footer>
    </div>
  );
}
