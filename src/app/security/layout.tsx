import * as React from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      userRole="SECURITY"
      userName="Officer Ramesh Kumar"
      userUnit="Gate 1 North"
      societyName="Greenfield Heights"
    >
      {children}
    </AppShell>
  );
}
