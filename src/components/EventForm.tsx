'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const EVENT_TYPES = ['Fundraiser','Gala','Workshop','Conference','Webinar','BoardMeeting','CommunityEvent','VolunteerOrientation','AnnualMeeting','Other'] as const;
const TIMEZONES = ['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix','Pacific/Honolulu','America/Anchorage'];

interface EventFormProps {
  event?: {
    _id: Id<'events'>;
    name: string;
    description?: string;
    eventType: string;
    startDate: string | number;
    startTime: string;
    endDate: string | number;
    endTime: string;
    timezone: string;
    venueId?: Id<'venues'>;
    isVirtual: boolean;
    virtualLink?: string;
    maxCapacity?: number;
    registrationDeadline?: string | number;
    isPublic: boolean;
    coordinatorId?: Id<'users'>;
  };
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const user = useQuery(api.users.getCurrentUser);
  const venues = useQuery(api.venues.list, user === undefined ? 'skip' : {});
  const users = useQuery(api.users.list, user === undefined ? 'skip' : {});

  const toDateString = (ts?: string | number) => {
    if (!ts) return '';
    if (typeof ts === 'string' && ts.match(/^\d{4}-\d{2}-\d{2}$/)) return ts;
    return new Date(ts).toISOString().split('T')[0];
  };

  const [name, setName] = useState(event?.name ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [eventType, setEventType] = useState(event?.eventType ?? '');
  const [startDate, setStartDate] = useState(toDateString(event?.startDate));
  const [startTime, setStartTime] = useState(event?.startTime ?? '');
  const [endDate, setEndDate] = useState(toDateString(event?.endDate));
  const [endTime, setEndTime] = useState(event?.endTime ?? '');
  const [timezone, setTimezone] = useState(event?.timezone ?? 'America/Chicago');
  const [venueId, setVenueId] = useState<string>(event?.venueId ?? '');
  const [isVirtual, setIsVirtual] = useState(event?.isVirtual ?? false);
  const [virtualLink, setVirtualLink] = useState(event?.virtualLink ?? '');
  const [maxCapacity, setMaxCapacity] = useState(event?.maxCapacity?.toString() ?? '');
  const [registrationDeadline, setRegistrationDeadline] = useState(toDateString(event?.registrationDeadline));
  const [isPublic, setIsPublic] = useState(event?.isPublic ?? true);
  const [coordinatorId, setCoordinatorId] = useState<string>(event?.coordinatorId ?? '' as string);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const startDateMs = new Date(startDate).getTime();
      const endDateMs = new Date(endDate).getTime();
      const registrationDeadlineMs = registrationDeadline ? new Date(registrationDeadline).getTime() : undefined;
      const payload = {
        name,
        description: description || undefined,
        eventType: eventType as typeof EVENT_TYPES[number],
        startDate,
        startDateMs,
        startTime,
        endDate,
        endDateMs,
        endTime,
        timezone,
        venueId: venueId ? (venueId as Id<'venues'>) : undefined,
        isVirtual,
        virtualLink: virtualLink || undefined,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        registrationDeadline: registrationDeadline || undefined,
        registrationDeadlineMs,
        isPublic,
        coordinatorId: coordinatorId ? (coordinatorId as Id<'users'>) : undefined,
      };
      if (event) {
        await updateEvent({ id: event._id, ...payload });
      } else {
        await createEvent(payload);
      }
      router.push('/events');
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
        <Label htmlFor="name">Event Name *</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
      </div>
      <div className="space-y-1">
        <Label>Event Type *</Label>
        <Select value={eventType} onValueChange={(v) => v !== null && setEventType(v)} required>
          <SelectTrigger>
            <SelectValue placeholder="Select type">
              {eventType || undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="endDate">End Date *</Label>
          <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endTime">End Time *</Label>
          <Input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Timezone *</Label>
        <Select value={timezone} onValueChange={(v) => v !== null && setTimezone(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select timezone">
              {timezone || undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Venue</Label>
        <Select value={venueId} onValueChange={(v) => v !== null && setVenueId(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select venue">
              {venueId ? ((venues ?? []).find((v: {_id: string; name: string}) => v._id === venueId)?.name ?? venueId) : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None (virtual)</SelectItem>
            {(venues ?? []).map((v: {_id: string; name: string}) => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="isVirtual" checked={isVirtual} onCheckedChange={setIsVirtual} />
        <Label htmlFor="isVirtual">Virtual Event</Label>
      </div>
      {isVirtual && (
        <div className="space-y-1">
          <Label htmlFor="virtualLink">Virtual Link</Label>
          <Input id="virtualLink" value={virtualLink} onChange={e => setVirtualLink(e.target.value)} placeholder="https://zoom.us/j/..." />
        </div>
      )}
      <div className="space-y-1">
        <Label htmlFor="maxCapacity">Max Capacity</Label>
        <Input id="maxCapacity" type="number" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} min={1} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="registrationDeadline">Registration Deadline</Label>
        <Input id="registrationDeadline" type="date" value={registrationDeadline} onChange={e => setRegistrationDeadline(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
        <Label htmlFor="isPublic">Public Event</Label>
      </div>
      <div className="space-y-1">
        <Label>Coordinator *</Label>
        <Select value={coordinatorId} onValueChange={(v) => v !== null && setCoordinatorId(v)} required>
          <SelectTrigger>
            <SelectValue placeholder="Select coordinator">
              {coordinatorId ? (() => {
                const u = (users ?? []).find((u: {_id: string; name?: string; firstName?: string; lastName?: string}) => u._id === coordinatorId) as {_id: string; name?: string; firstName?: string; lastName?: string} | undefined;
                return u ? (u.name ?? [u.firstName, u.lastName].filter(Boolean).join(" ")) : undefined;
              })() : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>{(users ?? []).map((u: {_id: string; name?: string; firstName?: string; lastName?: string}) => <SelectItem key={u._id} value={u._id}>{u.name ?? [u.firstName, u.lastName].filter(Boolean).join(" ")}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
      </Button>
    </form>
  );
}