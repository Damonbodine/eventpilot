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

const STATUSES = ['Confirmed','Tentative','Declined'] as const;

interface SpeakerFormProps {
  speaker?: {
    _id: Id<'speakers'>;
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    organization?: string;
    bio: string;
    status: string;
    headshotUrl?: string;
  };
}

export function SpeakerForm({ speaker }: SpeakerFormProps) {
  const router = useRouter();
  const createSpeaker = useMutation(api.speakers.create);
  const updateSpeaker = useMutation(api.speakers.update);

  const [firstName, setFirstName] = useState(speaker?.firstName ?? '');
  const [lastName, setLastName] = useState(speaker?.lastName ?? '');
  const [email, setEmail] = useState(speaker?.email ?? '');
  const [title, setTitle] = useState(speaker?.title ?? '');
  const [organization, setOrganization] = useState(speaker?.organization ?? '');
  const [bio, setBio] = useState(speaker?.bio ?? '');
  const [status, setStatus] = useState(speaker?.status ?? 'Confirmed');
  const [headshotUrl, setHeadshotUrl] = useState(speaker?.headshotUrl ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        firstName, lastName, email, bio,
        title: title || undefined,
        organization: organization || undefined,
        status: status as typeof STATUSES[number],
        headshotUrl: headshotUrl || undefined,
      };
      if (speaker) {
        await updateSpeaker({ id: speaker._id, ...payload });
      } else {
        await createSpeaker(payload);
      }
      router.push('/speakers');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="organization">Organization</Label>
          <Input id="organization" value={organization} onChange={e => setOrganization(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="bio">Bio *</Label>
        <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} required />
      </div>
      <div className="space-y-1">
        <Label>Status *</Label>
        <Select value={status} onValueChange={(v) => v !== null && setStatus(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="headshotUrl">Headshot URL</Label>
        <Input id="headshotUrl" value={headshotUrl} onChange={e => setHeadshotUrl(e.target.value)} placeholder="https://..." />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : speaker ? 'Update Speaker' : 'Add Speaker'}
      </Button>
    </form>
  );
}