'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { EventForm } from '@/components/EventForm';

export default function EditEventPage() {
  const params = useParams();
  const event = useQuery(api.events.getById, params.id ? { id: params.id as Id<'events'> } : 'skip');

  if (!event) return <div className="p-6 text-muted-foreground">Loading event...</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Edit Event</h1>
      <EventForm event={event} />
    </div>
  );
}
