'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { RegistrationForm } from '@/components/RegistrationForm';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function RegistrationListPage() {
  const params = useParams();
  const eventId = params.id as Id<'events'>;
  const user = useQuery(api.users.getCurrentUser);
  const event = useQuery(api.events.getById, eventId ? { id: eventId } : 'skip');
  const registrations = useQuery(
    api.registrations.listByEvent,
    user === undefined ? 'skip' : { eventId }
  );
  const ticketTypes = useQuery(
    api.ticketTypes.listByEvent,
    event ? { eventId } : 'skip'
  );
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Registrations</h1>
        <Button onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : 'Add Registration'}
        </Button>
      </div>
      {showForm && event && ticketTypes && (
        <RegistrationForm
          event={{ _id: event._id, name: event.name }}
          ticketTypes={ticketTypes}
          onSuccess={() => setShowForm(false)}
        />
      )}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Attendee</th>
              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 text-left font-medium">Qty</th>
              <th className="p-3 text-left font-medium">Amount</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Checked In</th>
            </tr>
          </thead>
          <tbody>
            {(registrations ?? []).map((reg: {_id: string; attendeeName: string; attendeeEmail: string; quantity: number; totalAmount: number; status: string; checkedIn: boolean}) => (
              <tr key={reg._id} className="border-b last:border-0">
                <td className="p-3">{reg.attendeeName}</td>
                <td className="p-3">{reg.attendeeEmail}</td>
                <td className="p-3">{reg.quantity}</td>
                <td className="p-3">${reg.totalAmount}</td>
                <td className="p-3">{reg.status}</td>
                <td className="p-3">{reg.checkedIn ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {!registrations && (
              <tr><td colSpan={6} className="p-3 text-center text-muted-foreground">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
