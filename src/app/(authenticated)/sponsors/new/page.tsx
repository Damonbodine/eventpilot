'use client';

import { SponsorForm } from '@/components/SponsorForm';

export default function SponsorCreatePage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Add Sponsor</h1>
      </div>
      <SponsorForm />
    </div>
  );
}
