'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
function AuthSyncInner({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (isLoaded && user) {
      const primaryEmail = user.primaryEmailAddress?.emailAddress ?? '';
      upsertUser({
        clerkId: user.id,
        email: primaryEmail,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        imageUrl: user.imageUrl ?? undefined,
        role: (user.publicMetadata?.role as 'Admin' | 'EventCoordinator' | 'Volunteer' | 'Registrant') ?? 'EventCoordinator',
      }).catch(console.error);
    }
  }, [isLoaded, user, upsertUser]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar currentUser={currentUser ?? null} />
      <SidebarInset>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSyncInner>{children}</AuthSyncInner>
  );
}
