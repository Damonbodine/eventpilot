'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SpeakerDataTable } from '@/components/SpeakerDataTable';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SpeakerListPage() {
  const user = useQuery(api.users.getCurrentUser);
  const speakers = useQuery(api.speakers.list, user === undefined ? 'skip' : {});

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Speakers</h1>
        <Link href="/speakers/new" className={cn(buttonVariants())}>
          <Plus className="mr-2 h-4 w-4" />Add Speaker
        </Link>
      </div>
      <SpeakerDataTable speakers={speakers ?? []} />
    </div>
  );
}
