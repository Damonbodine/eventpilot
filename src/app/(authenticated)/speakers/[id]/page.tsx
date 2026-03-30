'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { SpeakerForm } from '@/components/SpeakerForm';

export default function SpeakerDetailPage() {
  const params = useParams();
  const speaker = useQuery(api.speakers.getById, params.id ? { id: params.id as Id<'speakers'> } : 'skip');

  if (!speaker) return <div className="p-6 text-muted-foreground">Loading speaker...</div>;

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">{speaker.firstName} {speaker.lastName}</h1>
      <SpeakerForm speaker={speaker} />
    </div>
  );
}
