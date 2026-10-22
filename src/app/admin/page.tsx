'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building,
  Home,
  AlertTriangle,
  UserCheck,
  Wrench,
  FileText,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

export default function AdminCommandCenterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DED8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#17231D]">
            Society Command Center
          </h1>
          <p className="text-sm text-[#66716A] mt-0.5">
            Greenfield Heights Management Oversight · Authorized Administrator Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/residents">
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Invite Resident</span>
            </Button>
          </Link>
          <Link href="/admin/announcements">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Publish Notice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Units</span>
              <Home className="w-4 h-4 text-[#66716A]" />
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-[#17231D]">160</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-[#66716A]">
              <span>Occupied: <strong>148</strong></span>
              <span>Vacant: <strong>8</strong></span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Visitors On-Site</span>
              <UserCheck className="w-4 h-4 text-[#276749]" />
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-[#276749]">3 Active</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-[#66716A]">Verified through Gate 1 & 2</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Active Incidents</span>
              <AlertTriangle className="w-4 h-4 text-[#B86A2B]" />
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-[#B86A2B]">1 Open</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status="ACKNOWLEDGED" labelOverride="Triage In Progress" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Maintenance</span>
              <Wrench className="w-4 h-4 text-[#66716A]" />
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-[#17231D]">4 Open</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-[#66716A]">3 In Progress · 1 Awaiting Part</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Administrative Action Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Occupancy Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="w-4 h-4 text-[#276749]" />
                <span>Unit Inventory & Occupancy Status</span>
              </CardTitle>
              <CardDescription>Canonical unit records and move-in/out state</CardDescription>
            </div>
            <Link href="/admin/units">
              <Button variant="ghost" size="sm">
                View All Units →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-[#EAF3ED] border border-[#B7D5C4] text-center">
                <p className="text-xs font-semibold text-[#276749]">Occupied</p>
                <p className="text-xl font-mono font-bold text-[#17231D] mt-0.5">148</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F2F4F7] border border-[#EAECF0] text-center">
                <p className="text-xs font-semibold text-[#475467]">Vacant</p>
                <p className="text-xl font-mono font-bold text-[#17231D] mt-0.5">8</p>
              </div>
              <div className="p-3 rounded-lg bg-[#EFF8FF] border border-[#B2DDFF] text-center">
                <p className="text-xs font-semibold text-[#175CD3]">Reserved</p>
                <p className="text-xl font-mono font-bold text-[#17231D] mt-0.5">2</p>
              </div>
              <div className="p-3 rounded-lg bg-[#FFF4ED] border border-[#FECDCA] text-center">
                <p className="text-xs font-semibold text-[#B93815]">Maintenance</p>
                <p className="text-xl font-mono font-bold text-[#17231D] mt-0.5">2</p>
              </div>
            </div>

            <div className="divide-y divide-[#E8ECE7] text-sm">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-xs text-[#17231D]">Unit A-402</span>
                  <span className="text-xs text-[#66716A] ml-2">Block A · Floor 4 · Aarav Sharma</span>
                </div>
                <StatusBadge status="OCCUPIED" />
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-xs text-[#17231D]">Unit B-101</span>
                  <span className="text-xs text-[#66716A] ml-2">Block B · Floor 1 · Listed for Lease</span>
                </div>
                <StatusBadge status="VACANT" />
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-xs text-[#17231D]">Unit C-102</span>
                  <span className="text-xs text-[#66716A] ml-2">Block C · Floor 1 · Water Line Repair</span>
                </div>
                <StatusBadge status="MAINTENANCE" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 2: System Integrity & Audit Log Shortcut */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#276749]" />
              <span>Audited Administrative Actions</span>
            </CardTitle>
            <CardDescription>Append-only traceability log</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="divide-y divide-[#E8ECE7] text-xs">
              <div className="py-2">
                <p className="font-semibold text-[#17231D]">Unit C-102 Status Changed</p>
                <p className="text-[#66716A]">By Admin Sunita Rao · VACANT → MAINTENANCE</p>
                <span className="text-[10px] text-[#8A968E] font-mono">11:30 AM · ID: AUD-9021</span>
              </div>

              <div className="py-2">
                <p className="font-semibold text-[#17231D]">Incident INC-20261020-001 Acknowledged</p>
                <p className="text-[#66716A]">By Guard Ramesh Kumar · Guard Dispatched</p>
                <span className="text-[10px] text-[#8A968E] font-mono">12:02 PM · ID: AUD-9022</span>
              </div>

              <div className="py-2">
                <p className="font-semibold text-[#17231D]">Guest Pass VIS-4021 Check-in Recorded</p>
                <p className="text-[#66716A]">By Gate 1 North · Idempotency Key verified</p>
                <span className="text-[10px] text-[#8A968E] font-mono">12:04 PM · ID: AUD-9023</span>
              </div>
            </div>

            <Link href="/admin/audit" className="block pt-2">
              <Button variant="secondary" size="sm" className="w-full">
                <span>View Full Audit Logs</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
