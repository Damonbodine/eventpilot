'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SponsorDataTable } from '@/components/SponsorDataTable';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SponsorListPage() {
  const user = useQuery(api.users.getCurrentUser);
  const sponsors = useQuery(api.sponsors.list, user === undefined ? 'skip' : {});

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Sponsors</h1>
        <Link href="/sponsors/new" className={cn(buttonVariants())}>
          <Plus className="mr-2 h-4 w-4" />Add Sponsor
        </Link>
      </div>
      <SponsorDataTable sponsors={sponsors ?? []} />
    </div>
  );
}
