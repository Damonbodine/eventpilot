'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { EventDataTable } from '@/components/EventDataTable';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EventListPage() {
  const user = useQuery(api.users.getCurrentUser);
  const events = useQuery(api.events.list, user === undefined ? 'skip' : {});

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Events</h1>
        <Link href="/events/new" className={cn(buttonVariants())}>
          <Plus className="mr-2 h-4 w-4" />New Event
        </Link>
      </div>
      <EventDataTable events={events ?? []} />
    </div>
  );
}
