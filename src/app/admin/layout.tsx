import * as React from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      userRole="ADMIN"
      userName="Admin Sunita Rao"
      userUnit="Management Office"
      societyName="Greenfield Heights"
    >
      {children}
    </AppShell>
  );
}
