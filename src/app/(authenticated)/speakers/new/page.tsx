'use client';

import { SpeakerForm } from '@/components/SpeakerForm';

export default function SpeakerCreatePage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Add Speaker</h1>
      </div>
      <SpeakerForm />
    </div>
  );
}
