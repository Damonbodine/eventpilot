'use client';

import { EventForm } from '@/components/EventForm';

export default function EventCreatePage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Create Event</h1>
        <p className="text-sm text-muted-foreground">Fill in the details to create a new event.</p>
      </div>
      <EventForm />
    </div>
  );
}
