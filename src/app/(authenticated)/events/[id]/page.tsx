'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams, useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { EventDetailHeader } from '@/components/EventDetailHeader';
import { EventRegistrationStats } from '@/components/EventRegistrationStats';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const event = useQuery(api.events.getById, params.id ? { id: params.id as Id<'events'> } : 'skip');

  const publishEvent = useMutation(api.events.publish);
  const cancelEvent = useMutation(api.events.cancel);
  const duplicateEvent = useMutation(api.events.duplicate);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!event) return <div className="p-6 text-muted-foreground">Loading event...</div>;

  const handleEdit = () => {
    router.push(`/events/${event._id}/edit`);
  };

  const handlePublish = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await publishEvent({ id: event._id });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to publish event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await cancelEvent({ id: event._id });
      setShowCancelDialog(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      const newEventId = await duplicateEvent({ id: event._id });
      router.push(`/events/${newEventId}`);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to duplicate event');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {actionError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}
      <EventDetailHeader
        event={event}
        onEdit={handleEdit}
        onPublish={handlePublish}
        onCancel={() => setShowCancelDialog(true)}
        onDuplicate={handleDuplicate}
      />
      <EventRegistrationStats eventId={event._id} />

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel &quot;{event.name}&quot;? This will also cancel all active registrations for this event. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={actionLoading}>
              Keep Event
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
              {actionLoading ? 'Cancelling...' : 'Cancel Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
