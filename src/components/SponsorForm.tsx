'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LEVELS = ['Presenting','Gold','Silver','Bronze','InKind','MediaPartner'] as const;
const STATUSES = ['Pledged','Confirmed','Paid','Cancelled'] as const;

interface SponsorFormProps {
  sponsor?: {
    _id: Id<'sponsors'>;
    organizationName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    sponsorshipLevel: string;
    amount: number;
    benefits?: string;
    status: string;
    logoUrl?: string;
  };
}

export function SponsorForm({ sponsor }: SponsorFormProps) {
  const router = useRouter();
  const createSponsor = useMutation(api.sponsors.create);
  const updateSponsor = useMutation(api.sponsors.update);

  const [organizationName, setOrganizationName] = useState(sponsor?.organizationName ?? '');
  const [contactName, setContactName] = useState(sponsor?.contactName ?? '');
  const [contactEmail, setContactEmail] = useState(sponsor?.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(sponsor?.contactPhone ?? '');
  const [sponsorshipLevel, setSponsorshipLevel] = useState(sponsor?.sponsorshipLevel ?? '');
  const [amount, setAmount] = useState(sponsor?.amount?.toString() ?? '');
  const [benefits, setBenefits] = useState(sponsor?.benefits ?? '');
  const [status, setStatus] = useState(sponsor?.status ?? 'Pledged');
  const [logoUrl, setLogoUrl] = useState(sponsor?.logoUrl ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const base = {
        organizationName, contactName, contactEmail, contactPhone, benefits,
        sponsorshipLevel: sponsorshipLevel as typeof LEVELS[number],
        amount: parseFloat(amount),
        logoUrl: logoUrl || undefined,
      };
      if (sponsor) {
        await updateSponsor({ id: sponsor._id, ...base, status: status as typeof STATUSES[number] });
      } else {
        await createSponsor(base);
      }
      router.push('/sponsors');
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
        <Label htmlFor="organizationName">Organization Name *</Label>
        <Input id="organizationName" value={organizationName} onChange={e => setOrganizationName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="contactName">Contact Name *</Label>
          <Input id="contactName" value={contactName} onChange={e => setContactName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="contactPhone">Contact Phone *</Label>
        <Input id="contactPhone" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
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
      </div>
      <div className="space-y-1">
        <Label htmlFor="benefits">Benefits *</Label>
        <Textarea id="benefits" value={benefits} onChange={e => setBenefits(e.target.value)} rows={3} required />
      </div>
      <div className="space-y-1">
        <Label>Status *</Label>
        <Select value={status} onValueChange={(v) => v !== null && setStatus(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : sponsor ? 'Update Sponsor' : 'Add Sponsor'}
      </Button>
    </form>
  );
}