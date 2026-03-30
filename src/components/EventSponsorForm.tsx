'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LEVELS = ['Presenting','Gold','Silver','Bronze','InKind','MediaPartner'] as const;

interface EventSponsorFormProps {
  eventId: Id<'events'>;
  onSuccess?: () => void;
}

export function EventSponsorForm({ eventId, onSuccess }: EventSponsorFormProps) {
  const createEventSponsor = useMutation(api.eventSponsors.create);
  const user = useQuery(api.users.getCurrentUser);
  const sponsors = useQuery(api.sponsors.list, user === undefined ? 'skip' : {});

  const [sponsorId, setSponsorId] = useState('');
  const [sponsorshipLevel, setSponsorshipLevel] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createEventSponsor({
        eventId,
        sponsorId: sponsorId as Id<'sponsors'>,
        sponsorshipLevel: sponsorshipLevel as typeof LEVELS[number],
        amount: parseFloat(amount),
        notes: notes || undefined,
      });
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
        <Label>Sponsor *</Label>
        <Select value={sponsorId} onValueChange={(v) => v !== null && setSponsorId(v)} required>
          <SelectTrigger><SelectValue placeholder="Select sponsor" /></SelectTrigger>
          <SelectContent>
            {(sponsors ?? []).map((s: {_id: string; organizationName: string}) => (
              <SelectItem key={s._id} value={s._id}>{s.organizationName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Sponsorship Level *</Label>
        <Select value={sponsorshipLevel} onValueChange={(v) => v !== null && setSponsorshipLevel(v)}>
          <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
          <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="amount">Amount ($) *</Label>
        <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} min={0} step={0.01} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
      </div>
      <Button type="submit" disabled={loading || !sponsorId || !sponsorshipLevel} className="w-full">
        {loading ? 'Linking...' : 'Link Sponsor to Event'}
      </Button>
    </form>
  );
}