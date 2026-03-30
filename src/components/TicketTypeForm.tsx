'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TicketTypeFormProps {
  eventId: Id<'events'>;
  ticketType?: {
    _id: Id<'ticketTypes'>;
    name: string;
    description?: string;
    price: number;
    maxQuantity?: number;
    salesStartDate?: string | number;
    salesEndDate?: string | number;
  };
  onSuccess?: () => void;
}

export function TicketTypeForm({ eventId, ticketType, onSuccess }: TicketTypeFormProps) {
  const createTicketType = useMutation(api.ticketTypes.create);
  const updateTicketType = useMutation(api.ticketTypes.update);

  const toDateString = (ts?: string | number) => {
    if (!ts) return '';
    if (typeof ts === 'string' && ts.match(/^\d{4}-\d{2}-\d{2}$/)) return ts;
    return new Date(ts).toISOString().split('T')[0];
  };

  const [name, setName] = useState(ticketType?.name ?? '');
  const [description, setDescription] = useState(ticketType?.description ?? '');
  const [price, setPrice] = useState(ticketType?.price?.toString() ?? '0');
  const [maxQuantity, setMaxQuantity] = useState(ticketType?.maxQuantity?.toString() ?? '');
  const [salesStartDate, setSalesStartDate] = useState(toDateString(ticketType?.salesStartDate));
  const [salesEndDate, setSalesEndDate] = useState(toDateString(ticketType?.salesEndDate));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name,
        description: description || undefined,
        price: parseFloat(price),
        maxQuantity: maxQuantity ? parseInt(maxQuantity) : undefined,
        salesStartDate: salesStartDate || undefined,
        salesStartDateMs: salesStartDate ? new Date(salesStartDate).getTime() : undefined,
        salesEndDate: salesEndDate || undefined,
        salesEndDateMs: salesEndDate ? new Date(salesEndDate).getTime() : undefined,
      };
      if (ticketType) {
        await updateTicketType({ id: ticketType._id, ...payload });
      } else {
        await createTicketType({ eventId, ...payload });
      }
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-1">
        <Label htmlFor="name">Ticket Name *</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="General Admission" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="price">Price ($) *</Label>
        <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} step={0.01} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="maxQuantity">Max Quantity</Label>
        <Input id="maxQuantity" type="number" value={maxQuantity} onChange={e => setMaxQuantity(e.target.value)} min={1} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="salesStartDate">Sales Start</Label>
          <Input id="salesStartDate" type="date" value={salesStartDate} onChange={e => setSalesStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="salesEndDate">Sales End</Label>
          <Input id="salesEndDate" type="date" value={salesEndDate} onChange={e => setSalesEndDate(e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : ticketType ? 'Update Ticket Type' : 'Add Ticket Type'}
      </Button>
    </form>
  );
}