'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { SponsorForm } from '@/components/SponsorForm';

export default function SponsorDetailPage() {
  const params = useParams();
  const sponsor = useQuery(api.sponsors.getById, params.id ? { id: params.id as Id<'sponsors'> } : 'skip');

  if (!sponsor) return <div className="p-6 text-muted-foreground">Loading sponsor...</div>;

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">{sponsor.organizationName}</h1>
      <SponsorForm sponsor={sponsor} />
    </div>
  );
}
