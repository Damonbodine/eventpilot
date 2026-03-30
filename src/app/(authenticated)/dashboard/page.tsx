'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DashboardStats } from '@/components/DashboardStats';
import { AttentionEvents } from '@/components/AttentionEvents';

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrentUser);

  const displayName = user?.name
    ?? (user?.firstName ? [user.firstName, user.lastName].filter(Boolean).join(' ') : null)
    ?? '...';

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {displayName}</p>
      </div>
      <DashboardStats />
      <AttentionEvents />
    </div>
  );
}
