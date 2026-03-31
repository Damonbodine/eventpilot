"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";

export function AttentionEvents() {
  const events = useQuery(api.events.getAttentionNeeded);

  if (!events) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangleIcon className="h-4 w-4 text-amber-400" />
            Events Needing Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangleIcon className="h-4 w-4 text-amber-400" />
          Events Needing Attention
          {events.length > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs">
              {events.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">All events are on track.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event: { _id: string; name: string; status: string; startDate: string | number; reason?: string }) => (
              <div
                key={event._id}
                className="flex items-start justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">{event.name}</p>
                  <p className="text-xs text-amber-400">
                    {event.reason ?? event.status} · {formatDate(event.startDate)}
                  </p>
                </div>
                <Link href={`/events/${event._id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>Fix</Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}