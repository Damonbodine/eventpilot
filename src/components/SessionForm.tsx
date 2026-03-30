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
import { Checkbox } from '@/components/ui/checkbox';

const SESSION_TYPES = ['Keynote','Breakout','Workshop','Panel','Networking','Meal'] as const;

interface SessionFormProps {
  eventId: Id<'events'>;
  session?: {
    _id: Id<'sessions'>;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    room?: string;
    sessionType: string;
    capacity?: number;
    speakerIds: Id<'speakers'>[];
  };
  onSuccess?: () => void;
}

export function SessionForm({ eventId, session, onSuccess }: SessionFormProps) {
  const createSession = useMutation(api.sessions.create);
  const updateSession = useMutation(api.sessions.update);
  const user = useQuery(api.users.getCurrentUser);
  const speakers = useQuery(api.speakers.list, user === undefined ? 'skip' : {});

  const [title, setTitle] = useState(session?.title ?? '');
  const [description, setDescription] = useState(session?.description ?? '');
  const [startTime, setStartTime] = useState(session?.startTime ?? '');
  const [endTime, setEndTime] = useState(session?.endTime ?? '');
  const [room, setRoom] = useState(session?.room ?? '');
  const [sessionType, setSessionType] = useState(session?.sessionType ?? '');
  const [capacity, setCapacity] = useState(session?.capacity?.toString() ?? '');
  const [speakerIds, setSpeakerIds] = useState<Id<'speakers'>[]>(session?.speakerIds ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleSpeaker(id: Id<'speakers'>) {
    setSpeakerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        title, startTime, endTime,
        description: description || undefined,
        room: room || undefined,
        sessionType: sessionType as typeof SESSION_TYPES[number],
        capacity: capacity ? parseInt(capacity) : undefined,
        speakerIds,
      };
      if (session) {
        await updateSession({ id: session._id, ...payload });
      } else {
        await createSession({ eventId, ...payload });
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
        <Label htmlFor="title">Session Title *</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endTime">End Time *</Label>
          <Input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="room">Room</Label>
          <Input id="room" value={room} onChange={e => setRoom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Session Type *</Label>
          <Select value={sessionType} onValueChange={(v) => v !== null && setSessionType(v)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>{SESSION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="capacity">Capacity</Label>
        <Input id="capacity" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} min={1} />
      </div>
      <div className="space-y-2">
        <Label>Speakers</Label>
        <div className="max-h-40 overflow-y-auto rounded border border-border p-2 space-y-1">
          {(speakers ?? []).map((s: {_id: string; firstName: string; lastName: string}) => (
            <label key={s._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted rounded px-1">
              <Checkbox
                checked={speakerIds.includes(s._id as Id<'speakers'>)}
                onCheckedChange={() => toggleSpeaker(s._id as Id<'speakers'>)}
              />
              {s.firstName} {s.lastName}
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : session ? 'Update Session' : 'Add Session'}
      </Button>
    </form>
  );
}