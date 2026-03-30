'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TicketType {
  _id: Id<'ticketTypes'>;
  name: string;
  price: number;
  description?: string;
}

interface RegistrationFormProps {
  event: { _id: Id<'events'>; name: string };
  ticketTypes: TicketType[];
  onSuccess?: () => void;
}

export function RegistrationForm({ event, ticketTypes, onSuccess }: RegistrationFormProps) {
  const createRegistration = useMutation(api.registrations.create);

  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [ticketTypeId, setTicketTypeId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedTicket = ticketTypes.find(t => t._id === ticketTypeId);
  const totalAmount = selectedTicket ? selectedTicket.price * parseInt(quantity || '1') : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createRegistration({
        eventId: event._id,
        ticketTypeId: ticketTypeId as Id<'ticketTypes'>,
        attendeeName,
        attendeeEmail,
        attendeePhone: attendeePhone || undefined,
        organizationName: organizationName || undefined,
        quantity: parseInt(quantity),
        specialRequests: specialRequests || undefined,
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-semibold text-foreground">Registration Confirmed!</p>
        <p className="text-sm text-muted-foreground mt-1">A confirmation will be sent to {attendeeEmail}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-1">
        <Label htmlFor="attendeeName">Full Name *</Label>
        <Input id="attendeeName" value={attendeeName} onChange={e => setAttendeeName(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="attendeeEmail">Email *</Label>
        <Input id="attendeeEmail" type="email" value={attendeeEmail} onChange={e => setAttendeeEmail(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="attendeePhone">Phone</Label>
        <Input id="attendeePhone" type="tel" value={attendeePhone} onChange={e => setAttendeePhone(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="organizationName">Organization</Label>
        <Input id="organizationName" value={organizationName} onChange={e => setOrganizationName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Ticket Type *</Label>
        <Select value={ticketTypeId} onValueChange={(v) => v !== null && setTicketTypeId(v)} required>
          <SelectTrigger><SelectValue placeholder="Select ticket" /></SelectTrigger>
          <SelectContent>
            {ticketTypes.map(t => (
              <SelectItem key={t._id} value={t._id}>
                {t.name} — {t.price === 0 ? 'Free' : `$${t.price}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="quantity">Quantity *</Label>
        <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min={1} required />
      </div>
      {totalAmount > 0 && (
        <p className="text-sm font-medium text-foreground">Total: ${totalAmount.toFixed(2)}</p>
      )}
      <div className="space-y-1">
        <Label htmlFor="specialRequests">Special Requests</Label>
        <Textarea id="specialRequests" value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={2} placeholder="Dietary needs, accessibility requests..." />
      </div>
      <Button type="submit" disabled={loading || !ticketTypeId} className="w-full">
        {loading ? 'Registering...' : 'Complete Registration'}
      </Button>
    </form>
  );
}