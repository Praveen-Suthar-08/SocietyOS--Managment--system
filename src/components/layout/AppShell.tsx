'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Home,
  AlertTriangle,
  UserCheck,
  Wrench,
  Bell,
  Calendar,
  Package,
  Video,
  FileText,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Building,
  KeyRound,
  Compass,
  ClipboardList,
  User,
  Check,
  Trash2,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { signOut } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ToastContainer, showAppToast } from '@/components/ui/toast-notification';
import { useSyncStore } from '@/lib/sync-store';

export type UserRole = 'RESIDENT' | 'SECURITY' | 'ADMIN';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isEmergency?: boolean;
}

interface AppShellProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName?: string;
  userUnit?: string;
  societyName?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  message: string;
  read: boolean;
  type: 'urgent' | 'info' | 'visitor';
}

interface EmergencyIncident {
  _id: string;
  incidentNumber: string;
  category: string;
  severity: string;
  unitId: string;
  locationDescription: string;
  description: string;
  status: string;
  reporterName: string;
  createdAt: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Water Supply Tank Cleaning',
    time: 'Today, 9:00 AM',
    message: 'Periodic overhead water tank cleaning scheduled for Thursday 10:00 AM to 2:00 PM.',
    read: false,
    type: 'info',
  },
  {
    id: 'n-2',
    title: 'Lift Maintenance Quarterly Check',
    time: 'Yesterday',
    message: 'Passenger Lift in Tower B has completed quarterly preventive maintenance.',
    read: false,
    type: 'info',
  },
  {
    id: 'n-3',
    title: 'Visitor Pass Verified at Gate 1',
    time: '2h ago',
    message: 'Visitor Vikram Sethi was verified by Main Gate security for Unit A-402.',
    read: true,
    type: 'visitor',
  },
];

export function AppShell({
  children,
  userRole,
  userName = 'Aarav Sharma',
  userUnit = 'A-402',
  societyName = 'Greenfield Heights',
}: AppShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  // Dynamic profile name & unit synced with localStorage
  const [currentName, setCurrentName] = React.useState(userName);
  const [currentUnit, setCurrentUnit] = React.useState(userUnit);

  // Notifications state with useSyncStore (avoids overwriting on mount)
  const [notifications, setNotifications] = useSyncStore<NotificationItem[]>(
    'societyos_notifications',
    DEFAULT_NOTIFICATIONS
  );

  // Emergency Incidents for global banner
  const [activeEmergencies, setActiveEmergencies] = React.useState<EmergencyIncident[]>([]);
  const [selectedEmergency, setSelectedEmergency] = React.useState<EmergencyIncident | null>(null);

  const notifRef = React.useRef<HTMLDivElement>(null);
  const settingsRef = React.useRef<HTMLDivElement>(null);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync profile from localStorage & listen for updates (isolated by userRole)
  React.useEffect(() => {
    const loadProfile = () => {
      try {
        if (userRole === 'RESIDENT') {
          const saved = localStorage.getItem('societyos_profile');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.fullName) setCurrentName(parsed.fullName);
            if (parsed.unit) setCurrentUnit(parsed.unit);
          } else {
            setCurrentName(userName);
            setCurrentUnit(userUnit);
          }
        } else if (userRole === 'SECURITY') {
          const savedHandovers = localStorage.getItem('societyos_shift_handovers');
          if (savedHandovers) {
            const parsed = JSON.parse(savedHandovers);
            if (parsed && parsed.length > 0 && parsed[0].incomingOfficer) {
              const officerNameOnly = parsed[0].incomingOfficer.split(' (')[0];
              setCurrentName(officerNameOnly);
              if (parsed[0].postLocation) setCurrentUnit(parsed[0].postLocation);
            } else {
              setCurrentName(userName);
              setCurrentUnit(userUnit);
            }
          } else {
            setCurrentName(userName);
            setCurrentUnit(userUnit);
          }
        } else {
          setCurrentName(userName);
          setCurrentUnit(userUnit);
        }
      } catch {}
    };

    loadProfile();
    const handleProfileUpdate = () => loadProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('societyos_sync', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('societyos_sync', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [userRole, userName, userUnit]);

  // Poll for active emergencies every 5s with role header for tab isolation
  React.useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const res = await fetch('/api/emergency/incidents', {
          headers: {
            'x-demo-role': userRole,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const active = (data.incidents || []).filter((i: EmergencyIncident) => i.status === 'ACTIVE');
          setActiveEmergencies(active);
        }
      } catch {}
    };

    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 5000);
    return () => clearInterval(interval);
  }, [userRole]);

  // Close menus on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile drawer on route change
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Robust Logout function
  const handleLogout = async () => {
    try {
      await signOut();
    } catch {}
    try {
      document.cookie = 'better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.removeItem('societyos_session');
    } catch {}
    window.location.href = '/sign-in';
  };

  // Notification actions
  const toggleNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showAppToast('All notifications marked as read', 'success');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showAppToast('All notifications cleared', 'info');
  };

  // Authorize emergency resolution
  const handleResolveEmergency = async (incident: EmergencyIncident) => {
    try {
      await fetch(`/api/emergency/incidents/${incident._id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': userRole,
        },
        body: JSON.stringify({
          resolutionNotes: `Emergency incident #${incident.incidentNumber} inspected and cleared on-scene by ${userRole}. Situation safe.`,
        }),
      });
    } catch {}
    setActiveEmergencies((prev) => prev.filter((e) => e._id !== incident._id));
    setSelectedEmergency(null);
    showAppToast(`Emergency alert #${incident.incidentNumber} marked RESOLVED and cleared`, 'success');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sidebar navigation items (SETTINGS removed from sidebar per request!)
  const residentNavItems: NavItem[] = [
    { label: 'Overview', href: '/resident', icon: Home },
    { label: 'Emergency SOS', href: '/resident/emergency', icon: AlertTriangle, isEmergency: true },
    { label: 'Guest Passes', href: '/resident/visitors', icon: UserCheck },
    { label: 'Maintenance', href: '/resident/maintenance', icon: Wrench },
    { label: 'Notices', href: '/resident/announcements', icon: Bell },
    { label: 'Amenities', href: '/resident/amenities', icon: Calendar },
    { label: 'Parcels', href: '/resident/parcels', icon: Package },
  ];

  const securityNavItems: NavItem[] = [
    { label: 'Operations Desk', href: '/security', icon: Shield },
    { label: 'Gate Entry/Exit', href: '/security/entry-exit', icon: KeyRound },
    { label: 'Gate Roster & Officers', href: '/security/gates', icon: Users, badge: 'Live' },
    { label: 'Visitor Lookup', href: '/security/visitors', icon: UserCheck },
    { label: 'Parcel Desk', href: '/security/parcels', icon: Package },
    { label: 'Active Incidents', href: '/security/incidents', icon: AlertTriangle, badge: 'Live' },
    { label: 'CCTV Feeds', href: '/security/cameras', icon: Video },
    { label: 'Patrol Checks', href: '/security/patrol', icon: Compass },
    { label: 'Shift Handover', href: '/security/shift-handover', icon: ClipboardList },
    { label: 'Announcements', href: '/security/announcements', icon: Bell },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Command Center', href: '/admin', icon: Building },
    { label: 'Units & Occupancy', href: '/admin/units', icon: Home },
    { label: 'Residents', href: '/admin/residents', icon: Users },
    { label: 'Security Team', href: '/admin/security-team', icon: Shield },
    { label: 'Incidents', href: '/admin/incidents', icon: AlertTriangle },
    { label: 'Gate History', href: '/admin/visitors', icon: UserCheck },
    { label: 'Camera Systems', href: '/admin/cameras', icon: Video },
    { label: 'Maintenance', href: '/admin/maintenance', icon: Wrench },
    { label: 'Announcements', href: '/admin/announcements', icon: Bell },
    { label: 'Amenities', href: '/admin/amenities', icon: Calendar },
    { label: 'Parcels Desk', href: '/admin/parcels', icon: Package },
    { label: 'Audit Logs', href: '/admin/audit', icon: FileText },
  ];

  const currentNav =
    userRole === 'ADMIN'
      ? adminNavItems
      : userRole === 'SECURITY'
      ? securityNavItems
      : residentNavItems;

  const roleLabels = {
    ADMIN: { label: 'Administrator', bg: 'bg-brand/10 text-brand border-brand/30' },
    SECURITY: { label: 'Security Officer', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
    RESIDENT: { label: 'Resident', bg: 'bg-brand/10 text-brand border-brand/30' },
  };

  return (
    <div className="min-h-screen bg-canvas flex text-ink transition-colors duration-150">
      {/* Skip to Main Content (Accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-md focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-surface border-r border-border-neutral transition-all duration-200 z-30 sticky top-0 h-screen',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-neutral">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-display font-bold text-base tracking-tight text-ink block leading-tight group-hover:text-brand transition-colors">
                  SocietyOS
                </span>
                <span className="text-[11px] font-medium text-ink-muted block leading-tight truncate max-w-[130px]">
                  {societyName}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-ink-muted hover:text-ink p-1.5 rounded-md hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Identification Header */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-border-neutral bg-surface-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted font-medium">Workspace</span>
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider',
                  roleLabels[userRole].bg
                )}
              >
                {roleLabels[userRole].label}
              </span>
            </div>
            {userRole === 'RESIDENT' && (
              <p className="text-xs font-bold text-ink mt-1">Unit {currentUnit}</p>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {currentNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group select-none',
                  isActive
                    ? 'bg-brand/10 text-brand font-bold border border-brand/20'
                    : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                  item.isEmergency && !isActive && 'text-emergency hover:bg-emergency-subtle',
                  item.isEmergency && isActive && 'bg-emergency-subtle text-emergency border border-emergency/30 font-bold'
                )}
                title={item.label}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? (item.isEmergency ? 'text-emergency' : 'text-brand') : 'text-ink-muted',
                    item.isEmergency && !isActive && 'text-emergency'
                  )}
                />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emergency-subtle text-emergency border border-emergency/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Single Clean Sidebar Footer: Society Branding Only */}
        <div className="p-3 border-t border-border-neutral bg-surface text-center">
          {!isCollapsed ? (
            <p className="text-[11px] text-ink-subtle">
              {societyName} · Authorized Console
            </p>
          ) : (
            <div className="w-2 h-2 rounded-full bg-brand mx-auto" />
          )}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-72 bg-surface z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-250 ease-out border-r border-border-neutral',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-neutral">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-ink">SocietyOS</span>
              <span className="text-[11px] text-ink-muted block leading-none">{societyName}</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-ink-muted hover:text-ink p-1.5 rounded-md hover:bg-surface-muted"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-border-neutral bg-surface-muted/40">
          <span
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded border uppercase',
              roleLabels[userRole].bg
            )}
          >
            {roleLabels[userRole].label}
          </span>
          {userRole === 'RESIDENT' && (
            <p className="text-xs font-semibold text-ink mt-1">Unit {currentUnit}</p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {currentNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand/10 text-brand font-bold'
                    : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                  item.isEmergency && 'text-emergency hover:bg-emergency-subtle'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-brand' : 'text-ink-muted')} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emergency-subtle text-emergency border border-emergency/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="h-16 bg-surface/95 backdrop-blur-md border-b border-border-neutral flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 transition-colors duration-150">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-ink-muted hover:text-ink p-1.5 rounded-md hover:bg-surface-muted cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink capitalize">
                {pathname.replace('/', '').replace(/-/g, ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher */}
            <ThemeToggle />

            {/* In-app Notification Bell with Read/Unread/Clear Controls */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative text-ink-muted hover:text-ink p-2 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer border border-border-neutral"
                aria-label="View notifications"
                aria-expanded={isNotificationOpen}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {isMounted && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="fixed sm:absolute left-2.5 right-2.5 sm:left-auto sm:right-0 top-16 sm:top-full mt-2 max-w-sm sm:w-96 rounded-xl bg-surface border border-border-neutral shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-border-neutral">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand/10 text-brand">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                        title="Mark all as read"
                      >
                        Mark all read
                      </button>
                      <span className="text-ink-subtle">·</span>
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        className="text-[11px] font-semibold text-ink-muted hover:text-emergency transition-colors cursor-pointer"
                        title="Clear all notifications"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-ink-muted">
                      No notifications to display.
                    </div>
                  ) : (
                    <div className="divide-y divide-border-neutral text-xs mt-1 max-h-72 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            'py-2.5 px-2 rounded-lg transition-colors flex items-start justify-between gap-2',
                            notif.read ? 'opacity-70 hover:opacity-100 hover:bg-surface-muted/50' : 'bg-surface-muted/40'
                          )}
                        >
                          <div className="flex-1 cursor-pointer" onClick={() => toggleNotificationRead(notif.id)}>
                            <div className="flex items-center justify-between gap-2">
                              <span className={cn('font-semibold text-ink', !notif.read && 'font-bold text-brand')}>
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-ink-subtle flex-shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-ink-muted mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleNotificationRead(notif.id)}
                            className="p-1 text-ink-muted hover:text-brand rounded transition-colors"
                            title={notif.read ? 'Mark as unread' : 'Mark as read'}
                          >
                            <Check className={cn('w-3.5 h-3.5', notif.read ? 'text-ink-subtle' : 'text-brand')} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Top Right Settings & Account Dropdown (Moved from sidebar!) */}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer border border-border-neutral"
                aria-label="Settings and user menu"
                aria-expanded={isSettingsOpen}
                title="Settings & Profile"
              >
                <div className="w-6 h-6 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold text-xs">
                  {currentName.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-ink max-w-[110px] truncate leading-tight">
                    {currentName}
                  </span>
                  <span className="text-[10px] text-ink-muted leading-tight">
                    {userRole === 'RESIDENT' ? `Unit ${currentUnit}` : roleLabels[userRole].label}
                  </span>
                </div>
                <Settings className="w-3.5 h-3.5 text-ink-muted ml-0.5" />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-xl bg-surface border border-border-neutral shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-border-neutral">
                    <p className="text-xs font-bold text-ink truncate">{currentName}</p>
                    <p className="text-[10px] text-ink-muted">{roleLabels[userRole].label} · {currentUnit}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href={userRole === 'RESIDENT' ? '/resident/profile' : userRole === 'ADMIN' ? '/admin/settings' : '/security/shift-handover'}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-muted rounded-lg transition-colors"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      <User className="w-4 h-4 text-brand" />
                      <span>My Profile & Avatars</span>
                    </Link>

                    {userRole === 'ADMIN' && (
                      <Link
                        href="/admin/settings"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-muted rounded-lg transition-colors"
                        onClick={() => setIsSettingsOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-brand" />
                        <span>Society Global Settings</span>
                      </Link>
                    )}

                    <Link
                      href="/sign-in"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-muted rounded-lg transition-colors"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      <Shield className="w-4 h-4 text-ink-muted" />
                      <span>Switch Console / Role</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-border-neutral">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-emergency hover:bg-emergency-subtle rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Life-Safety Emergency Alert Banner (Clickable to view details) */}
        {activeEmergencies.length > 0 && (
          <div
            onClick={() => setSelectedEmergency(activeEmergencies[0])}
            className="bg-red-600 text-white px-4 py-2.5 sm:px-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse cursor-pointer hover:bg-red-700 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-300" />
              <div className="text-xs sm:text-sm font-bold truncate">
                <span className="uppercase tracking-wider font-extrabold mr-2 bg-black/30 px-2 py-0.5 rounded text-[11px]">
                  🚨 CRITICAL EMERGENCY ({activeEmergencies.length})
                </span>
                <span>
                  {activeEmergencies[0].category}: {activeEmergencies[0].description} — Unit {activeEmergencies[0].unitId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-red-600 hover:bg-red-50 border-none font-bold text-xs h-7 px-3"
                onClick={() => setSelectedEmergency(activeEmergencies[0])}
              >
                View Alert Details
              </Button>
              <a
                href="tel:112"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded text-xs font-bold transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 112</span>
              </a>
            </div>
          </div>
        )}

        {/* Emergency Detail Pop-up Modal */}
        {selectedEmergency && (
          <Dialog open={!!selectedEmergency} onOpenChange={() => setSelectedEmergency(null)}>
            <DialogContent className="max-w-lg border-2 border-emergency">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emergency">
                  <AlertTriangle className="w-5 h-5 text-emergency animate-pulse" />
                  <span>ACTIVE LIFE-SAFETY INCIDENT ALERTS</span>
                </DialogTitle>
                <DialogDescription>
                  Emergency incident command notification dispatched to all on-duty units
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emergency">{selectedEmergency.category}</span>
                    <span className="font-mono text-ink-muted">{selectedEmergency.incidentNumber}</span>
                  </div>
                  <p className="text-sm font-bold text-ink">{selectedEmergency.description}</p>
                  <p className="text-xs text-ink-muted">Location: {selectedEmergency.locationDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-surface-muted/50 p-3 rounded-lg border border-border-neutral">
                  <div>
                    <span className="text-ink-muted">Reported By:</span>
                    <p className="font-bold text-ink">{selectedEmergency.reporterName}</p>
                  </div>
                  <div>
                    <span className="text-ink-muted">Target Unit:</span>
                    <p className="font-bold text-ink">{selectedEmergency.unitId}</p>
                  </div>
                  <div>
                    <span className="text-ink-muted">Severity:</span>
                    <p className="font-bold text-emergency">{selectedEmergency.severity}</p>
                  </div>
                  <div>
                    <span className="text-ink-muted">Logged At:</span>
                    <p className="font-mono text-ink">{new Date(selectedEmergency.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <a
                    href="tel:112"
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition-colors text-center"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Emergency Hotline (112)</span>
                  </a>

                  {(userRole === 'ADMIN' || userRole === 'SECURITY') && (
                    <Button
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      onClick={() => handleResolveEmergency(selectedEmergency)}
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      <span>Resolve & Clear Alert</span>
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    onClick={() => setSelectedEmergency(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Page Main Content with Responsive Padding and Clearance for Mobile Bar */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1536px] w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile Floating Bottom Bar for quick thumb navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border-neutral py-2 px-3 flex items-center justify-around shadow-lg">
          <Link
            href={userRole === 'ADMIN' ? '/admin' : userRole === 'SECURITY' ? '/security' : '/resident'}
            className={cn(
              'flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors',
              pathname === (userRole === 'ADMIN' ? '/admin' : userRole === 'SECURITY' ? '/security' : '/resident')
                ? 'text-brand'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>

          <Link
            href={userRole === 'ADMIN' ? '/admin/units' : userRole === 'SECURITY' ? '/security/entry-exit' : '/resident/visitors'}
            className={cn(
              'flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors',
              pathname.includes('/units') || pathname.includes('/entry-exit') || pathname.includes('/visitors')
                ? 'text-brand'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            <UserCheck className="w-5 h-5" />
            <span>{userRole === 'ADMIN' ? 'Units' : userRole === 'SECURITY' ? 'Gate' : 'Passes'}</span>
          </Link>

          <Link
            href={userRole === 'ADMIN' ? '/admin/incidents' : userRole === 'SECURITY' ? '/security/incidents' : '/resident/emergency'}
            className="flex flex-col items-center gap-0.5 text-[11px] font-bold text-emergency"
          >
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span>SOS</span>
          </Link>

          <Link
            href={userRole === 'ADMIN' ? '/admin/maintenance' : userRole === 'SECURITY' ? '/security/patrol' : '/resident/maintenance'}
            className={cn(
              'flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors',
              pathname.includes('/maintenance') || pathname.includes('/patrol')
                ? 'text-brand'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            <Wrench className="w-5 h-5" />
            <span>{userRole === 'ADMIN' ? 'Repair' : userRole === 'SECURITY' ? 'Patrol' : 'Service'}</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span>Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
