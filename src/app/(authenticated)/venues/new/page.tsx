'use client';

import { VenueForm } from '@/components/VenueForm';

export default function VenueCreatePage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Add Venue</h1>
      </div>
      <VenueForm />
    </div>
  );
}
