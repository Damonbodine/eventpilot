'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { CheckInList } from '@/components/CheckInList';

export default function CheckInPage() {
  const params = useParams();
  const eventId = params.id as Id<'events'>;
  const event = useQuery(api.events.getById, eventId ? { id: eventId } : 'skip');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Check-In</h1>
        <p className="text-sm text-muted-foreground">{event?.name ?? 'Loading...'}</p>
      </div>
      <CheckInList eventId={eventId} />
    </div>
  );
}
