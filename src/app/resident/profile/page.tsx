'use client';

import * as React from 'react';
import {
  User,
  Phone,
  Mail,
  Home,
  ShieldCheck,
  Check,
  Save,
  LogOut,
  Car,
  Bell,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { signOut } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { showAppToast } from '@/components/ui/toast-notification';

// 50 Predefined Avatars with distinct emojis and aesthetic gradients
const PREDEFINED_AVATARS = [
  { id: 'av-1', emoji: '👨‍💼', label: 'Executive Man', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
  { id: 'av-2', emoji: '👩‍💼', label: 'Executive Woman', bg: 'bg-teal-100 dark:bg-teal-950/60' },
  { id: 'av-3', emoji: '🧑‍💻', label: 'Developer', bg: 'bg-blue-100 dark:bg-blue-950/60' },
  { id: 'av-4', emoji: '👩‍🔬', label: 'Scientist', bg: 'bg-indigo-100 dark:bg-indigo-950/60' },
  { id: 'av-5', emoji: '👨‍⚕️', label: 'Doctor', bg: 'bg-cyan-100 dark:bg-cyan-950/60' },
  { id: 'av-6', emoji: '👩‍⚕️', label: 'Physician', bg: 'bg-sky-100 dark:bg-sky-950/60' },
  { id: 'av-7', emoji: '👨‍🎨', label: 'Artist Man', bg: 'bg-purple-100 dark:bg-purple-950/60' },
  { id: 'av-8', emoji: '👩‍🎨', label: 'Artist Woman', bg: 'bg-pink-100 dark:bg-pink-950/60' },
  { id: 'av-9', emoji: '👨‍🎓', label: 'Graduate Man', bg: 'bg-violet-100 dark:bg-violet-950/60' },
  { id: 'av-10', emoji: '👩‍🎓', label: 'Graduate Woman', bg: 'bg-fuchsia-100 dark:bg-fuchsia-950/60' },
  { id: 'av-11', emoji: '🧓', label: 'Elderly Resident', bg: 'bg-amber-100 dark:bg-amber-950/60' },
  { id: 'av-12', emoji: '👵', label: 'Senior Resident', bg: 'bg-orange-100 dark:bg-orange-950/60' },
  { id: 'av-13', emoji: '🦁', label: 'Courageous Lion', bg: 'bg-yellow-100 dark:bg-yellow-950/60' },
  { id: 'av-14', emoji: '🦅', label: 'Observant Eagle', bg: 'bg-stone-200 dark:bg-stone-900' },
  { id: 'av-15', emoji: '🐬', label: 'Serene Dolphin', bg: 'bg-cyan-100 dark:bg-cyan-950/60' },
  { id: 'av-16', emoji: '🐯', label: 'Alert Tiger', bg: 'bg-amber-100 dark:bg-amber-950/60' },
  { id: 'av-17', emoji: '🐼', label: 'Peaceful Panda', bg: 'bg-zinc-200 dark:bg-zinc-800' },
  { id: 'av-18', emoji: '🦊', label: 'Nimble Fox', bg: 'bg-orange-100 dark:bg-orange-950/60' },
  { id: 'av-19', emoji: '🦉', label: 'Wise Owl', bg: 'bg-amber-200 dark:bg-amber-950/60' },
  { id: 'av-20', emoji: '🐺', label: 'Guardian Wolf', bg: 'bg-slate-200 dark:bg-slate-800' },
  { id: 'av-21', emoji: '🌿', label: 'Green Leaf', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
  { id: 'av-22', emoji: '🌸', label: 'Cherry Blossom', bg: 'bg-pink-100 dark:bg-pink-950/60' },
  { id: 'av-23', emoji: '🌺', label: 'Hibiscus', bg: 'bg-rose-100 dark:bg-rose-950/60' },
  { id: 'av-24', emoji: '🌻', label: 'Sunflower', bg: 'bg-yellow-100 dark:bg-yellow-950/60' },
  { id: 'av-25', emoji: '🌲', label: 'Evergreen Pine', bg: 'bg-emerald-200 dark:bg-emerald-950/80' },
  { id: 'av-26', emoji: '🌟', label: 'Shining Star', bg: 'bg-yellow-100 dark:bg-yellow-950/60' },
  { id: 'av-27', emoji: '⚡', label: 'Energy Bolt', bg: 'bg-amber-100 dark:bg-amber-950/60' },
  { id: 'av-28', emoji: '🛡️', label: 'Protected Shield', bg: 'bg-blue-100 dark:bg-blue-950/60' },
  { id: 'av-29', emoji: '🏆', label: 'Champion Cup', bg: 'bg-yellow-200 dark:bg-yellow-950/60' },
  { id: 'av-30', emoji: '☕', label: 'Coffee Cup', bg: 'bg-amber-100 dark:bg-amber-950/60' },
  { id: 'av-31', emoji: '🚀', label: 'Rocket', bg: 'bg-indigo-100 dark:bg-indigo-950/60' },
  { id: 'av-32', emoji: '🛰️', label: 'Satellite', bg: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'av-33', emoji: '💎', label: 'Precious Gem', bg: 'bg-cyan-100 dark:bg-cyan-950/60' },
  { id: 'av-34', emoji: '🎯', label: 'Bullseye', bg: 'bg-red-100 dark:bg-red-950/60' },
  { id: 'av-35', emoji: '🧭', label: 'Compass', bg: 'bg-teal-100 dark:bg-teal-950/60' },
  { id: 'av-36', emoji: '🎨', label: 'Palette', bg: 'bg-purple-100 dark:bg-purple-950/60' },
  { id: 'av-37', emoji: '📚', label: 'Scholar Books', bg: 'bg-blue-100 dark:bg-blue-950/60' },
  { id: 'av-38', emoji: '🎵', label: 'Music Melody', bg: 'bg-rose-100 dark:bg-rose-950/60' },
  { id: 'av-39', emoji: '🏄‍♂️', label: 'Surfer', bg: 'bg-cyan-100 dark:bg-cyan-950/60' },
  { id: 'av-40', emoji: '🧘‍♀️', label: 'Meditation', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
  { id: 'av-41', emoji: '🚴‍♂️', label: 'Cyclist', bg: 'bg-lime-100 dark:bg-lime-950/60' },
  { id: 'av-42', emoji: '🏔️', label: 'Mountain Summit', bg: 'bg-stone-200 dark:bg-stone-800' },
  { id: 'av-43', emoji: '🌅', label: 'Dawn Sunrise', bg: 'bg-orange-100 dark:bg-orange-950/60' },
  { id: 'av-44', emoji: '🌈', label: 'Rainbow', bg: 'bg-sky-100 dark:bg-sky-950/60' },
  { id: 'av-45', emoji: '🏰', label: 'Citadel Castle', bg: 'bg-amber-100 dark:bg-amber-950/60' },
  { id: 'av-46', emoji: '🏠', label: 'Sweet Home', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
  { id: 'av-47', emoji: '🐾', label: 'Pet Friendly', bg: 'bg-amber-100 dark:bg-amber-950/60' },
  { id: 'av-48', emoji: '🪴', label: 'Potted Bonsai', bg: 'bg-green-100 dark:bg-green-950/60' },
  { id: 'av-49', emoji: '🪷', label: 'Lotus Flower', bg: 'bg-pink-100 dark:bg-pink-950/60' },
  { id: 'av-50', emoji: '👑', label: 'Golden Crown', bg: 'bg-yellow-200 dark:bg-yellow-950/70' },
];

export default function ResidentProfilePage() {
  const router = useRouter();

  // Profile data
  const [name, setName] = React.useState('Aarav Sharma');
  const [email, setEmail] = React.useState('resident@societyos.local');
  const [phone, setPhone] = React.useState('+91 98765 43210');
  const [emergencyContact, setEmergencyContact] = React.useState('Priya Sharma (+91 98765 43211)');
  const [unit, setUnit] = React.useState('A-402');
  const [occupancyType, setOccupancyType] = React.useState('Owner (Primary Resident)');
  const [parkingSlot, setParkingSlot] = React.useState('Slot P-104 (Basement 1)');

  // Selected avatar (default av-3)
  const [selectedAvatarId, setSelectedAvatarId] = React.useState('av-3');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);

  // Notification toggles
  const [smsAlerts, setSmsAlerts] = React.useState(true);
  const [whatsappPasses, setWhatsappPasses] = React.useState(true);
  const [emergencyCallBypass, setEmergencyCallBypass] = React.useState(true);

  const [isSaved, setIsSaved] = React.useState(false);

  // Load from localStorage if present
  React.useEffect(() => {
    const savedProfile = localStorage.getItem('societyos-resident-profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.unit) setUnit(parsed.unit);
        if (parsed.occupancyType) setOccupancyType(parsed.occupancyType);
        if (parsed.emergencyContact) setEmergencyContact(parsed.emergencyContact);
        if (parsed.parkingSlot) setParkingSlot(parsed.parkingSlot);
        if (parsed.selectedAvatarId) setSelectedAvatarId(parsed.selectedAvatarId);
        if (parsed.smsAlerts !== undefined) setSmsAlerts(parsed.smsAlerts);
        if (parsed.whatsappPasses !== undefined) setWhatsappPasses(parsed.whatsappPasses);
        if (parsed.emergencyCallBypass !== undefined) setEmergencyCallBypass(parsed.emergencyCallBypass);
      } catch {
        // Ignored
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = {
      name,
      fullName: name,
      email,
      phone,
      unit,
      occupancyType,
      emergencyContact,
      parkingSlot,
      selectedAvatarId,
      smsAlerts,
      whatsappPasses,
      emergencyCallBypass,
    };
    localStorage.setItem('societyos-resident-profile', JSON.stringify(profile));
    localStorage.setItem('societyos_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('profileUpdated'));
    setIsSaved(true);
    showAppToast(
      `Contact & Unit details for ${unit} verified and saved successfully!`,
      'success',
      'Profile Saved'
    );
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Ignore
    }
    router.push('/sign-in');
  };

  const currentAvatar = PREDEFINED_AVATARS.find((a) => a.id === selectedAvatarId) || PREDEFINED_AVATARS[2];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Resident Profile & Account
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Manage your personal profile, 50 customizable avatars, unit records, and emergency preferences
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="ACTIVE" labelOverride="Verified Resident" />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-emergency hover:bg-emergency-subtle">
            <LogOut className="w-4 h-4 mr-1.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold">Profile details and avatar updated successfully!</span>
          </div>
          <span className="text-xs">Saved to local session</span>
        </div>
      )}

      {/* Profile Form Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Selection Card */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Identity & Avatar (50 Predefined Styles)</span>
            </CardTitle>
            <CardDescription>
              Choose your favorite avatar style displayed across gate verification desks and community notices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-md border-2 border-brand/40 ${currentAvatar.bg}`}
              >
                {currentAvatar.emoji}
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-sm font-bold text-ink">{currentAvatar.label}</span>
                  <span className="text-xs text-ink-muted font-mono">({currentAvatar.id})</span>
                </div>
                <p className="text-xs text-ink-muted">
                  Click below to browse all 50 unique profession, wildlife, botanical, and milestone avatars.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="mt-2"
                >
                  Browse 50 Avatars
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details & Emergency Contacts */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-brand" />
              <span>Contact & Unit Information</span>
            </CardTitle>
            <CardDescription>
              Authoritative details verified by Greenfield Heights management committee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Registered Email (Official Notices)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Number (Gate Verification Calls)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <Input
                label="Secondary Emergency Contact (Name & Phone)"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">
                  Registered Apartment Unit
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-brand absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    placeholder="e.g. A-402 or Block A · Flat 402"
                    className="w-full pl-9 pr-3 py-2 text-sm font-semibold bg-surface border border-border-neutral rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">
                  Occupancy Governance
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={occupancyType}
                    onChange={(e) => setOccupancyType(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm font-semibold bg-surface border border-border-neutral rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="Owner (Primary Resident)">Owner (Primary Resident)</option>
                    <option value="Tenant / Leaseholder">Tenant / Leaseholder</option>
                    <option value="Family Member / Co-Owner">Family Member / Co-Owner</option>
                    <option value="Corporate Trustee">Corporate Trustee</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">
                  Designated Parking Slot
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={parkingSlot}
                    onChange={(e) => setParkingSlot(e.target.value)}
                    required
                    placeholder="e.g. Slot P-104 (Basement 1)"
                    className="w-full pl-9 pr-3 py-2 text-sm font-semibold bg-surface border border-border-neutral rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Notification Preferences */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand" />
              <span>Gate & Safety Notification Preferences</span>
            </CardTitle>
            <CardDescription>
              Configure how you receive visitor arrivals, delivery notices, and emergency alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border-neutral bg-surface-muted/40">
              <div>
                <p className="text-sm font-semibold text-ink">Direct WhatsApp Visitor Passes</p>
                <p className="text-xs text-ink-muted">Receive shareable QR pass links directly on WhatsApp</p>
              </div>
              <input
                type="checkbox"
                checked={whatsappPasses}
                onChange={(e) => setWhatsappPasses(e.target.checked)}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border-neutral bg-surface-muted/40">
              <div>
                <p className="text-sm font-semibold text-ink">Urgent SMS Alerts for Gate Refusals</p>
                <p className="text-xs text-ink-muted">SMS notification if an unapproved courier or guest is denied entry</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border-neutral bg-surface-muted/40">
              <div>
                <p className="text-sm font-semibold text-ink flex items-center gap-1.5 text-emergency">
                  <HeartPulse className="w-4 h-4" />
                  <span>Life-Safety SOS Priority Bypass</span>
                </p>
                <p className="text-xs text-ink-muted">Allow SocietyOS emergency siren to ring through device Do-Not-Disturb</p>
              </div>
              <input
                type="checkbox"
                checked={emergencyCallBypass}
                onChange={(e) => setEmergencyCallBypass(e.target.checked)}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-2 border-t border-border-subtle">
            <Button type="submit" variant="primary" size="md">
              <Save className="w-4 h-4 mr-1.5" />
              <span>Save Profile Changes</span>
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* 50 Predefined Avatars Selection Modal */}
      {isAvatarModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-border-neutral flex items-center justify-between bg-surface-muted/50">
              <div>
                <h3 className="text-base font-bold text-ink">Select from 50 Predefined Avatars</h3>
                <p className="text-xs text-ink-muted">Click an avatar to select it for your resident profile</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-5 sm:grid-cols-10 gap-3">
              {PREDEFINED_AVATARS.map((av) => {
                const isSelected = av.id === selectedAvatarId;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatarId(av.id);
                      setIsAvatarModalOpen(false);
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-2xl transition-all cursor-pointer relative group ${
                      av.bg
                    } ${
                      isSelected
                        ? 'ring-3 ring-brand shadow-md scale-105'
                        : 'hover:scale-110 hover:shadow-xs'
                    }`}
                    title={av.label}
                  >
                    <span>{av.emoji}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-border-neutral bg-surface-muted/30 flex items-center justify-between text-xs text-ink-muted">
              <span>All 50 avatars available for immediate use</span>
              <span className="font-semibold text-brand">Current: {currentAvatar.label}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
