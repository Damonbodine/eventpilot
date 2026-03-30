'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { VenueDataTable } from '@/components/VenueDataTable';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VenueListPage() {
  const user = useQuery(api.users.getCurrentUser);
  const venues = useQuery(api.venues.list, user === undefined ? 'skip' : {});

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Venues</h1>
        <Link href="/venues/new" className={cn(buttonVariants())}>
          <Plus className="mr-2 h-4 w-4" />Add Venue
        </Link>
      </div>
      <VenueDataTable venues={venues ?? []} />
    </div>
  );
}
