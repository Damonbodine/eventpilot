'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { RegistrationForm } from '@/components/RegistrationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicEventDetailPage() {
  const params = useParams();
  const event = useQuery(api.events.getById, params.id ? { id: params.id as Id<'events'> } : 'skip');
  const ticketTypes = useQuery(
    api.ticketTypes.listByEvent,
    event ? { eventId: event._id } : 'skip'
  );

  if (!event) return <div className="p-8 text-muted-foreground">Loading event...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-8 px-8 bg-card">
        <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
        <p className="text-muted-foreground mt-1">{event.eventType} · {event.status}</p>
      </header>
      <main className="mx-auto max-w-4xl px-8 py-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>About this Event</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{event.description ?? 'No description provided.'}</p>
              <div className="mt-4 space-y-2 text-sm">
                <p><span className="font-medium">Start:</span> {event.startTime}</p>
                <p><span className="font-medium">End:</span> {event.endTime}</p>
                <p><span className="font-medium">Timezone:</span> {event.timezone}</p>
                {event.isVirtual && event.virtualLink && (
                  <p><span className="font-medium">Virtual Link:</span>{' '}
                    <a href={event.virtualLink} className="text-primary underline">{event.virtualLink}</a>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle>Register</CardTitle></CardHeader>
            <CardContent>
              {ticketTypes && ticketTypes.length > 0 ? (
                <RegistrationForm event={{ _id: event._id, name: event.name }} ticketTypes={ticketTypes} />
              ) : (
                <p className="text-sm text-muted-foreground">No tickets available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
