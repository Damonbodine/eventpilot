'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function EventCalendarPage() {
  const user = useQuery(api.users.getCurrentUser);
  const events = useQuery(api.events.list, user === undefined ? 'skip' : {});

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
      <div className="rounded-md border p-4">
        <p className="text-muted-foreground text-sm mb-4">Upcoming events:</p>
        <div className="space-y-2">
          {(events ?? []).map((event: {_id: string; name: string; eventType: string; status: string; startTime: string}) => (
            <div key={event._id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{event.name}</p>
                <p className="text-xs text-muted-foreground">{event.eventType} · {event.status}</p>
              </div>
              <p className="text-sm text-muted-foreground">{event.startTime}</p>
            </div>
          ))}
          {!events && <p className="text-muted-foreground">Loading...</p>}
          {events && events.length === 0 && <p className="text-muted-foreground">No events found.</p>}
        </div>
      </div>
    </div>
  );
}
