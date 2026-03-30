'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { PublicEventCard } from '@/components/PublicEventCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PublicEventsPage() {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const events = useQuery(api.events.listPublic, { eventType: typeFilter as any });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-6 px-8">
        <h1 className="text-3xl font-bold text-foreground">Upcoming Events</h1>
      </header>
      <main className="mx-auto max-w-5xl px-8 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Select onValueChange={(v: string | null) => setTypeFilter(v === null || v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Fundraiser">Fundraiser</SelectItem>
              <SelectItem value="Gala">Gala</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Conference">Conference</SelectItem>
              <SelectItem value="Webinar">Webinar</SelectItem>
              <SelectItem value="CommunityEvent">Community Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(events ?? []).map((event: any) => (
            <PublicEventCard key={event._id} event={event} />
          ))}
          {!events && <p className="col-span-full text-muted-foreground">Loading...</p>}
          {events && events.length === 0 && <p className="col-span-full text-muted-foreground">No public events found.</p>}
        </div>
      </main>
    </div>
  );
}
