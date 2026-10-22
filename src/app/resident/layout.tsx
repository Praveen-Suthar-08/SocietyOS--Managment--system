import * as React from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      userRole="RESIDENT"
      userName="Aarav Sharma"
      userUnit="A-402"
      societyName="Greenfield Heights"
    >
      {children}
    </AppShell>
  );
}
